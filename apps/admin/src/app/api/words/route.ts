import { NextResponse } from "next/server"
import { z } from "zod"
import { getWords, prisma } from "@vocab/database"

// Input validation schemas
const sortByEnum = z.enum(['createdAt', 'translations', 'updatedAt'])
const sortOrderEnum = z.enum(['asc', 'desc'])
const querySchema = z.object({
    page: z.coerce.number().positive().default(1),
    pageSize: z.coerce.number().positive().default(10),
    search: z.string().optional(),
    category: z.string().optional(),
    language: z.string().optional(),
    sortField: sortByEnum.optional().default('createdAt'),
    sortOrder: sortOrderEnum.optional().default('desc'),
})

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
        // Parse and validate query parameters
        const params = querySchema.parse({
            page: searchParams.get('page') ?? undefined,
            pageSize: searchParams.get('pageSize') ?? undefined,
            search: searchParams.get('search') ?? undefined,
            category: searchParams.get('category') ?? undefined,
            language: searchParams.get('language') ?? undefined,
            sortField: searchParams.get('sortField') ?? undefined,
            sortOrder: searchParams.get('sortOrder') ?? undefined,
        })

        // Process category IDs
        const categoryIds = params.category?.split(',').filter(Boolean)

        const result = await getWords({
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
            categoryIds: categoryIds,
            languageId: params.language,
            sortBy: params.sortField,
            sortOrder: params.sortOrder,
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to fetch words:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid parameters", details: error.errors },
                { status: 400 }
            )
        }

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
        console.error('Failed to create word:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to create word" },
            { status: 500 }
        )
    }
}