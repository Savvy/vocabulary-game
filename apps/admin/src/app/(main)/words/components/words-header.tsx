import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import Link from "next/link"

export function WordsHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Words</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <Button asChild>
                <Link href="/words/new">
                    <Plus className="h-4 w-4" />
                    Add Word
                </Link>
            </Button>
        </header>
    )
} 