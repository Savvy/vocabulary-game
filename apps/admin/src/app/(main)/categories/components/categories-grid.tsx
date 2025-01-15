"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Category, CategoryTranslation, Language } from "@vocab/database"
import { Input } from "@/components/ui/input"
import { DeleteCategoryDialog } from "./delete-category-dialog"
import { toast } from "@/hooks/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CategoryCard } from "./category-card"
import { AnimatePresence, motion } from "framer-motion"
import { CategoriesGridSkeleton } from "./skeleton/categories-grid-skeleton"

export interface CategoryWithCount extends Category {
    _count: {
        words: number
    }
    translations: (CategoryTranslation & {
        language: Language
    })[]
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: -40 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    }
}

export function CategoriesGrid() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null)

    const { data: categories = [], isLoading } = useQuery<CategoryWithCount[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await fetch('/api/categories')
            if (!response.ok) throw new Error('Failed to fetch categories')
            return response.json()
        }
    })

    if (isLoading) return <CategoriesGridSkeleton />

    const filteredCategories = categories.filter((category) =>
        category.categoryCode.toLowerCase().includes(search.toLowerCase()) ||
        category.translations.some(t => 
            t.translation.toLowerCase().includes(search.toLowerCase())
        )
    )

    const handleDelete = async (category: CategoryWithCount) => {
        try {
            const response = await fetch(`/api/categories/${category.id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete category")

            queryClient.invalidateQueries({ queryKey: ['categories'] })

            toast({
                title: "Category deleted",
                description: "The category has been successfully deleted.",
            })
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete category. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Input
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <AnimatePresence mode="wait">
                {!isLoading && (
                    <motion.div
                        key="categories-grid"
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                    >
                        {filteredCategories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onDeleteClick={setCategoryToDelete}
                                variants={item}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <DeleteCategoryDialog
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={() => {
                    if (categoryToDelete) {
                        handleDelete(categoryToDelete)
                        setCategoryToDelete(null)
                    }
                }}
                categoryCode={categoryToDelete?.categoryCode || ""}
            />
        </div>
    )
}