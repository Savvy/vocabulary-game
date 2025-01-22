"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbLink, BreadcrumbSeparator } from "./ui/breadcrumb"
import { BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "./ui/breadcrumb"
import Link from "next/link"
import React from "react"

interface BreadcrumbItem {
    label: string
    path: string
    isLast: boolean
}

export function DynamicBreadcrumb() {
    const pathname = usePathname()

    const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
        const parts = path.split("/").filter(Boolean)

        return parts.map((part, index) => ({
            label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
            path: "/" + parts.slice(0, index + 1).join("/"),
            isLast: index === parts.length - 1
        }))
    }

    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.length === 0 ? (
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                ) : (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbs.map((crumb) => (
                            <React.Fragment key={crumb.path}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {!crumb.isLast ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.path}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </React.Fragment>
                        ))}
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}