import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Send, Truck, FileDown } from "lucide-react";
import EmptyState from "../UI/EmptyState";
import Button from "../UI/Button";
import apiService from "../../services/api";
import { downloadBlob } from "../../utils/downloadBlob";

const INVOICEABLE = ["succeeded", "refunded"];

const FULFILLMENT_OPTIONS = ["pending", "accepted", "processing", "shipped", "delivered", "canceled"];
const STATUS_STYLES = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
  canceled: "bg-gray-200 text-gray-700",
};
const FULFILLMENT_STYLES = {
  pending: "bg-gray-100 text-gray-700",
  accepted: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

/**
 * PaymentsList component for displaying and managing orders. Non-part
 * payments (plans, service requests, custom) don't ship, so fulfillment
 * controls are shown for every order but are most meaningful for parts.
 * @param {Object} props - Component props
 * @param {Array} props.payments - List of payment records
 * @param {Function} props.setPayments - Function to update the list in place
 * @returns {JSX.Element} The rendered PaymentsList component
 */
function PaymentsList({ payments, setPayments }) {
  const [openId, setOpenId] = useState(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [saving, setSaving] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDownloadInvoice = async (payment) => {
    setDownloadingId(payment.id);
    try {
      const blob = await apiService.downloadInvoice(payment.id);
      downloadBlob(blob, `invoice-order-${payment.id}.pdf`);
    } catch (err) {
      setError(err.message || "Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const openEdit = (payment) => {
    setOpenId(payment.id);
    setFulfillmentStatus(payment.fulfillment_status || "pending");
    setTrackingNumber(payment.tracking_number || "");
    setCancelReason("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e, payment) => {
    e.preventDefault();
    setSaving(payment.id);
    try {
      const payload = { fulfillment_status: fulfillmentStatus };
      if (trackingNumber) payload.tracking_number = trackingNumber;
      if (fulfillmentStatus === "canceled" && cancelReason) payload.cancel_reason = cancelReason;
      await apiService.updateOrderStatus(payment.id, payload);
      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id
            ? {
                ...p,
                fulfillment_status: fulfillmentStatus,
                tracking_number: trackingNumber || p.tracking_number,
                status: fulfillmentStatus === "canceled" && p.status === "succeeded" ? "refunded" : p.status,
              }
            : p
        )
      );
      setSuccess(`Order #${payment.id} updated`);
      setOpenId(null);
    } catch (err) {
      setError(err.message || "Failed to update order");
    } finally {
      setSaving(null);
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
        <DollarSign className="w-6 h-6" />
        <span>Orders &amp; Payments</span>
      </h3>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
      {payments.length === 0 && <EmptyState message="No payments yet." />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-700 font-medium">{payment.user_name || "Guest"}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[payment.status] || "bg-gray-100 text-gray-700"}`}>
                {payment.status}
              </span>
            </div>
            <p className="text-gray-700">
              <strong>Amount:</strong> ${payment.amount}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {payment.description}
            </p>
            <span
              className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${
                FULFILLMENT_STYLES[payment.fulfillment_status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {payment.fulfillment_status || "pending"}
            </span>
            {payment.tracking_number && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <Truck className="w-3.5 h-3.5" /> {payment.tracking_number}
              </p>
            )}

            {openId === payment.id ? (
              <form onSubmit={(e) => handleSubmit(e, payment)} className="space-y-2 mt-2 border-t pt-3">
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                >
                  {FULFILLMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {fulfillmentStatus === "shipped" && (
                  <input
                    type="text"
                    placeholder="Tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  />
                )}
                {fulfillmentStatus === "canceled" && (
                  <>
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                    />
                    {payment.status === "succeeded" && (
                      <p className="text-xs text-amber-600">This will automatically refund the customer via Stripe.</p>
                    )}
                  </>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving === payment.id}
                    className="bg-teal-500 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" /> {saving === payment.id ? "Saving..." : "Save"}
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
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  onClick={() => openEdit(payment)}
                  className="bg-teal-500 text-white px-3 py-1.5 rounded text-sm"
                >
                  Update Status
                </Button>
                {INVOICEABLE.includes(payment.status) && (
                  <Button
                    onClick={() => handleDownloadInvoice(payment)}
                    disabled={downloadingId === payment.id}
                    className="bg-primary text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {downloadingId === payment.id ? "Downloading..." : "Invoice"}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default PaymentsList;
