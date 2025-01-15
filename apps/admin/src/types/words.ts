export interface WordWithRelations {
    id: string
    categoryId: string
    imageUrl: string
    createdAt: Date
    updatedAt: Date
    category: {
        id: string
        translations: Array<{
            id: string
            translation: string
            languageId: string
        }>
    }
    translations: Array<{
        id: string
        translation: string
        language: {
            id: string
            code: string
        }
    }>
}