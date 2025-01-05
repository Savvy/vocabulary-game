import { Suspense } from "react"
import { WordsHeader } from "./components/words-header"
import { WordsTableSkeleton } from "./components/skeleton/words-table-skeleton"
import { WordsTable } from "./components/words-table"

export default async function WordsPage() {
    return (
        <>
            <WordsHeader />
            <div className="flex-1 flex flex-col gap-4 p-4">
                <Suspense fallback={<WordsTableSkeleton />}>
                    <WordsTable
                    />
                </Suspense>
            </div>
        </>
    )
} 