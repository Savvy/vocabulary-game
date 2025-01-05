"use client"

import * as React from "react"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { Package2Icon } from "lucide-react"

export function SidebarBrand() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Package2Icon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ml-3">
            <span className="truncate font-semibold">
              Voqab
            </span>
            <span className="truncate text-xs">Admin</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
