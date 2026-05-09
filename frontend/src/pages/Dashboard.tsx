import { useStats } from "@/hooks/useLeads";
import { Users, Sparkles, Mail, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { data: stats, isLoading } = useStats();

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.total ?? 0,
      icon: Users,
      description: "Total leads in database",
      color: "text-blue-500",
    },
    {
      title: "Enriched",
      value: stats?.enriched ?? 0,
      icon: Sparkles,
      description: "Successfully processed",
      color: "text-emerald-500",
    },
    {
      title: "Emails Ready",
      value: stats?.with_emails ?? 0,
      icon: Mail,
      description: "Drafts generated",
      color: "text-purple-500",
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      description: "Awaiting enrichment",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your lead generation performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <div className="text-2xl font-bold mt-1">{card.value}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-8 h-[400px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground font-medium">Activity Trends</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Analytics integration coming in Phase 4</p>
        </div>
      </div>
    </div>
  );
}
