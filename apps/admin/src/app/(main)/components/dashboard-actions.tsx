"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload, Wand2 } from "lucide-react"

export function DashboardActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Word
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Words
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate AI Suggestions
                </Button>
            </CardContent>
        </Card>
    )
} 