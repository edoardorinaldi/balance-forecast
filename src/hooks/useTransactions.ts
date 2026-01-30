import { useState, useEffect, useCallback } from "react";
import type { Transaction } from "../types";
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "../lib/database";
import { hasFutureOccurrence } from "../lib/forecast";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await loadTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load transactions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Get future transactions
  const getFutureTransactions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter((t) => hasFutureOccurrence(t, today));
  }, [transactions]);

  // Add transaction
  const add = useCallback(async (newTransaction: Omit<Transaction, "id">) => {
    try {
      const added = await addTransaction(newTransaction);
      setTransactions((prev) => [...prev, added]);
      return added;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    }
  }, []);

  // Delete transaction
  const remove = useCallback(async (transactionId: number) => {
    try {
      await deleteTransaction(transactionId);
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    }
  }, []);

  // Update transaction field
  const update = useCallback(
    async (transactionId: number, field: keyof Omit<Transaction, "id">, value: any) => {
      try {
        await updateTransaction(transactionId, field, value);
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transactionId ? { ...t, [field]: value } : t
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      }
    },
    []
  );

  return {
    transactions,
    futureTransactions: getFutureTransactions(),
    loading,
    error,
    add,
    remove,
    update,
  };
};
