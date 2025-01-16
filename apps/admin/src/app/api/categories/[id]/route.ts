import { NextResponse } from "next/server"
import { prisma } from "@vocab/database"
import { z } from "zod"

const updateCategorySchema = z.object({
    categoryCode: z.string().min(1, "Category code is required"),
    translations: z.array(z.object({
        languageId: z.string(),
        translation: z.string()
    })),
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
    textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
}).partial()

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params
        const json = await request.json()
        const { ...updateData } = json

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


export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params

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