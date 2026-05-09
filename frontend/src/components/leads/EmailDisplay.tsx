import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EmailDisplayProps {
  email: string;
  className?: string;
}

/**
 * Renders a generated cold email in a readable, formatted block.
 * Supports copy-to-clipboard with visual feedback.
 */
export function EmailDisplay({ email, className }: EmailDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy — please select and copy manually");
    }
  };

  // Parse email into paragraphs for readable rendering
  const paragraphs = email
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={cn("group relative", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Generated Email
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "h-7 px-2 gap-1.5 text-xs transition-colors",
            copied
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:text-foreground"
          )}
          id="copy-email-btn"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Email body */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed space-y-3 font-[inherit]">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-foreground whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
