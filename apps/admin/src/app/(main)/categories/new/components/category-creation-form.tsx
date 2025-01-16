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
import { useQueryClient } from "@tanstack/react-query"
import { TranslationsEditor } from "./translations-editor"

const formSchema = z.object({
    categoryCode: z.string().min(1, "Category code is required"),
    translations: z.array(z.object({
        languageId: z.string(),
        translation: z.string()
    })),
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
    textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CategoryCreationForm() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryCode: "",
            translations: [],
            backgroundColor: "#000000",
            textColor: "#ffffff",
        },
    })

    async function onSubmit(values: FormValues) {
        try {
            setIsSubmitting(true)

            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) throw new Error("Failed to create category")

            toast({
                title: "Category created",
                description: "The category has been successfully created.",
            })

            queryClient.invalidateQueries({ queryKey: ['categories'] })

            router.push("/categories")
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Failed to create category. Please try again.",
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <FormField
                            control={form.control}
                            name="translations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <TranslationsEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="mt-6"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Create Category"
                        )}
                    </Button>
                </Card>
            </form>
        </Form>
    )
} 