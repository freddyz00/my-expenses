import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "var(--chart-1)",
  },
};

export default function WeeklyChart({ transactions }) {
  // Prepare data: sum amount per day for last 7 days
  const now = new Date();
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(now.getDate() - (6 - i));
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const total = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { day, amount: total };
  });

  return (
    <Card className="mb-6 shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-500">
          Last 7 Days Spending
        </CardTitle>
      </CardHeader>
      <CardContent style={{ height: 150 }}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="text-muted-foreground flex min-w-[130px] items-center text-xs">
                      {chartConfig[name]?.label || name}
                      <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                        ${value}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="amount" fill="var(--chart-3)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
