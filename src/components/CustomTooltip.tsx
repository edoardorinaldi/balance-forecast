import React from "react";
import type { Transaction } from "@/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  transactions: Transaction[];
  startingBalance: number;
}

// Helper to get transactions for a given date string (YYYY-MM-DD)
function getTransactionsForDate(transactions: Transaction[], date: string) {
  return transactions.filter((t) => {
    const start = typeof t.start_date === "string" ? t.start_date : t.start_date.toISOString().slice(0, 10);
    const end = typeof t.end_date === "string" ? t.end_date : t.end_date.toISOString().slice(0, 10);
    if (date < start || date > end) return false;
    if (t.frequency === 0) return date === start;
    const startDate = new Date(start);
    const currentDate = new Date(date);
    if (currentDate.getTime() < startDate.getTime()) return false;
    if (currentDate.getTime() > new Date(end).getTime()) return false;
    let occurs = false;
    if (t.uom === "day") {
      const diff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      occurs = diff % t.frequency === 0;
    } else if (t.uom === "week") {
      const diff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      occurs = diff % t.frequency === 0 && (currentDate.getDay() === startDate.getDay());
    } else if (t.uom === "month") {
      const diff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
      occurs = diff % t.frequency === 0 && currentDate.getDate() === startDate.getDate();
    }
    return occurs;
  });
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, transactions, startingBalance }) => {
  if (!active || !payload || !payload.length || !label) return null;
  const date = label.replace("Date: ", "");
  const dayTransactions = getTransactionsForDate(transactions, date);
  const index = payload[0]?.payload?.index;
  let dayStartingBalance = startingBalance;
  if (index > 0 && payload[0]?.payload?.balance !== undefined) {
    dayStartingBalance = payload[0].payload.balance - payload[0].payload.cash_flow;
  }
  return (
    <div className="min-w-48 space-y-1.5 rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Date</span>
        <span className="font-medium">{date}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Starting Balance</span>
        <span className="font-medium">€{dayStartingBalance.toFixed(2)}</span>
      </div>
      <div className="border-t pt-1.5">
        <span className="text-muted-foreground">Transactions</span>
        {dayTransactions.length === 0 ? (
          <p className="text-muted-foreground italic">No transactions</p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {dayTransactions.map((t) => (
              <li key={t.id} className="flex justify-between gap-4">
                <span>{t.name}</span>
                <span className={t.amount < 0 ? "text-negative" : "text-positive"}>
                  €{t.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-between gap-4 border-t pt-1.5">
        <span className="text-muted-foreground">End Balance</span>
        <span className="font-semibold">€{payload[0].value.toFixed(2)}</span>
      </div>
    </div>
  );
};
