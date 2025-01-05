"use client"

import { Category } from "@vocab/database"
import { motion, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CategoryCardProps {
    category: Category
    onDeleteClick: (category: Category) => void
    variants?: Variants
}

export function CategoryCard({ category, onDeleteClick, variants }: CategoryCardProps) {
    return (
        <motion.div
            variants={variants}
           /*  initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }} */
           /*  transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                bounce: 0.8,
            }} */
        >
            <Card className="relative p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: category.backgroundColor }}
                        />
                        <h3 className="font-semibold">{category.name}</h3>
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
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDeleteClick(category)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div
                    className="absolute inset-0 z-[-10] opacity-15 rounded-md h-16"
                    style={{
                        background: `linear-gradient(to right, ${category.backgroundColor}, transparent)`
                    }}
                />
            </Card>
        </motion.div>
    )
} 