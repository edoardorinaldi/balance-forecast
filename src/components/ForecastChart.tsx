import {
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CalculationResult, Transaction } from "@/types";
import { formatDateString } from "@/lib/forecast";
import { CustomTooltip } from "./CustomTooltip";

interface ForecastChartProps {
  data: CalculationResult[];
  transactions?: Transaction[];
  startingBalance?: number;
}

export const ForecastChart = ({
  data,
  transactions = [],
  startingBalance = 0,
}: ForecastChartProps) => {
  const chartData = data.map((item, idx) => ({
    date: formatDateString(item.date),
    balance: item.balance,
    cash_flow: item.cash_flow,
    index: idx,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          stroke="var(--border)"
          interval={Math.floor(data.length / 10) || 0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          stroke="var(--border)"
          label={{
            value: "Balance (€)",
            angle: -90,
            position: "insideLeft",
            style: { fill: "var(--muted-foreground)", fontSize: 12 },
          }}
        />
        <Tooltip
          content={
            <CustomTooltip
              transactions={transactions}
              startingBalance={startingBalance}
            />
          }
          labelFormatter={(label: any) => `Date: ${label}`}
        />
        <Legend />
        <ReferenceLine
          y={0}
          stroke="var(--negative)"
          strokeDasharray="5 5"
          label={{ value: "Zero Balance", fill: "var(--negative)", fontSize: 11 }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
          name="Balance"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
