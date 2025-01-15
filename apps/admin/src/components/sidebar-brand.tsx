"use client"

import * as React from "react"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarBrand() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          <div className={cn(
            "flex aspect-square size-8 items-center justify-center",
            "rounded-lg text-sidebar-primary-foreground",
            "bg-gradient-to-br from-indigo-500/20 to-violet-500/20",
            "border border-primary/20"
          )}>
            <Gamepad2 className="size-4 text-primary" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ml-3">
            <span className="truncate font-semibold">
              Voqab
            </span>
            <span className="truncate text-xs">Admin</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu >
  )
}
