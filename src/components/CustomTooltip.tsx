import React from "react";
import type { Transaction } from "../types";

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
    // Calculate if this date is an occurrence (must match exactly)
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
  if (!active || !payload || !payload.length) return null;
  const date = label.replace("Date: ", "");
  const dayTransactions = getTransactionsForDate(transactions, date);
  // Find the index of the current day in the chart (payload[0].payload.index)
  const index = payload[0]?.payload?.index;
  // Calculate starting balance for the day
  let dayStartingBalance = startingBalance;
  if (index > 0 && payload[0]?.payload?.balance !== undefined) {
    dayStartingBalance = payload[0].payload.balance - payload[0].payload.cash_flow;
  }
  return (
    <div className="custom-tooltip" style={{ background: "white", border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
      <div><strong>Date:</strong> {date}</div>
      <div><strong>Starting Balance:</strong> €{dayStartingBalance.toFixed(2)}</div>
      <div><strong>Transactions:</strong></div>
      {dayTransactions.length === 0 ? (
        <div style={{ color: "#888", fontStyle: "italic" }}>No transactions</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {dayTransactions.map((t) => (
            <li key={t.id}>{t.name}: €{t.amount.toFixed(2)}</li>
          ))}
        </ul>
      )}
      <div><strong>End Balance:</strong> €{payload[0].value.toFixed(2)}</div>
    </div>
  );
};
