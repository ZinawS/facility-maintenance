import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Truck, XCircle, FileDown } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";
import { downloadBlob } from "../../utils/downloadBlob";

const INVOICEABLE = ["succeeded", "refunded"];

const STATUS_STYLES = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
  canceled: "bg-gray-200 text-gray-700",
};

const FULFILLMENT_LABELS = {
  pending: "Order placed",
  accepted: "Accepted",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
};

const CANCELABLE = ["pending", "accepted"];

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency?.toUpperCase() || "USD" }).format(
    amount
  );

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = () => {
    apiService
      .getMyPayments()
      .then(setOrders)
      .catch((err) => setError(err.message || "Failed to load order history"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (order) => {
    if (!window.confirm("Cancel this order? If you were already charged, you'll be refunded automatically."))
      return;
    setCancelingId(order.id);
    try {
      await apiService.cancelOrder(order.id);
      setError("");
      load();
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    } finally {
      setCancelingId(null);
    }
  };

  const handleDownloadInvoice = async (order) => {
    setDownloadingId(order.id);
    try {
      const blob = await apiService.downloadMyInvoice(order.id);
      downloadBlob(blob, `invoice-order-${order.id}.pdf`);
    } catch (err) {
      setError(err.message || "Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <motion.section className="mb-12 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-semibold mb-4 flex items-center space-x-2 text-primary">
        <Receipt className="w-6 h-6" />
        <span>Order History</span>
      </h3>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders yet — purchases from the Parts Store or Service Plans will show up here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-gray-800">{order.description}</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-primary font-bold text-lg mb-1">
                {formatAmount(order.amount, order.currency)}
              </p>
              <p className="text-gray-500 text-xs mb-2">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <p className="text-sm font-medium text-gray-700 mb-1">
                {FULFILLMENT_LABELS[order.fulfillment_status] || order.fulfillment_status}
              </p>
              {order.tracking_number && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <Truck className="w-3.5 h-3.5" /> Tracking: {order.tracking_number}
                </p>
              )}
              {order.status === "refunded" && (
                <p className="text-xs text-purple-600 mb-2">Refunded{order.cancel_reason ? ` — ${order.cancel_reason}` : ""}</p>
              )}
              {order.status === "pending" && order.fulfillment_status === "pending" && (
                <p className="text-gray-400 text-xs mb-2">Awaiting payment confirmation.</p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {INVOICEABLE.includes(order.status) && (
                  <Button
                    onClick={() => handleDownloadInvoice(order)}
                    disabled={downloadingId === order.id}
                    className="bg-primary text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {downloadingId === order.id ? "Downloading..." : "Invoice"}
                  </Button>
                )}
                {CANCELABLE.includes(order.fulfillment_status) && (
                  <Button
                    onClick={() => handleCancel(order)}
                    disabled={cancelingId === order.id}
                    className="bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {cancelingId === order.id ? "Canceling..." : "Cancel Order"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default OrderHistory;
