import { NextResponse } from "next/server"
import { deleteWord } from "@vocab/database"

export async function DELETE(
    request: Request,
    props: { params: Promise<{ wordId: string }> }
) {
    try {
        const params = await props.params
        await deleteWord(params.wordId)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: "Failed to delete word" },
            { status: 500 }
        )
    }
} 