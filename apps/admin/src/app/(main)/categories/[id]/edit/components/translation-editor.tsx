"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Language } from "@vocab/database"
import { X } from "lucide-react"
import { useFieldArray, useFormContext } from "react-hook-form"

interface Translation {
    languageId: string
    translation: string
}

interface FormValues {
    categoryCode: string
    translations: Translation[]
    backgroundColor: string
    textColor?: string
}

interface TranslationEditorProps {
    languages: Language[]
}

export function TranslationEditor({ languages }: TranslationEditorProps) {
    const { control, register } = useFormContext<FormValues>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "translations"
    })

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                        <Select
                            defaultValue={field.languageId}
                            onValueChange={(value) => {
                                const event = {
                                    target: { value },
                                    type: 'change'
                                }
                                register(`translations.${index}.languageId`).onChange(event)
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((language) => (
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
                            placeholder="Enter translation"
                            defaultValue={field.translation}
                            {...register(`translations.${index}.translation`)}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                onClick={() => append({ languageId: "", translation: "" })}
            >
                Add Translation
            </Button>
        </div>
    )
} 