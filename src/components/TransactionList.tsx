import { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/types";
import { formatDateString } from "@/lib/forecast";
import { Button } from "@/components/ui/button";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
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
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setEditOpen(true);
  };

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No future transactions found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
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

              <TableCell className="font-medium">{transaction.name}</TableCell>

              <TableCell
                className={
                  transaction.amount < 0 ? "text-negative" : "text-positive"
                }
              >
                {transaction.amount.toFixed(2)}
              </TableCell>

              <TableCell>
                {formatDateString(
                  typeof transaction.start_date === "string"
                    ? new Date(transaction.start_date)
                    : transaction.start_date
                )}
              </TableCell>

              <TableCell>
                {formatDateString(
                  typeof transaction.end_date === "string"
                    ? new Date(transaction.end_date)
                    : transaction.end_date
                )}
              </TableCell>

              <TableCell>{transaction.frequency}</TableCell>

              <TableCell>{transaction.uom}</TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-foreground"
                    onClick={() => handleEdit(transaction)}
                    disabled={isLoading}
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditTransactionDialog
        transaction={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEdit}
        isLoading={isLoading}
      />
    </div>
  );
};
