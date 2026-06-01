import { useEffect, useState } from "react";
import type { Transaction, UnitOfMeasure } from "@/types";
import { toDate, formatDateString } from "@/lib/forecast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: number,
    field: keyof Omit<Transaction, "id">,
    value: any
  ) => Promise<void>;
  isLoading?: boolean;
}

const toFormData = (transaction: Transaction) => ({
  name: transaction.name,
  amount: String(transaction.amount),
  start_date: formatDateString(toDate(transaction.start_date)),
  end_date: formatDateString(toDate(transaction.end_date)),
  frequency: String(transaction.frequency),
  uom: transaction.uom,
});

export const EditTransactionDialog = ({
  transaction,
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: EditTransactionDialogProps) => {
  const [formData, setFormData] = useState(() =>
    transaction ? toFormData(transaction) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset the form whenever a different transaction is opened
  useEffect(() => {
    if (transaction) {
      setFormData(toFormData(transaction));
      setError(null);
    }
  }, [transaction]);

  if (!transaction || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.name ||
      !formData.amount ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.frequency
    ) {
      setError("Please fill in all fields before saving.");
      return;
    }

    // Only persist the fields that actually changed
    const original = toFormData(transaction);
    const changed: [keyof Omit<Transaction, "id">, any][] = [];
    if (formData.name !== original.name) changed.push(["name", formData.name]);
    if (formData.amount !== original.amount)
      changed.push(["amount", parseFloat(formData.amount)]);
    if (formData.start_date !== original.start_date)
      changed.push(["start_date", formData.start_date]);
    if (formData.end_date !== original.end_date)
      changed.push(["end_date", formData.end_date]);
    if (formData.frequency !== original.frequency)
      changed.push(["frequency", parseInt(formData.frequency)]);
    if (formData.uom !== original.uom) changed.push(["uom", formData.uom]);

    if (changed.length === 0) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      for (const [field, value] of changed) {
        await onSave(transaction.id, field, value);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const busy = isLoading || saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details of this recurring transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Monthly Salary"
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount (€)</Label>
              <Input
                id="edit-amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-start_date">Start Date</Label>
              <Input
                id="edit-start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-end_date">End Date</Label>
              <Input
                id="edit-end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-frequency">Frequency</Label>
              <Input
                id="edit-frequency"
                name="frequency"
                type="number"
                step="1"
                min="0"
                value={formData.frequency}
                onChange={handleChange}
                placeholder="1"
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-uom">Unit of Measure</Label>
              <Select
                value={formData.uom}
                onValueChange={(value) =>
                  setFormData((prev) =>
                    prev ? { ...prev, uom: value as UnitOfMeasure } : prev
                  )
                }
                disabled={busy}
              >
                <SelectTrigger id="edit-uom" className="w-full">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
