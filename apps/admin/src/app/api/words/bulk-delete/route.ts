import { NextResponse } from "next/server"
import { bulkDeleteWords } from "@vocab/database"

export async function POST(request: Request) {
    try {
        const { wordIds } = await request.json()
        
        if (!Array.isArray(wordIds) || wordIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid word IDs provided" },
                { status: 400 }
            )
        }

        await bulkDeleteWords(wordIds)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: "Failed to delete words" },
            { status: 500 }
        )
    }
} 