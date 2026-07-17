import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, Download, Plus, Trash2, TrendingUp, TrendingDown, Scale } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";
import { downloadBlob } from "../../utils/downloadBlob";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

const CATEGORIES = ["inventory", "payroll", "utilities", "rent", "marketing", "equipment", "other"];

const TYPE_STYLES = {
  income: "text-green-600",
  refund: "text-red-600",
  expense: "text-red-600",
};

const emptyExpenseForm = { description: "", amount: "", category: "other", expense_date: todayISO() };

/**
 * Full transaction ledger: income derived automatically from payments
 * (succeeded sales, refunds as their own reversing line) plus manually
 * entered expenses, with a running balance — see server/routes/ledger.js.
 */
function Ledger() {
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [exporting, setExporting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyExpenseForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await apiService.getLedger({ from, to }));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await apiService.exportLedger({ from, to });
      downloadBlob(blob, `ledger-${from}-to-${to}.csv`);
    } catch (err) {
      setError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.createExpense(form);
      setSuccess("Expense added");
      setError("");
      setForm(emptyExpenseForm);
      setIsFormOpen(false);
      await load();
    } catch (err) {
      setError(err.message || "Failed to add expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (entry) => {
    if (!window.confirm("Delete this expense entry?")) return;
    try {
      await apiService.deleteExpense(entry.source_id);
      setSuccess("Expense deleted");
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete expense");
    }
  };

  return (
    <motion.section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <BookOpenCheck className="w-6 h-6" />
          <span>Ledger</span>
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="ml-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-2 py-1"
            />
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="ml-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-2 py-1"
            />
          </label>
          <button onClick={load} className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
            Apply
          </button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-secondary text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

      {isFormOpen && (
        <form
          onSubmit={handleAddExpense}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.expense_date}
              onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
          <div className="lg:col-span-5">
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {saving ? <Spinner size="sm" /> : "Save Expense"}
            </Button>
          </div>
        </form>
      )}

      {loading && <Spinner size="lg" />}

      {!loading && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Income</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" /> ${data.totals.income.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Expenses &amp; Refunds</p>
              <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
                <TrendingDown className="w-5 h-5" /> ${data.totals.expenses.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Net</p>
              <p className="text-2xl font-bold text-primary flex items-center gap-1">
                <Scale className="w-5 h-5" /> ${data.totals.net.toFixed(2)}
              </p>
            </div>
          </div>

          {data.entries.length === 0 ? (
            <EmptyState message="No transactions in this range." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4 text-right">Amount</th>
                    <th className="py-2 pr-4 text-right">Balance</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => (
                    <tr key={`${entry.source}-${entry.source_id}-${entry.type}-${i}`} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 capitalize text-gray-600 dark:text-gray-300">{entry.type}</td>
                      <td className="py-2 pr-4 text-gray-800 dark:text-gray-100">{entry.description}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-300 capitalize">{entry.category || "—"}</td>
                      <td className={`py-2 pr-4 text-right font-medium ${TYPE_STYLES[entry.type] || ""}`}>
                        {entry.amount >= 0 ? "+" : "-"}${Math.abs(entry.amount).toFixed(2)}
                      </td>
                      <td className="py-2 pr-4 text-right text-gray-700 dark:text-gray-200">
                        ${entry.balance.toFixed(2)}
                      </td>
                      <td className="py-2 text-right">
                        {entry.type === "expense" && (
                          <button
                            onClick={() => handleDeleteExpense(entry)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </motion.section>
  );
}

export default Ledger;
