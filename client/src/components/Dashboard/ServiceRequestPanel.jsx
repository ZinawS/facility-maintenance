import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ClipboardList, Send, CheckCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";
import StripeCheckoutForm from "../UI/StripeCheckoutForm";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const SERVICE_TYPES = [
  "HVAC Maintenance",
  "Walk-in Cooler/Freezer",
  "Commercial Refrigeration",
  "HVAC Installation",
  "Energy Efficiency Audit",
  "Indoor Air Quality",
  "Other",
];

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-200 text-gray-700",
};

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

function ServiceRequestPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ service_type: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [paidIds, setPaidIds] = useState(new Set());

  const load = async () => {
    try {
      setRequests(await apiService.getMyServiceRequests());
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.submitServiceRequest(form);
      setForm({ service_type: "", description: "" });
      await load();
    } catch (err) {
      setError(err.message || "Failed to submit service request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section className="bg-white rounded-lg shadow-md p-6 mb-12">
      <h3 className="text-2xl font-semibold mb-4 flex items-center space-x-2 text-primary">
        <ClipboardList className="w-6 h-6" />
        <span>Service Requests</span>
      </h3>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-gray-50 p-6 rounded-lg">
        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Service Type</label>
          <select
            value={form.service_type}
            onChange={(e) => setForm((prev) => ({ ...prev, service_type: e.target.value }))}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a service...</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Describe the issue</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState message="You haven't submitted any service requests yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{request.service_type}</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[request.status]}`}>
                  {request.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{request.description}</p>

              {request.quote_amount_cents !== null && (
                <div className="bg-white border border-primary/20 rounded-lg p-4">
                  <p className="font-semibold text-primary mb-1">
                    Quote: {formatPrice(request.quote_amount_cents)}
                  </p>
                  {request.quote_message && (
                    <p className="text-sm text-gray-600 mb-3">{request.quote_message}</p>
                  )}
                  {paidIds.has(request.id) ? (
                    <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Payment submitted
                    </p>
                  ) : payingId === request.id ? (
                    stripePromise && (
                      <Elements stripe={stripePromise}>
                        <StripeCheckoutForm
                          label={`Pay quote for ${request.service_type}`}
                          buttonLabel={`Pay ${formatPrice(request.quote_amount_cents)}`}
                          createIntent={() => apiService.createServiceRequestPayment(request.id)}
                          onSuccess={() => setPaidIds((prev) => new Set(prev).add(request.id))}
                        />
                      </Elements>
                    )
                  ) : (
                    <Button
                      onClick={() => setPayingId(request.id)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Pay This Quote
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default ServiceRequestPanel;
