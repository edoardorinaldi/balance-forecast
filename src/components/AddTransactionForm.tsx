import { useState } from "react";
import type { Transaction } from "../types";

interface AddTransactionFormProps {
  onAdd: (transaction: Omit<Transaction, "id">) => Promise<void>;
  isLoading?: boolean;
}

export const AddTransactionForm = ({
  onAdd,
  isLoading = false,
}: AddTransactionFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    start_date: "",
    end_date: "",
    frequency: "1",
    uom: "month" as const,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (
      !formData.name ||
      !formData.amount ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.frequency
    ) {
      setError("Please fill in all fields before submitting.");
      return;
    }

    try {
      const transaction: Omit<Transaction, "id"> = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        start_date: formData.start_date,
        end_date: formData.end_date,
        frequency: parseInt(formData.frequency),
        uom: formData.uom,
      };

      await onAdd(transaction);

      setFormData({
        name: "",
        amount: "",
        start_date: "",
        end_date: "",
        frequency: "1",
        uom: "month",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-transaction-form">
      <h3>Add Transaction</h3>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">Transaction added successfully!</div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Monthly Salary"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (€)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date</label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="frequency">Frequency</label>
          <input
            id="frequency"
            name="frequency"
            type="number"
            step="1"
            min="0"
            value={formData.frequency}
            onChange={handleChange}
            placeholder="1"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="uom">Unit of Measure</label>
          <select
            id="uom"
            name="uom"
            value={formData.uom}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Transaction"}
      </button>
    </form>
  );
};
