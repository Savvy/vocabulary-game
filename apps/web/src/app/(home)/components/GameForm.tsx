"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                        id="nickname"
                        {...form.register("nickname")}
                        placeholder="Enter your nickname"
                        required
                        disabled={isSubmitting}
                        aria-invalid={!!form.formState.errors.nickname}
                    />
                    {form.formState.errors.nickname && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.nickname.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="roomId">Room ID (optional)</Label>
                    <Input
                        id="roomId"
                        {...form.register("roomId")}
                        placeholder="Enter room ID to join existing game"
                        disabled={isSubmitting}
                    />
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