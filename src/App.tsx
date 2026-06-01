import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { ForecastChart } from "@/components/ForecastChart";
import { calculateResults } from "@/lib/forecast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

function App() {
  const { transactions, futureTransactions, loading, error, add, remove, update } =
    useTransactions();
  const [startingBalance, setStartingBalance] = useState(1000);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddTransaction = async (
    newTransaction: Omit<typeof transactions[0], "id">
  ) => {
    setIsSubmitting(true);
    try {
      await add(newTransaction);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    setIsSubmitting(true);
    try {
      await remove(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (
    id: number,
    field: keyof Omit<typeof transactions[0], "id">,
    value: any
  ) => {
    setIsSubmitting(true);
    try {
      await update(id, field, value);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateTransaction = async (transaction: typeof transactions[0]) => {
    setIsSubmitting(true);
    try {
      const { id, ...rest } = transaction;
      await add({ ...rest, name: rest.name + " (copy)" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const forecastData = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today;
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + forecastMonths);
    return calculateResults(startDate, endDate, startingBalance, futureTransactions);
  })();

  const finalBalance = forecastData.length
    ? forecastData[forecastData.length - 1].balance
    : startingBalance;
  const totalCashFlow = forecastData.reduce((sum, item) => sum + item.cash_flow, 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">💸 Balance Forecast</h1>
          <p className="text-sm text-muted-foreground">
            Forecast your account balance based on recurring transactions
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            Loading transactions...
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Upcoming recurring transactions.</CardDescription>
                </div>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="size-4" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Transaction</DialogTitle>
                      <DialogDescription>
                        Create a new recurring transaction.
                      </DialogDescription>
                    </DialogHeader>
                    <AddTransactionForm
                      onAdd={handleAddTransaction}
                      onSuccess={() => setAddDialogOpen(false)}
                      isLoading={isSubmitting}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={futureTransactions}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleUpdateTransaction}
                  onDuplicate={handleDuplicateTransaction}
                  isLoading={isSubmitting}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="starting-balance">Starting Balance (€)</Label>
                    <Input
                      id="starting-balance"
                      type="number"
                      step="0.01"
                      value={startingBalance}
                      onChange={(e) => setStartingBalance(parseFloat(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="forecast-months">
                      Months to Forecast: {forecastMonths}
                    </Label>
                    <input
                      id="forecast-months"
                      type="range"
                      min="1"
                      max="12"
                      value={forecastMonths}
                      onChange={(e) => setForecastMonths(parseInt(e.target.value))}
                      disabled={isSubmitting}
                      className="accent-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ForecastChart
                  data={forecastData}
                  transactions={futureTransactions}
                  startingBalance={startingBalance}
                />
              </CardContent>
            </Card>

            {forecastData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Starting Balance" value={`€${startingBalance.toFixed(2)}`} />
                    <Stat
                      label="Final Balance"
                      value={`€${finalBalance.toFixed(2)}`}
                      tone={finalBalance < 0 ? "negative" : "positive"}
                    />
                    <Stat
                      label="Total Cash Flow"
                      value={`€${totalCashFlow.toFixed(2)}`}
                      tone={totalCashFlow < 0 ? "negative" : "positive"}
                    />
                    <Stat label="Forecast Period" value={`${forecastMonths} month(s)`} />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Balance Forecast — React + Google Sheets
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1 text-lg font-semibold " +
          (tone === "negative"
            ? "text-negative"
            : tone === "positive"
              ? "text-positive"
              : "")
        }
      >
        {value}
      </div>
    </div>
  );
}

export default App;
