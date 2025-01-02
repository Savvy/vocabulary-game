import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends ButtonProps {
    text: string;
    description?: string;
    variant?: ButtonProps['variant'];
    children?: React.ReactNode;
    iconClassName?: string;
}

export function CopyButton({ text, children, description, variant = 'default', iconClassName, ...props }: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast({
                title: "Copied!",
                description: description || "Room ID copied to clipboard",
            });

            // Reset copy state after 2 seconds
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
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
            variant={variant}
            {...props}
        >
            {isCopied ? (
                <Check className={cn(
                    "w-4 h-4 text-green-400",
                    {"mr-2": !!children},
                    iconClassName
                )}
                />
            ) : (
                <Copy className={cn(
                    "w-4 h-4 text-indigo-400",
                    {"mr-2": !!children},
                    iconClassName
                )}
                />
            )}
            {children ? <span className="text-sm font-medium text-indigo-300">
                {children}
            </span> : null}
        </Button>
    );
}