import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import apiService from "../../services/api";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";

const STATUS_STYLES = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  canceled: "bg-gray-200 text-gray-700",
};

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency?.toUpperCase() || "USD" }).format(
    amount
  );

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiService
      .getMyPayments()
      .then(setOrders)
      .catch((err) => setError(err.message || "Failed to load order history"))
      .finally(() => setLoading(false));
  }, []);

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
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-primary font-bold text-lg mb-1">
                {formatAmount(order.amount, order.currency)}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {order.status === "pending" && (
                <p className="text-gray-400 text-xs mt-2">
                  Awaiting payment confirmation.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default OrderHistory;
