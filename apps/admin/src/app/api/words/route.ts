import { NextResponse } from "next/server"
import { z } from "zod"
import { getWords, prisma } from "@vocab/database"

const wordSchema = z.object({
    word: z.string().min(1),
    translation: z.string().min(1),
    categoryId: z.string().min(1),
    sourceLanguageId: z.string().min(1),
    targetLanguageId: z.string().min(1),
    imageUrl: z.string(),
    options: z.array(z.string()).min(3),
    /* notes: z.string().optional(), */
})

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('size') || '10')
        const search = searchParams.get('search') || undefined
        const category = searchParams.get('category') || undefined
        const source = searchParams.get('source') || undefined
        const target = searchParams.get('target') || undefined
        const sortField = searchParams.get('sortField') || undefined
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

        const result = await getWords({
            page,
            pageSize,
            search,
            categoryIds: category ? [category] : undefined,
            sourceLanguageIds: source ? [source] : undefined,
            targetLanguageIds: target ? [target] : undefined,
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
                word: body.word,
                translation: body.translation,
                categoryId: body.categoryId,
                sourceLanguageId: body.sourceLanguageId,
                targetLanguageId: body.targetLanguageId,
                imageUrl: body.imageUrl,
                options: body.options,
                /* notes: body.notes, */
            },
            include: {
                category: true,
                sourceLanguage: true,
                targetLanguage: true,
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