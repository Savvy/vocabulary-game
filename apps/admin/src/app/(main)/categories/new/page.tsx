import { CategoryCreationHeader } from "./components/category-creation-header"
import { CategoryCreationForm } from "./components/category-creation-form"

export default function NewCategoryPage() {
    return (
        <>
            <CategoryCreationHeader />
            <div className="flex-1 flex flex-col gap-4 p-4">
                <CategoryCreationForm />
            </div>
        </>
    )
} 