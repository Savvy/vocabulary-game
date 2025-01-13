import { NextResponse } from "next/server"
import { searchCategories } from "@vocab/database"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''
        const sourceLanguage = searchParams.get('sourceLanguage')
        const targetLanguage = searchParams.get('targetLanguage')

        const categories = await searchCategories(query, sourceLanguage || undefined, targetLanguage || undefined)
        
        // Transform the categories to match the expected format
        const transformedCategories = categories.map(category => ({
            label: category.name,
            id: category.id,
            translation: category.translation,
            style: {
                backgroundColor: category.style.backgroundColor,
                textColor: category.style.textColor
            }
        }))

        return NextResponse.json(transformedCategories)
    } catch (error) {
        console.error('Failed to search categories:', error)
        return NextResponse.json(
            { error: "Failed to search categories" },
            { status: 500 }
        )
    }
} 