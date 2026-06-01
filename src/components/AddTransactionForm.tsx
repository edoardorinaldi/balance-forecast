import { useState } from "react";
import type { Transaction, UnitOfMeasure } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    uom: "month" as UnitOfMeasure,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-positive/30 bg-positive/10 px-3 py-2 text-sm text-positive">
          Transaction added successfully!
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Monthly Salary"
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (€)</Label>
          <Input
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

        <div className="grid gap-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Input
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

        <div className="grid gap-2">
          <Label htmlFor="uom">Unit of Measure</Label>
          <Select
            value={formData.uom}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, uom: value as UnitOfMeasure }))
            }
            disabled={isLoading}
          >
            <SelectTrigger id="uom" className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Transaction"}
      </Button>
    </form>
  );
};
