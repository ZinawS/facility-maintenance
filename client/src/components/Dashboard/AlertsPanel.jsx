import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Mail, MessageSquare, Wrench, CheckCircle, X, Send } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";

const TYPE_META = {
  contact_message: { icon: Mail, label: "Contact Message", color: "text-blue-600 bg-blue-50" },
  feedback: { icon: MessageSquare, label: "New Feedback", color: "text-purple-600 bg-purple-50" },
  service_request: { icon: Wrench, label: "Service Request", color: "text-amber-600 bg-amber-50" },
};

/**
 * Everything currently awaiting admin action in one place: unread contact
 * messages, unreviewed feedback, and unquoted service requests. Each item
 * has its own inline action; taking it removes the item from this list.
 */
function AlertsPanel({ onCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [quoteForms, setQuoteForms] = useState({});

  const load = async () => {
    try {
      const { items: alertItems } = await apiService.getAlerts();
      setItems(alertItems);
      onCountChange?.(alertItems.length);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = (id, type) => {
    setItems((prev) => {
      const next = prev.filter((item) => !(item.id === id && item.type === type));
      onCountChange?.(next.length);
      return next;
    });
  };

  const handleMarkRead = async (item) => {
    setBusyId(item.id);
    try {
      await apiService.markContactMessageRead(item.id);
      removeItem(item.id, item.type);
    } catch (err) {
      setError(err.message || "Failed to mark as read");
    } finally {
      setBusyId(null);
    }
  };

  const handleFeedbackAction = async (item, action) => {
    setBusyId(item.id);
    try {
      if (action === "approve") await apiService.approveFeedback(item.id);
      else await apiService.rejectFeedback(item.id);
      removeItem(item.id, item.type);
    } catch (err) {
      setError(err.message || "Failed to update feedback");
    } finally {
      setBusyId(null);
    }
  };

  const updateQuoteForm = (id, field, value) =>
    setQuoteForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleQuoteSubmit = async (item, e) => {
    e.preventDefault();
    const form = quoteForms[item.id] || {};
    setBusyId(item.id);
    try {
      const payload = { status: "In Progress" };
      if (form.amount) {
        payload.quote_amount_cents = Math.round(parseFloat(form.amount) * 100);
        payload.quote_message = form.message || "";
      }
      await apiService.respondToServiceRequest(item.id, payload);
      removeItem(item.id, item.type);
    } catch (err) {
      setError(err.message || "Failed to respond to service request");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <motion.section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <Bell className="w-6 h-6" />
          <span>Needs Your Attention</span>
        </h3>
        {items.length > 0 && (
          <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      {items.length === 0 ? (
        <EmptyState message="All caught up — nothing needs your attention right now." icon={<CheckCircle className="w-10 h-10 mb-3 text-green-400" />} />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => {
              const meta = TYPE_META[item.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className={`p-2 rounded-lg ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                          {meta.label}
                        </p>

                        {item.type === "contact_message" && (
                          <>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {item.name} {item.company && `(${item.company})`}
                            </p>
                            <p className="text-sm text-gray-500 mb-1">
                              {item.email} · {item.phone}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{item.message}</p>
                          </>
                        )}

                        {item.type === "feedback" && (
                          <>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {item.user_name || "Guest"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{item.comment}</p>
                          </>
                        )}

                        {item.type === "service_request" && (
                          <>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {item.user_name || "Guest"} — {item.service_type}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pl-11">
                    {item.type === "contact_message" && (
                      <Button
                        onClick={() => handleMarkRead(item)}
                        disabled={busyId === item.id}
                        className="bg-primary text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark as Read
                      </Button>
                    )}

                    {item.type === "feedback" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleFeedbackAction(item, "approve")}
                          disabled={busyId === item.id}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleFeedbackAction(item, "reject")}
                          disabled={busyId === item.id}
                          className="bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    )}

                    {item.type === "service_request" && (
                      <form onSubmit={(e) => handleQuoteSubmit(item, e)} className="space-y-2 max-w-sm">
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="Quote amount ($, optional)"
                          value={quoteForms[item.id]?.amount || ""}
                          onChange={(e) => updateQuoteForm(item.id, "amount", e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-sm"
                        />
                        <textarea
                          placeholder="Quote message (optional)"
                          rows={2}
                          value={quoteForms[item.id]?.message || ""}
                          onChange={(e) => updateQuoteForm(item.id, "message", e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-sm"
                        />
                        <Button
                          type="submit"
                          disabled={busyId === item.id}
                          className="bg-primary text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                        >
                          <Send className="w-3.5 h-3.5" /> {busyId === item.id ? "Saving..." : "Respond"}
                        </Button>
                      </form>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

export default AlertsPanel;
