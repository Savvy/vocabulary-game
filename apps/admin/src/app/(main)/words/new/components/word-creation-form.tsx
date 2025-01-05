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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Category, Language } from "@vocab/database"
import { WordImageUpload } from "./word-image-upload"

const formSchema = z.object({
    word: z.string().min(1, "Word is required"),
    translation: z.string().min(1, "Translation is required"),
    categoryId: z.string().min(1, "Category is required"),
    sourceLanguageId: z.string().min(1, "Source language is required"),
    targetLanguageId: z.string().min(1, "Target language is required"),
    imageUrl: z.string().optional(),
    options: z.array(z.string()).min(3, "At least 3 options are required"),
    notes: z.string().optional(),
})

interface WordCreationFormProps {
    categories: Category[]
    languages: Language[]
}

export function WordCreationForm({ categories, languages }: WordCreationFormProps) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            word: "",
            translation: "",
            options: [],
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)

            const response = await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) throw new Error("Failed to create word")

            toast({
                title: "Word created",
                description: "The word has been successfully created.",
            })

            router.push("/words")
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Failed to create word. Please try again.",
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
                    {step === 1 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="word"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Word</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter word" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="translation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Translation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter translation" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="sourceLanguageId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Source Language</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select source language" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {languages.map((language) => (
                                                        <SelectItem key={language.id} value={language.id}>
                                                            {language.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetLanguageId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Target Language</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select target language" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {languages.map((language) => (
                                                        <SelectItem key={language.id} value={language.id}>
                                                            {language.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Word Image</FormLabel>
                                        <FormControl>
                                            <WordImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                onRemove={() => field.onChange("")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="options"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Options</FormLabel>
                                        <div className="space-y-2">
                                            {[0, 1, 2].map((index) => (
                                                <FormControl key={index}>
                                                    <Input
                                                        placeholder={`Option ${index + 1}`}
                                                        value={field.value[index] || ""}
                                                        onChange={(e) => {
                                                            const newOptions = [...field.value]
                                                            newOptions[index] = e.target.value
                                                            field.onChange(newOptions)
                                                        }}
                                                    />
                                                </FormControl>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add any additional notes..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep((s) => Math.max(1, s - 1))}
                            disabled={step === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            type={step === 3 ? "submit" : "button"}
                            onClick={() => step < 3 && setStep((s) => s + 1)}
                            disabled={isSubmitting}
                        >
                            {step === 3 ? "Create Word" : "Next"}
                        </Button>
                    </div>
                </Card>
            </form>
        </Form>
    )
} 