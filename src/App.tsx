import { useState } from "react";
import { useTransactions } from "./hooks/useTransactions";
import { AddTransactionForm } from "./components/AddTransactionForm";
import { TransactionList } from "./components/TransactionList";
import { ForecastChart } from "./components/ForecastChart";
import { calculateResults } from "./lib/forecast";
import "./App.css";

function App() {
  const { transactions, futureTransactions, loading, error, add, remove, update } =
    useTransactions();
  const [startingBalance, setStartingBalance] = useState(1000);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Calculate forecast
  const forecastData = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = today;
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + forecastMonths);

    return calculateResults(startDate, endDate, startingBalance, futureTransactions);
  })();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💸 Balance Forecast</h1>
        <p>Forecast your account balance based on recurring transactions</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : (
          <>
            {/* Add Transaction Form */}
            <section className="section">
              <AddTransactionForm onAdd={handleAddTransaction} isLoading={isSubmitting} />
            </section>

            {/* Transactions Table */}
            <section className="section">
              <TransactionList
                transactions={futureTransactions}
                onDelete={handleDeleteTransaction}
                onEdit={handleUpdateTransaction}
                isLoading={isSubmitting}
              />
            </section>

            {/* Forecast Controls */}
            <section className="section forecast-controls">
              <h3>Forecast Settings</h3>
              <div className="controls-row">
                <div className="control-group">
                  <label htmlFor="starting-balance">Starting Balance (€)</label>
                  <input
                    id="starting-balance"
                    type="number"
                    step="0.01"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(parseFloat(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="forecast-months">
                    Months to Forecast: {forecastMonths}
                  </label>
                  <input
                    id="forecast-months"
                    type="range"
                    min="1"
                    max="12"
                    value={forecastMonths}
                    onChange={(e) => setForecastMonths(parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </section>

            {/* Forecast Chart */}
            <section className="section">
              <ForecastChart
                data={forecastData}
                transactions={futureTransactions}
                startingBalance={startingBalance}
              />
            </section>

            {/* Summary Statistics */}
            {forecastData.length > 0 && (
              <section className="section summary-stats">
                <h3>Summary</h3>
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-label">Starting Balance</span>
                    <span className="stat-value">€{startingBalance.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Final Balance</span>
                    <span className="stat-value">
                      €{forecastData[forecastData.length - 1].balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Cash Flow</span>
                    <span className="stat-value">
                      €
                      {forecastData
                        .reduce((sum, item) => sum + item.cash_flow, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Forecast Period</span>
                    <span className="stat-value">{forecastMonths} month(s)</span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Balance Forecast - React + Supabase</p>
      </footer>
    </div>
  );
}

export default App;
