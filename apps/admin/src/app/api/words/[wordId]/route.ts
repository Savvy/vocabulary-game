import { NextResponse } from "next/server"
import { deleteWord } from "@vocab/database"

export async function DELETE(
    request: Request,
    { params }: { params: { wordId: string } }
) {
    try {
        await deleteWord(params.wordId)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: "Failed to delete word" },
            { status: 500 }
        )
    }
} 