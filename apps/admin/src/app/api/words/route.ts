import { NextResponse } from "next/server"
import { z } from "zod"
import { getWords, prisma } from "@vocab/database"

const wordSchema = z.object({
    translations: z.array(z.object({
        languageId: z.string().min(1),
        translation: z.string().min(1),
    })).min(2),
    categoryId: z.string().min(1),
    imageUrl: z.string(),
})

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('size') || '10')
        const search = searchParams.get('search') || undefined
        const category = searchParams.get('category') || undefined
        const language = searchParams.get('language') || undefined
        const sortField = searchParams.get('sortField') || undefined
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

        let validCategoryIds = undefined
        if (category && category.includes(',')) {
            validCategoryIds = category.split(',')
        } else if (category) {
            validCategoryIds = [category]
        }

        const result = await getWords({
            page,
            pageSize,
            search,
            categoryIds: validCategoryIds,
            languageId: language,
            sortBy: sortField,
            sortOrder
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to fetch words:', error)
        return NextResponse.json(
            { error: "Failed to fetch words" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const body = wordSchema.parse(json)

        const word = await prisma.word.create({
            data: {
                categoryId: body.categoryId,
                imageUrl: body.imageUrl,
                translations: {
                    create: body.translations
                }
            },
            include: {
                category: {
                    include: {
                        translations: true
                    }
                },
                translations: {
                    include: {
                        language: true
                    }
                }
            },
        })

        return NextResponse.json(word)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}