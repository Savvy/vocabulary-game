export interface WordWithRelations {
    id: string
    word: string
    translation: string
    imageUrl: string | null
    category: { id: string; name: string; backgroundColor: string }
    sourceLanguage: { id: string; code: string }
    targetLanguage: { id: string; code: string }
}