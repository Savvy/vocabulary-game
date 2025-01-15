import { NextResponse } from "next/server"
import { prisma } from "@vocab/database"
import { z } from "zod"

const createCategorySchema = z.object({
    categoryCode: z.string().min(1, "Category code is required"),
    translations: z.array(z.object({
        languageId: z.string(),
        translation: z.string()
    })),
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
    textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
})

const updateCategorySchema = createCategorySchema.partial()

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                categoryCode: 'asc'
            },
            include: {
                _count: {
                    select: { words: true }
                },
                translations: {
                    include: {
                        language: {
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const body = createCategorySchema.parse(json)

        const category = await prisma.$transaction(async (tx) => {
            // Create the category first
            const newCategory = await tx.category.create({
                data: {
                    categoryCode: body.categoryCode,
                    backgroundColor: body.backgroundColor,
                    textColor: body.textColor || "#ffffff",
                }
            })

            // Create translations one by one
            for (const translation of body.translations) {
                await tx.categoryTranslation.create({
                    data: {
                        categoryId: newCategory.id,
                        languageId: translation.languageId,
                        translation: translation.translation
                    }
                })
            }

            // Return the category with translations
            return tx.category.findUnique({
                where: { id: newCategory.id },
                include: {
                    translations: {
                        include: {
                            language: true
                        }
                    }
                }
            })
        })

        return NextResponse.json(category)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            )
        }

        console.error('Failed to create category:', error)
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const json = await request.json()
        const { id, ...updateData } = json
        
        if (!id) {
            return NextResponse.json(
                { error: "Category ID is required" },
                { status: 400 }
            )
        }

        const body = updateCategorySchema.parse(updateData)

        const category = await prisma.$transaction(async (tx) => {
            // Update the category first
            await tx.category.update({
                where: { id },
                data: {
                    categoryCode: body.categoryCode,
                    backgroundColor: body.backgroundColor,
                    textColor: body.textColor,
                }
            })

            if (body.translations) {
                // Delete existing translations
                await tx.categoryTranslation.deleteMany({
                    where: { categoryId: id }
                })

                // Create new translations
                for (const translation of body.translations) {
                    await tx.categoryTranslation.create({
                        data: {
                            categoryId: id,
                            languageId: translation.languageId,
                            translation: translation.translation
                        }
                    })
                }
            }

            // Return the updated category with translations
            return tx.category.findUnique({
                where: { id },
                include: {
                    translations: {
                        include: {
                            language: true
                        }
                    }
                }
            })
        })

        return NextResponse.json(category)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            )
        }

        console.error('Failed to update category:', error)
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        )
    }
}