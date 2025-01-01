import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/components/ui/button';

interface CopyButtonProps extends ButtonProps {
    text: string;
    children: React.ReactNode;
}

export function CopyButton({ text, children, ...props }: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast({
                title: "Copied!",
                description: "Room ID copied to clipboard",
            });

            // Reset copy state after 2 seconds
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to copy",
                description: "Please try copying manually",
            });
        }
    };

    return (
        <Button
            onClick={handleCopy}
            {...props}
        >
            {isCopied ? (
                <Check className="w-4 h-4 mr-2 text-green-400" />
            ) : (
                <Copy className="w-4 h-4 mr-2 text-indigo-400" />
            )}
            <span className="text-sm font-medium text-indigo-300">
                {children}
            </span>
        </Button>
    );
}