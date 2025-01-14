'use client'

import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSocket } from "@/hooks/useSocket"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryCombobox, Category } from "@/components/ui/category-combobox"

const gameConfigSchema = z.object({
    maxPlayers: z.number().min(2).max(8),
    roundTimeLimit: z.number().min(10).max(300),
    maxRounds: z.number().min(1).max(20),
    inputType: z.enum(['multiple-choice', 'single-choice']),
    sourceLanguage: z.string().min(2),
    targetLanguage: z.string().min(2),
    categories: z.array(z.string())
    /* z.array(z.object({
        id: z.string(),
        name: z.string(),
        style: z.object({
            backgroundColor: z.string(),
            textColor: z.string()
        }).optional()
    })) */
})

type GameConfigFormValues = z.infer<typeof gameConfigSchema>

interface GameConfig {
    maxPlayers: number
    roundTimeLimit: number
    maxRounds: number
    inputType: 'multiple-choice' | 'single-choice'
    sourceLanguage: string
    targetLanguage: string
    categories: Array<{
        id: string
        name: string
        style?: {
            backgroundColor: string
            textColor: string
        }
    }>
}

interface GameConfigDialogProps {
    initialConfig: GameConfig
}

export function GameConfigDialog({ initialConfig }: GameConfigDialogProps) {
    const [open, setOpen] = useState<boolean>(false)
    const { socket } = useSocket()
    const { toast } = useToast()

    const form = useForm<GameConfigFormValues>({
        resolver: zodResolver(gameConfigSchema),
        defaultValues: {
            ...initialConfig,
            categories: initialConfig.categories.map(category => category.id)
        }
    })

    function onSubmit(data: GameConfigFormValues) {
        socket?.emit('game:updateConfig', data)
        setOpen(false)
        toast({
            title: "Settings Updated",
            description: "Game configuration has been updated successfully.",
        })
    }

    async function searchCategories(query: string): Promise<Category[]> {
        const { sourceLanguage, targetLanguage } = form.getValues()
        const response = await fetch(`/api/categories/search?q=${encodeURIComponent(query)}&sourceLanguage=${sourceLanguage}&targetLanguage=${targetLanguage}`)
        
        if (!response.ok) {
            toast({
                title: "Error",
                description: "Failed to search categories",
                variant: "destructive",
            })
            return []
        }

        type CategoryResponse = {
            id: string;
            label: string;
            translation?: string;
            style?: {
                backgroundColor: string;
                textColor: string;
            };
        }

        const categories = await response.json() as CategoryResponse[]
        return categories.map((category) => ({
            label: category.label,
            id: category.id
        }))
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="lg"
                    className="bg-secondary/30 backdrop-blur h-12"
                >
                    <Settings className="w-5 h-5 text-indigo-400" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-3xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Game Configuration</AlertDialogTitle>
                            <AlertDialogDescription>
                                Configure the game settings and categories.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-6 py-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Game Rules</CardTitle>
                                    <CardDescription>
                                        Set the rules for the game.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="maxPlayers"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Players</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="roundTimeLimit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Round Time (seconds)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="maxRounds"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Rounds</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="inputType"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Multiple Choice
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Enable multiple choice answers instead of text input
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value === 'multiple-choice'}
                                                        onCheckedChange={(checked) =>
                                                            field.onChange(checked ? 'multiple-choice' : 'single-choice')
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>


                            <Card>
                                <CardHeader>
                                    <CardTitle>Language Settings</CardTitle>
                                    <CardDescription>
                                        Choose your source and target languages
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">

                                        <FormField
                                            control={form.control}
                                            name="sourceLanguage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Source Language</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select language" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="es">Spanish</SelectItem>
                                                            <SelectItem value="fr">French</SelectItem>
                                                            <SelectItem value="it">Italian</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="targetLanguage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Language</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select language" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="es">Spanish</SelectItem>
                                                            <SelectItem value="fr">French</SelectItem>
                                                            <SelectItem value="it">Italian</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Word Categories</CardTitle>
                                    <CardDescription>
                                        Categories are used to filter the words in the game. You can add more categories by searching for them.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="categories"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <CategoryCombobox
                                                        selected={field.value}
                                                        onChange={field.onChange}
                                                        onSearch={searchCategories}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Search and select multiple categories
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <AlertDialogFooter className="flex items-center">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    )
} 