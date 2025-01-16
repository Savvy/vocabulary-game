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

        const category = await prisma.category.create({
            data: {
                categoryCode: body.categoryCode,
                backgroundColor: body.backgroundColor,
                textColor: body.textColor || "#ffffff",
                translations: {
                    create: body.translations.map(translation => ({
                        languageId: translation.languageId,
                        translation: translation.translation
                    }))
                }
            },
            include: {
                translations: {
                    include: {
                        language: true
                    }
                }
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
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