import { useState } from "react";
import { Check, Copy, Pencil, Trash2, X } from "lucide-react";
import type { Transaction } from "@/types";
import { formatDateString } from "@/lib/forecast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, field: keyof Omit<Transaction, "id">, value: any) => Promise<void>;
  onDuplicate?: (transaction: Transaction) => Promise<void>;
  isLoading?: boolean;
}

export const TransactionList = ({
  transactions,
  onDelete,
  onEdit,
  onDuplicate = async () => {},
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
      if (editField === "amount") {
        parsedValue = parseFloat(editValue);
      } else if (editField === "frequency") {
        parsedValue = parseInt(editValue);
      }

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

  const isEditing = (id: number, field: keyof Omit<Transaction, "id">) =>
    editingId === id && editField === field;

  // Editable cell: shows value + pencil, or the editor when active
  const editableCell = (
    transaction: Transaction,
    field: keyof Omit<Transaction, "id">,
    display: React.ReactNode,
    editor: React.ReactNode
  ) =>
    isEditing(transaction.id, field) ? (
      editor
    ) : (
      <div className="flex items-center gap-1.5">
        <span>{display}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground"
          onClick={() => handleEdit(transaction, field)}
          disabled={isLoading}
          title={`Edit ${field}`}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    );

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No future transactions found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Amount (€)</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-muted-foreground">{transaction.id}</TableCell>

              <TableCell className="font-medium">
                {editableCell(
                  transaction,
                  "name",
                  transaction.name,
                  <Input
                    className="h-8"
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                )}
              </TableCell>

              <TableCell
                className={
                  transaction.amount < 0 ? "text-negative" : "text-positive"
                }
              >
                {editableCell(
                  transaction,
                  "amount",
                  transaction.amount.toFixed(2),
                  <Input
                    className="h-8 w-28"
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                )}
              </TableCell>

              <TableCell>
                {editableCell(
                  transaction,
                  "start_date",
                  formatDateString(
                    typeof transaction.start_date === "string"
                      ? new Date(transaction.start_date)
                      : transaction.start_date
                  ),
                  <Input
                    className="h-8"
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                )}
              </TableCell>

              <TableCell>
                {editableCell(
                  transaction,
                  "end_date",
                  formatDateString(
                    typeof transaction.end_date === "string"
                      ? new Date(transaction.end_date)
                      : transaction.end_date
                  ),
                  <Input
                    className="h-8"
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                )}
              </TableCell>

              <TableCell>
                {editableCell(
                  transaction,
                  "frequency",
                  transaction.frequency,
                  <Input
                    className="h-8 w-20"
                    type="number"
                    step="1"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                )}
              </TableCell>

              <TableCell>
                {editableCell(
                  transaction,
                  "uom",
                  transaction.uom,
                  <Select value={editValue} onValueChange={setEditValue}>
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">day</SelectItem>
                      <SelectItem value="week">week</SelectItem>
                      <SelectItem value="month">month</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {editingId === transaction.id ? (
                    <>
                      <Button
                        size="icon"
                        className="size-7"
                        onClick={() => handleSaveEdit(transaction.id)}
                        disabled={isLoading}
                        title="Save"
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        title="Cancel"
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground"
                        onClick={() => onDuplicate(transaction)}
                        disabled={isLoading}
                        title="Duplicate"
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(transaction.id)}
                        disabled={isLoading}
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
