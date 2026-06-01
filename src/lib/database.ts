import type { Transaction } from "../types";
import { formatDateString, toDate } from "./forecast";

const SHEET_NAME = "transactions";
const DATA_RANGE = `${SHEET_NAME}!A2:G`;

// Column order: id | name | amount | start_date | end_date | frequency | uom
const FIELD_COL: Record<keyof Omit<Transaction, "id">, string> = {
  name: "B",
  amount: "C",
  start_date: "D",
  end_date: "E",
  frequency: "F",
  uom: "G",
};

async function call(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch("/api/sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Sheets ${body.op} error ${res.status}: ${await res.text()}`);
  return body.op === "read" ? res.json() : undefined;
}

const rowToTransaction = (row: any[]): Transaction => ({
  id: Number(row[0]),
  name: String(row[1] ?? ""),
  amount: Number(row[2]),
  start_date: String(row[3] ?? ""),
  end_date: String(row[4] ?? ""),
  frequency: Number(row[5]),
  uom: row[6] as Transaction["uom"],
});

const fetchRows = async (): Promise<{ rowIndex: number; data: any[] }[]> => {
  const rows = (await call({ op: "read", range: DATA_RANGE })) as any[][];
  // rowIndex is 1-based sheet row (row 1 = header, so data starts at row 2)
  return rows.map((data, i) => ({ rowIndex: i + 2, data }));
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  const rows = await fetchRows();
  return rows.map((r) => rowToTransaction(r.data)).sort((a, b) => b.id - a.id);
};

export const addTransaction = async (
  transaction: Omit<Transaction, "id">
): Promise<Transaction> => {
  const id = Date.now();
  const startDate = formatDateString(toDate(transaction.start_date));
  const endDate = formatDateString(toDate(transaction.end_date));

  await call({
    op: "append",
    range: DATA_RANGE,
    values: [[id, transaction.name, transaction.amount, startDate, endDate, transaction.frequency, transaction.uom]],
  });

  return { id, ...transaction, start_date: startDate, end_date: endDate };
};

export const deleteTransaction = async (transactionId: number): Promise<void> => {
  const rows = await fetchRows();
  const found = rows.find((r) => Number(r.data[0]) === transactionId);
  if (!found) throw new Error(`Transaction ${transactionId} not found`);

  // sheetId 0 = first sheet tab (gid=0 in the sheet URL)
  await call({
    op: "delete",
    deleteRange: {
      sheetId: 0,
      dimension: "ROWS",
      startIndex: found.rowIndex - 1, // 0-based
      endIndex: found.rowIndex,
    },
  });
};

export const updateTransaction = async (
  transactionId: number,
  field: keyof Omit<Transaction, "id">,
  value: any
): Promise<void> => {
  let updateValue = value;
  if ((field === "start_date" || field === "end_date") && typeof value === "string") {
    updateValue = formatDateString(toDate(value));
  }

  const rows = await fetchRows();
  const found = rows.find((r) => Number(r.data[0]) === transactionId);
  if (!found) throw new Error(`Transaction ${transactionId} not found`);

  const cellRange = `${SHEET_NAME}!${FIELD_COL[field]}${found.rowIndex}`;
  await call({ op: "update", range: cellRange, values: [[updateValue]] });
};
