import { useState } from "react";
import type { Transaction } from "../types";
import { formatDateString } from "../lib/forecast";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, field: keyof Omit<Transaction, "id">, value: any) => Promise<void>;
  isLoading?: boolean;
}

export const TransactionList = ({
  transactions,
  onDelete,
  onEdit,
  isLoading = false,
}: TransactionListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editField, setEditField] = useState<keyof Omit<Transaction, "id"> | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (transaction: Transaction, field: keyof Omit<Transaction, "id">) => {
    setEditingId(transaction.id);
    setEditField(field);
    setEditValue(String(transaction[field]));
    setError(null);
  };

  const handleSaveEdit = async (transactionId: number) => {
    if (!editField || !editValue) {
      setError("Edit value is required");
      return;
    }

    try {
      let parsedValue: any = editValue;

      // Parse value based on field type
      if (editField === "amount") {
        parsedValue = parseFloat(editValue);
      } else if (editField === "frequency") {
        parsedValue = parseInt(editValue);
      }
      // Date fields are already strings

      await onEdit(transactionId, editField, parsedValue);
      setEditingId(null);
      setEditField(null);
      setEditValue("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditField(null);
    setEditValue("");
    setError(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-list">
        <h3>Transactions</h3>
        <p className="empty-message">No future transactions found.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h3>Transactions</h3>
      {error && <div className="error-message">{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Amount (€)</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Frequency</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>
                  {editingId === transaction.id && editField === "name" ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    transaction.name
                  )}
                </td>
                <td>
                  {editingId === transaction.id && editField === "amount" ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    transaction.amount.toFixed(2)
                  )}
                </td>
                <td>
                  {editingId === transaction.id && editField === "start_date" ? (
                    <input
                      type="date"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    formatDateString(
                      typeof transaction.start_date === "string"
                        ? new Date(transaction.start_date)
                        : transaction.start_date
                    )
                  )}
                </td>
                <td>
                  {editingId === transaction.id && editField === "end_date" ? (
                    <input
                      type="date"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    formatDateString(
                      typeof transaction.end_date === "string"
                        ? new Date(transaction.end_date)
                        : transaction.end_date
                    )
                  )}
                </td>
                <td>
                  {editingId === transaction.id && editField === "frequency" ? (
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    transaction.frequency
                  )}
                </td>
                <td>
                  {editingId === transaction.id && editField === "uom" ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    >
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                    </select>
                  ) : (
                    transaction.uom
                  )}
                </td>
                <td className="actions">
                  {editingId === transaction.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(transaction.id)}
                        disabled={isLoading}
                        className="btn-small btn-save"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="btn-small btn-cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(transaction, "amount")}
                        disabled={isLoading}
                        className="btn-small btn-edit"
                        title="Edit Amount"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        disabled={isLoading}
                        className="btn-small btn-delete"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
