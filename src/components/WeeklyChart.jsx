import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, CartesianGrid, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
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
    return { day, amount: total, fullDate: date };
  });

  const maxAmount = Math.max(...data.map(d => d.amount));
  const totalWeek = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl flex flex-col">
      {/* Compact Header */}
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly</h3>
              <p className="text-xs text-gray-600">Last 7 days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              ${totalWeek.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>

      {/* Chart - Takes remaining space */}
      <div className="flex-1 min-h-0 px-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="2 2" 
                vertical={false} 
                stroke="#e5e7eb"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(value) => value.slice(0, 2)}
              />
              <YAxis hide />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-2 shadow-lg">
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                          {data.fullDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-base font-bold text-blue-600">
                          ${payload[0].value.toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                strokeWidth={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      {/* Compact Mini stats */}
      <div className="flex-shrink-0 flex items-center justify-around p-4 pt-2 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg</p>
          <p className="text-sm font-semibold text-gray-900">
            ${(totalWeek / 7).toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Peak</p>
          <p className="text-sm font-semibold text-gray-900">
            ${maxAmount.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-sm font-semibold text-gray-900">
            {data.filter(d => d.amount > 0).length}/7
          </p>
        </div>
      </div>
    </div>
  );
}
