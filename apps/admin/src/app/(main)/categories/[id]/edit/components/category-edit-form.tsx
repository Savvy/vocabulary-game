"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Category, CategoryTranslation, Language } from "@vocab/database"
import { useQueryClient } from "@tanstack/react-query"
import { TranslationEditor } from "./translation-editor"

const formSchema = z.object({
    categoryCode: z.string().min(1, "Category code is required"),
    translations: z.array(z.object({
        languageId: z.string().min(1, "Language is required"),
        translation: z.string().min(1, "Translation is required")
    })),
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
    textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryEditFormProps {
    category: Category & {
        translations: (CategoryTranslation & {
            language: Language
        })[]
    }
    languages: Language[]
}

export function CategoryEditForm({ category, languages }: CategoryEditFormProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryCode: category.categoryCode,
            backgroundColor: category.backgroundColor,
            textColor: category.textColor ?? undefined,
            translations: category.translations.map(t => ({
                languageId: t.languageId,
                translation: t.translation
            }))
        },
    })

    async function onSubmit(values: FormValues) {
        try {
            setIsSubmitting(true)

            const response = await fetch(`/api/categories/${category.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to update category")
            }

            await queryClient.invalidateQueries({ queryKey: ['categories'] })

            toast({
                title: "Category updated",
                description: "The category has been successfully updated.",
            })

            router.push("/categories")
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update category. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Card className="p-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="categoryCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter category code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="translations"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Translations</FormLabel>
                                    <FormControl>
                                        <TranslationEditor languages={languages} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="backgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Background Color</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-4 items-center">
                                                <Input type="color" {...field} className="w-24 h-10" />
                                                <Input {...field} placeholder="#000000" className="flex-1" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="textColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Text Color</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-4 items-center">
                                                <Input type="color" {...field} className="w-24 h-10" />
                                                <Input {...field} placeholder="#ffffff" className="flex-1" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="mt-6"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Update Category"
                        )}
                    </Button>
                </Card>
            </form>
        </Form>
    )
} 