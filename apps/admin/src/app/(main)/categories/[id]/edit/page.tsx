import { CategoryEditHeader } from "./components/category-edit-header"
import { CategoryEditForm } from "./components/category-edit-form"
import { prisma } from "@vocab/database"
import { notFound } from "next/navigation"

interface CategoryEditPageProps {
    params: { id: string }
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
    const category = await prisma.category.findUnique({
        where: { id: params.id }
    })

    if (!category) notFound()

    return (
        <>
            <CategoryEditHeader />
            <div className="flex-1 flex flex-col gap-4 p-4">
                <CategoryEditForm category={category} />
            </div>
        </>
    )
} 