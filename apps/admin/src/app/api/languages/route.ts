import { NextResponse } from "next/server"
import { prisma } from "@vocab/database"

export async function GET() {
    try {
        const languages = await prisma.language.findMany({
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                code: true,
                name: true
            }
        })

        return NextResponse.json(languages)
    } catch (error) {
        console.error('Failed to fetch languages:', error)
        return NextResponse.json(
            { error: "Failed to fetch languages" },
            { status: 500 }
        )
    }
} 