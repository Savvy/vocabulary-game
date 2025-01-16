import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function createQueryParams(params: Record<string, string | number | null | undefined>): URLSearchParams {
    return new URLSearchParams(
        Object.fromEntries(
            Object.entries(params)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, value]) => value != null && value !== '')
                .map(([key, value]) => [key, String(value)])
        )
    )
}

export function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date))
}