import { supabase } from "./supabaseClient";
import type { Transaction } from "../types";
import { formatDateString, toDate } from "./forecast";

/**
 * Load all transactions from the Supabase database.
 */
export const loadTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*");

  if (error) {
    console.error("Error loading transactions:", error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    start_date: row.start_date,
    end_date: row.end_date,
    frequency: row.frequency,
    uom: row.uom,
  }));
};

/**
 * Insert a new transaction into the database.
 */
export const addTransaction = async (
  transaction: Omit<Transaction, "id">
): Promise<Transaction> => {
  const payload = {
    name: transaction.name,
    amount: transaction.amount,
    start_date: formatDateString(toDate(transaction.start_date)),
    end_date: formatDateString(toDate(transaction.end_date)),
    frequency: transaction.frequency,
    uom: transaction.uom,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select();

  if (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("No data returned after insert");
  }

  return {
    id: data[0].id,
    name: data[0].name,
    amount: data[0].amount,
    start_date: data[0].start_date,
    end_date: data[0].end_date,
    frequency: data[0].frequency,
    uom: data[0].uom,
  };
};

/**
 * Delete a transaction from the database by ID.
 */
export const deleteTransaction = async (transactionId: number): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

/**
 * Update a specific field of a transaction by ID.
 */
export const updateTransaction = async (
  transactionId: number,
  field: keyof Omit<Transaction, "id">,
  value: any
): Promise<void> => {
  let updateValue = value;

  // Format dates when updating date fields
  if ((field === "start_date" || field === "end_date") && typeof value === "string") {
    updateValue = formatDateString(toDate(value));
  }

  const { error } = await supabase
    .from("transactions")
    .update({ [field]: updateValue })
    .eq("id", transactionId);

  if (error) {
    console.error(`Error updating transaction field ${field}:`, error);
    throw error;
  }
};
