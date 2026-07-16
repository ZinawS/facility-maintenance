import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { BarChart3, Download, TrendingUp } from "lucide-react";
import apiService from "../../services/api";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

const STATUS_COLORS = {
  succeeded: "#16A34A",
  approved: "#16A34A",
  completed: "#16A34A",
  pending: "#D97706",
  failed: "#DC2626",
  rejected: "#DC2626",
  canceled: "#6B7280",
};
const statusColor = (status) => STATUS_COLORS[status] || "#1E40AF";

const EXPORTS = [
  { type: "payments", label: "Payments" },
  { type: "service-requests", label: "Service Requests" },
  { type: "feedback", label: "Feedback" },
  { type: "contact-messages", label: "Contact Messages" },
  { type: "users", label: "Users" },
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Reports() {
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingType, setExportingType] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setData(await apiService.getReportsSummary({ from, to }));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (type) => {
    setExportingType(type);
    try {
      const blob = await apiService.exportReport(type, { from, to });
      downloadBlob(blob, `${type}-${from}-to-${to}.csv`);
    } catch (err) {
      setError(err.message || "Export failed");
    } finally {
      setExportingType(null);
    }
  };

  const totalRevenueCents = data?.revenueByDay.reduce((sum, d) => sum + Number(d.revenue || 0) * 100, 0) ?? 0;

  return (
    <motion.section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          <span>Reports</span>
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
          <button
            onClick={load}
            className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
          >
            Apply
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {loading && <Spinner size="lg" />}

      {!loading && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-primary flex items-center gap-1">
                <TrendingUp className="w-5 h-5" /> ${(totalRevenueCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">New Users</p>
              <p className="text-2xl font-bold text-primary">
                {data.usersByDay.reduce((sum, d) => sum + Number(d.count), 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Payments</p>
              <p className="text-2xl font-bold text-primary">
                {data.paymentsByStatus.reduce((sum, d) => sum + Number(d.count), 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Revenue Over Time</h4>
              {data.revenueByDay.length === 0 ? (
                <EmptyState message="No revenue in this range." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#1E40AF" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">New Users Over Time</h4>
              {data.usersByDay.length === 0 ? (
                <EmptyState message="No new users in this range." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.usersByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Payments by Status</h4>
              {data.paymentsByStatus.length === 0 ? (
                <EmptyState message="No payments in this range." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.paymentsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.paymentsByStatus.map((entry) => (
                        <Cell key={entry.status} fill={statusColor(entry.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Service Requests by Status</h4>
              {data.serviceRequestsByStatus.length === 0 ? (
                <EmptyState message="No service requests in this range." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.serviceRequestsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.serviceRequestsByStatus.map((entry) => (
                        <Cell key={entry.status} fill={statusColor(entry.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Export Data (CSV)</h4>
            <div className="flex flex-wrap gap-3">
              {EXPORTS.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  disabled={exportingType === type}
                  className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                  {exportingType === type ? "Exporting…" : label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
}

export default Reports;
