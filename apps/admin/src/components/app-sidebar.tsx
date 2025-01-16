"use client"

import * as React from "react"
import { BookOpen, Gamepad2, Languages, ColumnsIcon, Users } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SidebarBrand } from "@/components/sidebar-brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Malcom Green",
    email: "me@malcom.sh",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Categories",
      url: "/categories",
      icon: ColumnsIcon,
      isActive: false,
    },
    {
      title: "Languages",
      url: "/languages",
      icon: Languages,
      isActive: false,
    },
    {
      title: "Words",
      url: "/words",
      icon: BookOpen,
      isActive: false,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      isActive: false,
    },
    {
      title: "Games",
      url: "/",
      icon: Gamepad2,
      isActive: false,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
