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
import { Category } from "@vocab/database"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    /* description: z.string().optional(), */
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryEditFormProps {
    category: Category
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category.name,
            /* description: category.description ?? "", */
            backgroundColor: category.backgroundColor,
        },
    })

    async function onSubmit(values: FormValues) {
        try {
            setIsSubmitting(true)

            const response = await fetch(`/api/categories`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: category.id,
                    ...values,
                }),
            })

            if (!response.ok) throw new Error("Failed to update category")

            queryClient.invalidateQueries({ queryKey: ['categories'] })

            toast({
                title: "Category updated",
                description: "The category has been successfully updated.",
            })

            router.push("/categories")
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Failed to update category. Please try again.",
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
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter category name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="backgroundColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
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
                        {/* <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter category description..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
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