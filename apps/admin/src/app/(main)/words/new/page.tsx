import { WordCreationHeader } from "./components/word-creation-header"
import { WordCreationForm } from "./components/word-creation-form"
import { getAllCategories, getAllLanguages } from "@vocab/database"

export default async function NewWordPage() {
    const [categories, languages] = await Promise.all([
        getAllCategories(),
        getAllLanguages(),
    ])

    return (
        <>
            <WordCreationHeader />
            <div className="flex-1 flex flex-col gap-4 p-4">
                <WordCreationForm
                    categories={categories}
                    languages={languages}
                />
            </div>
        </>
    )
} 