import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, AlertCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import apiService from "../services/api";
import ClientDashboard from "../components/Dashboard/ClientDashboard";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import Spinner from "../components/UI/Spinner";

/**
 * Dashboard component for displaying user-specific dashboard
 * @returns {JSX.Element} The rendered Dashboard component
 */
function Dashboard() {
  const { user } = useContext(AuthContext);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !apiService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user.role !== "client") {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [history, equip] = await Promise.all([
          apiService.getServiceHistory(),
          apiService.getEquipment(),
        ]);
        setServiceHistory(history);
        setEquipment(equip);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (!user) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12"
      role="main"
      aria-label="Dashboard Page"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-primary flex items-center justify-center space-x-2">
        <User className="w-8 h-8" />
        <span>Welcome, {user?.name}</span>
      </h1>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 flex items-center space-x-2 text-center"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.p>
      )}
      {loading ? (
        <Spinner size="lg" />
      ) : user.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <ClientDashboard
          serviceHistory={serviceHistory}
          equipment={equipment}
        />
      )}
    </motion.div>
  );
}

export default Dashboard;
