import { CategoryEditHeader } from "./components/category-edit-header"
import { CategoryEditForm } from "./components/category-edit-form"
import { prisma } from "@vocab/database"
import { notFound } from "next/navigation"

interface CategoryEditPageProps {
    params: { id: string }
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
    const param = await params
    const [category, languages] = await Promise.all([
        prisma.category.findUnique({
            where: { id: param.id },
            include: {
                translations: {
                    include: {
                        language: true
                    }
                }
            }
        }),
        prisma.language.findMany({
            orderBy: {
                name: 'asc'
            }
        })
    ])

    if (!category) notFound()

    return (
        <>
            <CategoryEditHeader />
            <div className="flex-1 flex flex-col gap-4 p-4">
                <CategoryEditForm category={category} languages={languages} />
            </div>
        </>
    )
} 