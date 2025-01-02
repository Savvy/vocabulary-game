'use client'

import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSocket } from "@/hooks/useSocket"

interface GameConfig {
    maxPlayers: number
    roundTimeLimit: number
    maxRounds: number
    inputType: 'multiple-choice' | 'single-choice'
}

interface GameConfigDialogProps {
    initialConfig: GameConfig
}

export function GameConfigDialog({ initialConfig }: GameConfigDialogProps) {
    const [open, setOpen] = useState<boolean>(false)
    const [config, setConfig] = useState<GameConfig>(initialConfig)
    const { socket } = useSocket()
    const { toast } = useToast()

    const handleSave = () => {
        console.log('config', config)
        socket?.emit('game:updateConfig', config)
        setOpen(false)
        toast({
            title: "Settings Updated",
            description: "Game configuration has been updated successfully.",
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="lg"
                    className="bg-secondary/30 backdrop-blur h-12"
                >
                    <Settings className="w-5 h-5 text-indigo-400" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[450px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Game Configuration</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="maxPlayers">Max Players</Label>
                        <Input
                            id="maxPlayers"
                            type="number"
                            value={config.maxPlayers}
                            onChange={(e) => setConfig({ ...config, maxPlayers: parseInt(e.target.value) })}
                            min={2}
                            max={8}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="roundTime">Round Time (seconds)</Label>
                        <Input
                            id="roundTime"
                            type="number"
                            value={config.roundTimeLimit}
                            onChange={(e) => setConfig({ ...config, roundTimeLimit: parseInt(e.target.value) })}
                            min={10}
                            max={300}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="maxRounds">Max Rounds</Label>
                        <Input
                            id="maxRounds"
                            type="number"
                            value={config.maxRounds}
                            onChange={(e) => setConfig({ ...config, maxRounds: parseInt(e.target.value) })}
                            min={1}
                            max={20}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="multipleChoice">Multiple Choice</Label>
                        <Switch
                            id="multipleChoice"
                            checked={config.inputType === 'multiple-choice'}
                            onCheckedChange={(checked) => setConfig({
                                ...config,
                                inputType: checked ? 'multiple-choice' : 'single-choice'
                            })}
                        />
                    </div>
                </div>
                <AlertDialogFooter className="flex items-center">
                    <Button
                        variant="secondary"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className=""
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 