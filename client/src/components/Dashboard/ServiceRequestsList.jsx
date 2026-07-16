import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Send } from "lucide-react";
import EmptyState from "../UI/EmptyState";
import Button from "../UI/Button";
import apiService from "../../services/api";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];
const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-200 text-gray-700",
};

/**
 * ServiceRequestsList component: displays service requests and lets an
 * admin change status and/or send a price quote (emailed to the customer).
 * @param {Object} props - Component props
 * @param {Array} props.serviceRequests - List of service requests
 * @param {Function} props.setServiceRequests - Function to update the list in place
 * @returns {JSX.Element} The rendered ServiceRequestsList component
 */
function ServiceRequestsList({ serviceRequests, setServiceRequests }) {
  const [openId, setOpenId] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [quoteDollars, setQuoteDollars] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const openResponse = (request) => {
    setOpenId(request.id);
    setStatus(request.status);
    setQuoteDollars(request.quote_amount_cents !== null ? (request.quote_amount_cents / 100).toFixed(2) : "");
    setQuoteMessage(request.quote_message || "");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e, request) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { status };
      if (quoteDollars !== "") {
        payload.quote_amount_cents = Math.round(parseFloat(quoteDollars) * 100);
        payload.quote_message = quoteMessage;
      }
      await apiService.respondToServiceRequest(request.id, payload);
      setServiceRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? {
                ...r,
                status,
                ...(payload.quote_amount_cents !== undefined
                  ? { quote_amount_cents: payload.quote_amount_cents, quote_message: quoteMessage }
                  : {}),
              }
            : r
        )
      );
      setSuccess("Service request updated");
      setOpenId(null);
    } catch (err) {
      setError(err.message || "Failed to update service request");
    } finally {
      setSaving(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
      className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
    >
      <h3 className="text-2xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
        <Wrench className="w-6 h-6" />
        <span>Service Requests</span>
      </h3>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
      {serviceRequests.length === 0 && <EmptyState message="No service requests yet." />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceRequests.map((request, index) => (
          <motion.div
            key={request.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-700 font-medium">{request.user_name || "Guest"}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[request.status]}`}>
                {request.status}
              </span>
            </div>
            <p className="text-gray-700">
              <strong>Service Type:</strong> {request.service_type}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {request.description}
            </p>
            {request.quote_amount_cents !== null && (
              <p className="text-primary text-sm font-semibold mb-2">
                Quoted: ${(request.quote_amount_cents / 100).toFixed(2)}
              </p>
            )}

            {openId === request.id ? (
              <form onSubmit={(e) => handleSubmit(e, request)} className="space-y-3 mt-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quote Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={quoteDollars}
                    onChange={(e) => setQuoteDollars(e.target.value)}
                    placeholder="Leave blank to skip quoting"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quote Message</label>
                  <textarea
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-500 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save & Notify"}
                  </Button>
                  <Button
                    onClick={() => setOpenId(null)}
                    className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => openResponse(request)}
                className="mt-3 bg-teal-500 text-white px-3 py-1.5 rounded text-sm"
              >
                Respond
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default ServiceRequestsList;
