"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

interface Language {
    id: string
    code: string
    name: string
}

interface Translation {
    languageId: string
    translation: string
}

interface TranslationsEditorProps {
    value: Translation[]
    onChange: (value: Translation[]) => void
}

export function TranslationsEditor({ value, onChange }: TranslationsEditorProps) {
    const { data: languages } = useQuery<Language[]>({
        queryKey: ['languages'],
        queryFn: async () => {
            const response = await fetch('/api/languages')
            if (!response.ok) throw new Error('Failed to fetch languages')
            return response.json()
        }
    })

    const addTranslation = () => {
        if (!languages?.length) return
        onChange([...value, { languageId: languages[0].id, translation: '' }])
    }

    const removeTranslation = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const updateTranslation = (index: number, field: keyof Translation, newValue: string) => {
        onChange(
            value.map((t, i) =>
                i === index ? { ...t, [field]: newValue } : t
            )
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Translations</h3>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addTranslation}
                    disabled={!languages?.length}
                >
                    Add Translation
                </Button>
            </div>
            <div className="space-y-3">
                {value.map((translation, index) => (
                    <Card key={index} className="p-4">
                        <div className="flex gap-4">
                            <Select
                                value={translation.languageId}
                                onValueChange={(newValue) =>
                                    updateTranslation(index, 'languageId', newValue)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages?.map((language) => (
                                        <SelectItem
                                            key={language.id}
                                            value={language.id}
                                        >
                                            {language.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                value={translation.translation}
                                onChange={(e) =>
                                    updateTranslation(index, 'translation', e.target.value)
                                }
                                placeholder="Enter translation"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTranslation(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
} 