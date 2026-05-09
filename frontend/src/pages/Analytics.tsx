import { useStats } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const STATUS_COLORS = {
  Enriched: "var(--chart-2)",
  Pending: "var(--chart-4)",
  Failed: "var(--destructive)",
};

export function Analytics() {
  const { data: stats, isLoading } = useStats();

  const enrichmentSuccessData = [
    { name: "Enriched", value: stats?.enriched ?? 0 },
    { name: "Pending", value: stats?.pending ?? 0 },
    { name: "Failed", value: stats?.failed ?? 0 },
  ].filter((item) => item.value > 0);

  const industryData = stats?.industry_distribution || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into your outreach and enrichment metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrichment Status Pie Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">
              Enrichment Status
            </h3>
            <p className="text-sm text-muted-foreground">
              Success rate of AI enrichment
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full rounded-full" />
          ) : enrichmentSuccessData.length > 0 ? (
            <div className="h-[300px] min-h-[300px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrichmentSuccessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {enrichmentSuccessData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[
                            entry.name as keyof typeof STATUS_COLORS
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
                            <span className="text-sm font-medium text-foreground">
                              {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed rounded-lg p-6">
              <p className="text-muted-foreground text-sm">No data available.</p>
            </div>
          )}
        </div>

        {/* Lead Processing Funnel */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">
              Lead Processing Funnel
            </h3>
            <p className="text-sm text-muted-foreground">
              Conversion across pipeline stages
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (stats?.total ?? 0) > 0 ? (
            <div className="h-[300px] min-h-[300px] w-full flex-1 mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 20, bottom: 20 }}>
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
                            <span className="text-sm font-medium text-foreground">
                              {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Funnel
                    dataKey="value"
                    data={[
                      { name: "Total Leads", value: stats?.total ?? 0, fill: "var(--chart-1)" },
                      { name: "Enriched", value: stats?.enriched ?? 0, fill: "var(--chart-2)" },
                      { name: "Emails Ready", value: stats?.with_emails ?? 0, fill: "var(--chart-3)" },
                    ]}
                    isAnimationActive
                  >
                    <LabelList
                      position="center"
                      fill="var(--primary-foreground)"
                      stroke="none"
                      dataKey="name"
                      className="font-medium text-sm drop-shadow-sm"
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed rounded-lg p-6">
              <p className="text-muted-foreground text-sm">No data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
