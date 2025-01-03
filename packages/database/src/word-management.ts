import { prisma } from './index';

export async function createWord(data: {
    word: string;
    translation: string;
    imageUrl: string;
    categoryId: string;
    sourceLanguageId: string;
    targetLanguageId: string;
    options: string[];
}) {
    return prisma.word.create({
        data: {
            word: data.word,
            translation: data.translation,
            imageUrl: data.imageUrl,
            options: data.options,
            category: { connect: { id: data.categoryId } },
            sourceLanguage: { connect: { id: data.sourceLanguageId } },
            targetLanguage: { connect: { id: data.targetLanguageId } }
        },
        include: {
            category: true,
            sourceLanguage: true,
            targetLanguage: true,
        },
    });
}

export async function getRandomWordsByCategory(
    categoryId: string,
    languageCode: string,
    count: number
) {
    const language = await prisma.language.findUnique({
        where: { code: languageCode }
    });

    if (!language) {
        throw new Error(`Language with code ${languageCode} not found`);
    }

    const words = await prisma.word.findMany({
        where: {
            categoryId,
            sourceLanguageId: language.id,
        },
        take: count,
        orderBy: {
            id: 'asc'
        },
        include: {
            category: true,
            sourceLanguage: true,
            targetLanguage: true,
        },
    });

    return words.length > 0 ? words.sort(() => Math.random() - 0.5) : words;
}

export async function getAllCategories() {
    return prisma.category.findMany();
}

export async function getAllLanguages() {
    return prisma.language.findMany();
}

export async function getRandomCategories(count: number = 6) {
    return prisma.$queryRaw<Array<{
        id: string;
        name: string;
        backgroundColor: string;
        textColor: string;
    }>>`
        SELECT 
            id,
            name,
            "backgroundColor",
            "textColor"
        FROM "Category"
        ORDER BY RANDOM()
        LIMIT ${count}
    `.then(categories => categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        style: {
            backgroundColor: cat.backgroundColor,
            textColor: cat.textColor
        }
    })));
}