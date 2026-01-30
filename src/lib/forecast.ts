import type { Transaction, CalculationResult } from "../types";
import { addDays, addWeeks, addMonths, isAfter, isBefore, isEqual } from "date-fns";

/**
 * Convert a date string or Date to a Date object at midnight UTC
 */
export const toDate = (dateInput: string | Date): Date => {
  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return dateInput instanceof Date
    ? new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate())
    : new Date();
};

/**
 * Format a date as YYYY-MM-DD string
 */
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Generate all occurrence dates of a transaction based on frequency and unit.
 * Replicates Python's generateOccurrenceDates function.
 */
export const generateOccurrenceDates = (transaction: Transaction): Date[] => {
  const dates: Date[] = [];
  let currentDate = toDate(transaction.start_date);
  const endDate = toDate(transaction.end_date);

  while (!isAfter(currentDate, endDate)) {
    dates.push(new Date(currentDate));

    if (transaction.frequency === 0) {
      break;
    }

    if (transaction.uom === "month") {
      currentDate = addMonths(currentDate, transaction.frequency);
    } else if (transaction.uom === "week") {
      currentDate = addWeeks(currentDate, transaction.frequency);
    } else {
      // "day"
      currentDate = addDays(currentDate, transaction.frequency);
    }
  }

  return dates;
};

/**
 * Check if a transaction has at least one occurrence on or after today.
 * O(1) efficient check.
 * Replicates Python's hasFutureOccurrence function.
 */
export const hasFutureOccurrence = (
  transaction: Transaction,
  today: Date
): boolean => {
  const start = toDate(transaction.start_date);
  const end = toDate(transaction.end_date);

  if (isBefore(end, today)) {
    return false;
  }

  if (!isBefore(start, today) && !isEqual(start, today)) {
    return true;
  }

  const freq = transaction.frequency;
  if (freq === 0) {
    return false;
  }

  let current = new Date(start);
  while (isBefore(current, today)) {
    if (transaction.uom === "month") {
      current = addMonths(current, freq);
    } else if (transaction.uom === "week") {
      current = addWeeks(current, freq);
    } else {
      current = addDays(current, freq);
    }
  }

  return !isAfter(current, end);
};

/**
 * Get future transactions (those with at least one occurrence on or after today).
 */
export const getFutureTransactions = (
  transactions: Transaction[],
  today: Date
): Transaction[] => {
  return transactions.filter((t) => hasFutureOccurrence(t, today));
};

/**
 * Calculate cash flow for a specific date.
 * Sums amounts of all transactions that occur on that date.
 */
export const calculateCashFlow = (
  date: Date,
  transactions: Transaction[]
): number => {
  return transactions.reduce((sum, transaction) => {
    const occurrences = generateOccurrenceDates(transaction);
    const hasOccurrence = occurrences.some(
      (occ) =>
        occ.getFullYear() === date.getFullYear() &&
        occ.getMonth() === date.getMonth() &&
        occ.getDate() === date.getDate()
    );
    return hasOccurrence ? sum + transaction.amount : sum;
  }, 0);
};

/**
 * Calculate new balance given previous balance and cash flow.
 */
export const calculateBalance = (
  previousBalance: number,
  cashFlow: number
): number => {
  return previousBalance + cashFlow;
};

/**
 * Generate daily balances from startDate to endDate.
 * Replicates Python's calculateResults function.
 */
export const calculateResults = (
  startDate: Date,
  endDate: Date,
  startingBalance: number,
  transactions: Transaction[]
): CalculationResult[] => {
  const results: CalculationResult[] = [];
  let currentDate = new Date(startDate);
  let previousBalance = startingBalance;

  while (!isAfter(currentDate, endDate)) {
    const cashFlow = calculateCashFlow(currentDate, transactions);
    const balance = calculateBalance(previousBalance, cashFlow);

    results.push({
      date: new Date(currentDate),
      cash_flow: cashFlow,
      balance,
    });

    previousBalance = balance;
    currentDate = addDays(currentDate, 1);
  }

  return results;
};
