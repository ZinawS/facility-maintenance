import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import apiService from "../../services/api";
import UserManagement from "./UserManagement";
import BlogManagement from "./BlogManagement";
import PaymentsList from "./PaymentsList";
import ServiceRequestsList from "./ServiceRequestsList";
import ContactMessagesList from "./ContactMessagesList";
import FeedbackApproval from "./FeedbackApproval";

/**
 * AdminDashboard component for managing users, blogs, feedback, payments, and service requests
 * @returns {JSX.Element} The rendered AdminDashboard component
 */
function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          userData,
          feedbackData,
          blogData,
          paymentData,
          requestData,
          messageData,
        ] = await Promise.all([
          apiService.getUsers(),
          apiService.getFeedback(),
          apiService.getBlogs(),
          apiService.getPayments(),
          apiService.getServiceRequests(),
          apiService.getContactMessages(),
        ]);
        setUsers(userData);
        setFeedback(feedbackData);
        setBlogs(blogData);
        setPayments(paymentData);
        setServiceRequests(requestData);
        setContactMessages(messageData);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12"
      role="main"
      aria-label="Admin Dashboard"
    >
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">
        Admin Dashboard
      </h2>
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
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-500 mb-4 flex items-center space-x-2 text-center"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </motion.p>
      )}

      <UserManagement
        users={users}
        setUsers={setUsers}
        setSuccess={setSuccess}
        setError={setError}
      />
      <BlogManagement
        blogs={blogs}
        setBlogs={setBlogs}
        setSuccess={setSuccess}
        setError={setError}
      />
      <PaymentsList payments={payments} />
      <ServiceRequestsList serviceRequests={serviceRequests} />
      <ContactMessagesList contactMessages={contactMessages} />
      <FeedbackApproval
        feedback={feedback}
        setFeedback={setFeedback}
        setSuccess={setSuccess}
        setError={setError}
      />
    </motion.div>
  );
}

export default AdminDashboard;
