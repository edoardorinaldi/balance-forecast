
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
import type { CalculationResult, Transaction } from "../types";
import { formatDateString } from "../lib/forecast";
import { CustomTooltip } from "./CustomTooltip";


interface ForecastChartProps {
  data: CalculationResult[];
  transactions?: Transaction[];
  startingBalance?: number;
}


export const ForecastChart = ({ data, transactions = [], startingBalance = 0 }: ForecastChartProps) => {
  // Format data for Recharts, add index for tooltip
  const chartData = data.map((item, idx) => ({
    date: formatDateString(item.date),
    balance: item.balance,
    cash_flow: item.cash_flow,
    index: idx,
  }));

  return (
    <div className="forecast-chart">
      <h3>Balance Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval={Math.floor(data.length / 10) || 0}
          />
          <YAxis
            label={{ value: "Balance (€)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            content={<CustomTooltip transactions={transactions} startingBalance={startingBalance} />}
            labelFormatter={(label: any) => `Date: ${label}`}
          />
          <Legend />
          <ReferenceLine
            y={0}
            stroke="#ff4444"
            strokeDasharray="5 5"
            label="Zero Balance"
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#2563eb"
            dot={false}
            name="Balance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
