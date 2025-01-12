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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSocket } from "@/hooks/useSocket"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const gameConfigSchema = z.object({
  maxPlayers: z.number().min(2).max(8),
  roundTimeLimit: z.number().min(10).max(300),
  maxRounds: z.number().min(1).max(20),
  inputType: z.enum(['multiple-choice', 'single-choice']),
  sourceLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    style: z.object({
      backgroundColor: z.string(),
      textColor: z.string()
    }).optional()
  }))
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
        defaultValues: initialConfig
    })

    function onSubmit(data: GameConfigFormValues) {
        socket?.emit('game:updateConfig', data)
        setOpen(false)
        toast({
            title: "Settings Updated",
            description: "Game configuration has been updated successfully.",
        })
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
            <AlertDialogContent className="sm:max-w-[600px]">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Game Configuration</AlertDialogTitle>
                        <AlertDialogDescription>
                            Configure the game settings and categories.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="maxPlayers">Max Players</Label>
                            <Input
                                {...form.register("maxPlayers", { valueAsNumber: true })}
                                type="number"
                                min={2}
                                max={8}
                            />
                            {form.formState.errors.maxPlayers && (
                                <p className="text-sm text-destructive">{form.formState.errors.maxPlayers.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="roundTimeLimit">Round Time (seconds)</Label>
                            <Input
                                {...form.register("roundTimeLimit", { valueAsNumber: true })}
                                type="number"
                                min={10}
                                max={300}
                            />
                            {form.formState.errors.roundTimeLimit && (
                                <p className="text-sm text-destructive">{form.formState.errors.roundTimeLimit.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="maxRounds">Max Rounds</Label>
                            <Input
                                {...form.register("maxRounds", { valueAsNumber: true })}
                                type="number"
                                min={1}
                                max={20}
                            />
                            {form.formState.errors.maxRounds && (
                                <p className="text-sm text-destructive">{form.formState.errors.maxRounds.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="inputType">Multiple Choice</Label>
                            <Switch
                                id="inputType"
                                checked={form.watch("inputType") === 'multiple-choice'}
                                onCheckedChange={(checked) => 
                                    form.setValue("inputType", checked ? 'multiple-choice' : 'single-choice')
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sourceLanguage">Source Language</Label>
                            <Select
                                value={form.watch("sourceLanguage")}
                                onValueChange={(value) => form.setValue("sourceLanguage", value)}
                            >
                                <SelectTrigger id="sourceLanguage">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="it">Italian</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.sourceLanguage && (
                                <p className="text-sm text-destructive">{form.formState.errors.sourceLanguage.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="targetLanguage">Target Language</Label>
                            <Select
                                value={form.watch("targetLanguage")}
                                onValueChange={(value) => form.setValue("targetLanguage", value)}
                            >
                                <SelectTrigger id="targetLanguage">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="it">Italian</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.targetLanguage && (
                                <p className="text-sm text-destructive">{form.formState.errors.targetLanguage.message}</p>
                            )}
                        </div>
                    </div>
                    <AlertDialogFooter className="flex items-center">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                        >
                            Save Changes
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
} 