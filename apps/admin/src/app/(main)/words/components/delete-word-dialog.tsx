"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface DeleteWordDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    wordText: string
}

export function DeleteWordDialog({
    isOpen,
    onClose,
    onConfirm,
    wordText,
}: DeleteWordDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    async function handleConfirm() {
        try {
            setIsDeleting(true)
            await onConfirm()
            toast({
                title: "Word deleted",
                description: `Successfully deleted "${wordText}"`,
            })
            onClose()
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete word. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the word &quot;{wordText}&quot; and remove it from all
                        games. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 