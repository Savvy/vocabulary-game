import { NextResponse } from "next/server"
import { prisma } from "@vocab/database"

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Check if category has words
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { words: true }
                }
            }
        })

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            )
        }

        if (category._count.words > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with associated words" },
                { status: 400 }
            )
        }

        await prisma.category.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete category:', error)
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        )
    }
} 