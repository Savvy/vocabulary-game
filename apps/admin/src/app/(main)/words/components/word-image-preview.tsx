import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface WordImagePreviewProps {
    src: string
    alt: string
    className?: string
}

export function WordImagePreview({ src, alt, className }: WordImagePreviewProps) {
    if (!src) return null

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={cn("relative cursor-pointer group", className)}>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                </div>
            </DialogTrigger>
            <DialogTitle className="hidden">{alt}</DialogTitle>
            <DialogDescription className="hidden">{alt}</DialogDescription>
            <DialogContent className="max-w-2xl">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
} 