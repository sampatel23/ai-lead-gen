import { useStats } from "@/hooks/useLeads";
import { Users, Sparkles, Mail, Clock, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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

  // Process data for charts
  const leadsOverTime = (stats?.leads_over_time || []).map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd"),
  }));

  const industryData = stats?.industry_distribution || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your lead generation performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <div className="text-2xl font-bold mt-1">{card.value}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart - Leads Over Time */}
        <div className="col-span-full lg:col-span-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">
              Leads Overview
            </h3>
            <p className="text-sm text-muted-foreground">
              Leads created over time
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : leadsOverTime.length > 0 ? (
            <div className="h-[300px] min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={leadsOverTime}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">{label}</div>
                            <span className="text-sm font-medium text-foreground">
                              Leads: <span className="font-bold">{payload[0].value}</span>
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ stroke: "var(--muted)", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Leads Created"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">No timeline data available</p>
            </div>
          )}
        </div>

        {/* Secondary Chart - Industry Distribution */}
        <div className="col-span-full lg:col-span-3 rounded-xl border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">
              Industry Distribution
            </h3>
            <p className="text-sm text-muted-foreground">
              Leads categorized by industry
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : industryData.length > 0 ? (
            <div className="h-[300px] min-h-[300px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={industryData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <RechartsTooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
                            <span className="text-sm font-medium text-foreground">
                              {label}: <span className="font-bold">{payload[0].value}</span>
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                    {(stats?.industry_distribution || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center border border-dashed rounded-lg mt-auto">
              <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                <Briefcase className="h-8 w-8 opacity-20" />
                <p className="text-sm">No industry data yet.</p>
                <p className="text-xs opacity-70">Enrich leads to see industries.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
