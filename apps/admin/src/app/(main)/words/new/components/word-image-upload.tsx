"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Image as ImageIcon, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface WordImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove: () => void
}

export function WordImageUpload({
    value,
    onChange,
    onRemove,
}: WordImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        try {
            setIsUploading(true)
            const file = acceptedFiles[0]
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) throw new Error("Upload failed")

            const { url } = await response.json()
            onChange(url)
        } catch (error) {
            console.error("Upload error:", error)
        } finally {
            setIsUploading(false)
        }
    }, [onChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp"],
        },
        maxFiles: 1,
    })

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative h-96 w-fulloverflow-hidden rounded-lg border">
                    <Image
                        src={value}
                        alt="Word image"
                        fill
                        className="object-cover"
                    />
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute right-2 top-2"
                        onClick={onRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className="flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition hover:bg-accent"
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-10 w-10" />
                            <div className="text-center">
                                {isDragActive ? (
                                    <p>Drop the image here</p>
                                ) : (
                                    <p>
                                        Drag and drop an image here, or click to select
                                    </p>
                                )}
                                <p className="text-xs">
                                    Supported formats: PNG, JPG, JPEG, WebP
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 