import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import apiService from "../services/api";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";

/**
 * Dynamic service detail page, backed entirely by the admin-managed
 * /api/public/services resource — no per-service hardcoded pages.
 */
function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const services = await apiService.getServices();
        const match = services.find((s) => s.slug === slug);
        if (!active) return;
        if (!match) {
          setError("Service not found");
        } else {
          setService(match);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load service");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <Spinner size="lg" className="min-h-[60vh]" />;

  if (error || !service) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center py-20">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Service not found</h1>
        <Button href="/services" className="bg-primary text-white px-6 py-3 rounded-full font-semibold">
          View All Services
        </Button>
      </div>
    );
  }

  const Icon = Icons[service.icon] || Icons.Settings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-primary/10 p-4 rounded-xl inline-flex mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-white">{service.name}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{service.short_description}</p>

        {service.image_url && (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-64 object-cover rounded-2xl mb-8 shadow-lg"
          />
        )}

        {service.description && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
            {service.description}
          </p>
        )}

        {service.features?.length > 0 && (
          <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-4 uppercase tracking-wide text-sm">
              Key Features
            </h2>
            <ul className="space-y-2">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/contact")}
            className="bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-full font-semibold transition-all duration-300 shadow-lg"
          >
            Request This Service
          </Button>
          <Button
            href="/services"
            className="bg-transparent border-2 border-primary text-primary py-3 px-8 rounded-full font-semibold"
          >
            View All Services
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceDetail;
