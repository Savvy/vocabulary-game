"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Hash, UserCircle } from "lucide-react"

const formSchema = z.object({
    nickname: z.string().min(1, "Nickname is required"),
    roomId: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

type GameFormProps = {
    handleSubmit: (data: FormValues) => void
    isSubmitting?: boolean
}

export default function GameForm({ handleSubmit, isSubmitting = false }: GameFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nickname: "",
            roomId: ""
        }
    })

    return (
        <div className="w-full">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-indigo-300">Nickname</Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                            <UserCircle className="h-5 w-5" />
                        </div>
                        <Input
                            id="nickname"
                            {...form.register("nickname")}
                            placeholder="Enter your nickname"
                            required
                            disabled={isSubmitting}
                            aria-invalid={!!form.formState.errors.nickname}
                            className="pl-10 h-11"
                        />
                    </div>
                    {form.formState.errors.nickname && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.nickname.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="roomId" className="text-indigo-300">Room ID (optional)</Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                            <Hash className="h-5 w-5" />
                        </div>
                        <Input
                            id="roomId"
                            {...form.register("roomId")}
                            placeholder="Enter room ID to join existing game"
                            disabled={isSubmitting}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {form.watch("roomId") ? 'Join Game' : 'Create Game'}
                    </Button>
                </div>
            </form>
        </div>
    )
}