"use client"

import { motion, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, MoreVertical, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategoryWithCount } from "./categories-grid"

interface CategoryCardProps {
    category: CategoryWithCount
    onDeleteClick: (category: CategoryWithCount) => void
    variants?: Variants
}

export function CategoryCard({ category, onDeleteClick, variants }: CategoryCardProps) {
    console.log(category.backgroundColor)
    return (
        <motion.div
            variants={variants}
        >
            <Card className="relative p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor: category.backgroundColor.replace('#', '') !== '' 
                                        ? `${category.backgroundColor}60`
                                        : undefined,
                                    borderColor: category.backgroundColor,
                                    borderWidth: 1.5,
                                }}
                            />
                            <h3 className="font-semibold capitalize">{category.categoryCode}</h3>
                        </div>
                        {/* <div className="flex flex-wrap gap-1">
                            {category.translations.map((translation) => (
                                <Badge
                                    key={translation.id}
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {translation.language.code}: {translation.translation}
                                </Badge>
                            ))}
                        </div> */}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/categories/${category.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDeleteClick(category)}
                            >
                                <Trash className="h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Book className="h-4 w-4" />
                    <span>{category._count.words} words</span>
                </div>
                <div
                    className="absolute inset-0 z-[-10] opacity-15 rounded-md h-full w-full"
                    style={{
                        background: `linear-gradient(to right, ${category.backgroundColor}, transparent)`
                    }}
                />
            </Card>
        </motion.div>
    )
} 