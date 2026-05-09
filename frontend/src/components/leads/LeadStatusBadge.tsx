import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LeadStatus =
  | "pending"
  | "processing"
  | "enriched"
  | "completed"    // backend alias for "enriched"
  | "failed"
  | "email_generated"
  | null
  | undefined;

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  className: string;
  pulse?: boolean;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  email_generated: {
    label: "Email Ready",
    icon: Mail,
    className: "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
  },
  enriched: {
    label: "Enriched",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
  },
  completed: {
    label: "Enriched",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800",
    pulse: true,
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800",
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: "New",
  icon: Clock,
  className: "bg-muted text-muted-foreground border-border",
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  hasEmail?: boolean;
  size?: "sm" | "md";
}

export function LeadStatusBadge({ status, hasEmail, size = "md" }: LeadStatusBadgeProps) {
  // Upgrade status display if email exists
  const effectiveStatus =
    hasEmail && (status === "completed" || status === "enriched")
      ? "email_generated"
      : status;

  const config = STATUS_MAP[effectiveStatus ?? ""] ?? DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1",
        config.className
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
          config.pulse && "animate-spin"
        )}
      />
      {config.label}
    </Badge>
  );
}
