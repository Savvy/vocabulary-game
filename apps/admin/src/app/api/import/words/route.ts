import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vocab/database";
import { parse } from "csv-parse/sync";
import { z } from "zod";

// Schema for language translations in CSV
// Format: lang_CODE (e.g., lang_en, lang_es, lang_fr)
// const languageSchema = z.record(z.string().regex(/^lang_[a-z]{2}$/), z.string());

const csvRowSchema = z.object({
    category: z.string().trim().min(1),
    imageUrl: z.string().trim().url(),
}).catchall(
    z.string().trim().min(1)
).refine(
    (data) => {
        // Ensure at least one language field exists and all additional fields start with 'lang_'
        const languageFields = Object.entries(data).filter(([key]) => key !== 'category' && key !== 'imageUrl');
        return languageFields.length > 0 && languageFields.every(([key]) => key.startsWith('lang_'));
    },
    {
        message: "At least one language translation must be provided and all language fields must start with 'lang_'"
    }
);

type CSVRow = z.infer<typeof csvRowSchema>;

interface ImportResult {
    success: boolean;
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    
    if (!file) {
        return NextResponse.json(
            { success: false, error: "No file provided" },
            { status: 400 }
        );
    }

    const content = await file.text();
    const result: ImportResult = {
        success: true,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [],
    };

    try {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
        }) as CSVRow[];

        console.log('Parsed records:', records);

        // Get all available languages from the database
        const languages = await prisma.language.findMany();
        const languageMap = new Map(languages.map(lang => [lang.code, lang.id]));

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            try {
                console.log('Record to validate:', record);
                console.log('Record keys:', Object.keys(record));
                
                // Try validating each field separately to identify the specific issue
                try {
                    const categoryResult = z.string().min(1).safeParse(record.category);
                    console.log('Category validation:', categoryResult);
                    
                    const imageUrlResult = z.string().url().or(z.string().min(1)).safeParse(record.imageUrl);
                    console.log('ImageUrl validation:', imageUrlResult);
                    
                    const languageEntries = Object.entries(record).filter(([key]) => key.startsWith('lang_'));
                    console.log('Language entries:', languageEntries);
                } catch (validationError) {
                    console.error('Validation debug error:', validationError);
                }

                const validatedRow = csvRowSchema.parse(record);

                // Process the row in a transaction
                await prisma.$transaction(async (tx) => {
                    // Get or create category
                    const category = await tx.category.upsert({
                        where: { categoryCode: validatedRow.category },
                        create: {
                            categoryCode: validatedRow.category,
                            backgroundColor: "#000000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16)),
                            textColor: "#ffffff",
                        },
                        update: {},
                    });

                    // Extract and validate language translations
                    const translations = Object.entries(validatedRow)
                        .filter(([key]) => key.startsWith('lang_'))
                        .map(([key, translation]) => {
                            const langCode = key.replace('lang_', '');
                            const languageId = languageMap.get(langCode);
                            
                            if (!languageId) {
                                throw new Error(`Language code ${langCode} not found in database`);
                            }

                            return {
                                langCode,
                                languageId,
                                translation: translation.trim(),
                            };
                        });

                    if (translations.length === 0) {
                        throw new Error('No valid language translations found');
                    }

                    // Try to find an existing word by any of its translations
                    const existingWord = await tx.word.findFirst({
                        where: {
                            translations: {
                                some: {
                                    OR: translations.map(t => ({
                                        AND: {
                                            languageId: t.languageId,
                                            translation: t.translation,
                                        }
                                    }))
                                }
                            }
                        },
                        select: {
                            id: true,
                            translations: {
                                select: {
                                    languageId: true,
                                    translation: true,
                                    language: {
                                        select: {
                                            code: true
                                        }
                                    }
                                }
                            }
                        }
                    });

                    if (existingWord) {
                        // Word exists, add new translations
                        const existingLangIds = new Set(existingWord.translations.map(t => t.languageId));
                        const newTranslations = translations.filter(t => !existingLangIds.has(t.languageId));

                        // Check for conflicting translations
                        const conflictingTranslations = await tx.wordTranslation.findMany({
                            where: {
                                OR: newTranslations.map(t => ({
                                    AND: {
                                        languageId: t.languageId,
                                        translation: t.translation,
                                        NOT: {
                                            wordId: existingWord.id
                                        }
                                    }
                                }))
                            },
                            include: {
                                language: true
                            }
                        });

                        if (conflictingTranslations.length > 0) {
                            const conflicts = conflictingTranslations
                                .map(ct => `${ct.translation} (${ct.language.code})`)
                                .join(', ');
                            throw new Error(`Conflicting translations found: ${conflicts}`);
                        }

                        if (newTranslations.length > 0) {
                            // Add new translations
                            await tx.wordTranslation.createMany({
                                data: newTranslations.map(t => ({
                                    wordId: existingWord.id,
                                    languageId: t.languageId,
                                    translation: t.translation,
                                }))
                            });
                            result.updated++;
                        } else {
                            throw new Error('No new translations to add for existing word');
                        }
                    } else {
                        // Create new word with translations
                        await tx.word.create({
                            data: {
                                categoryId: category.id,
                                imageUrl: validatedRow.imageUrl,
                                translations: {
                                    create: translations.map(({ languageId, translation }) => ({
                                        languageId,
                                        translation,
                                    })),
                                },
                            },
                        });
                        result.created++;
                    }
                });
            } catch (error) {
                result.skipped++;
                result.errors.push({
                    row: i + 2, // +2 because of 0-based index and header row
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                continue;
            }
        }

        return NextResponse.json({
            ...result,
            message: `Processed ${records.length} records. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

/*
Example CSV format:

category,imageUrl,lang_en,lang_es,lang_fr
animals,https://example.com/dog.jpg,dog,perro,chien
animals,https://example.com/cat.jpg,cat,gato,chat
food,https://example.com/apple.jpg,apple,manzana,pomme

For adding new translations to existing words, use the same format.
The system will:
1. Match existing words by any translation
2. Add new translations if they don't exist
3. Skip if all translations already exist
4. Create new word if no match found
*/
