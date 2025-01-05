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
import { useState } from "react"

interface BulkDeleteWordsDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    count: number
}

export function BulkDeleteWordsDialog({
    isOpen,
    onClose,
    onConfirm,
    count,
}: BulkDeleteWordsDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    async function handleConfirm() {
        try {
            setIsDeleting(true)
            await onConfirm()
            toast({
                title: "Words deleted",
                description: `Successfully deleted ${count} words`,
            })
            onClose()
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete words. Please try again.",
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
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete {count} selected words and remove them from
                        all games. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : `Delete ${count} words`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 