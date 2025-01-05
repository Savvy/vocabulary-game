import { NextResponse } from "next/server"
import { prisma } from "@vocab/database"
import { z } from "zod"

const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
})

const updateCategorySchema = createCategorySchema.partial()

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'asc'
            },
            include: {
                _count: {
                    select: { words: true }
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
                name: body.name,
                description: body.description,
                backgroundColor: body.backgroundColor,
            }
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

        const category = await prisma.category.update({
            where: { id },
            data: body
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