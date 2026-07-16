import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Bell,
  BarChart3,
  LayoutGrid,
  Users as UsersIcon,
  ClipboardList,
  Wrench,
  UserRound,
  HelpCircle,
  Layers,
  Package,
  BookOpen,
  Video,
} from "lucide-react";
import apiService from "../../services/api";
import UserManagement from "./UserManagement";
import BlogManagement from "./BlogManagement";
import PaymentsList from "./PaymentsList";
import ServiceRequestsList from "./ServiceRequestsList";
import ContactMessagesList from "./ContactMessagesList";
import FeedbackApproval from "./FeedbackApproval";
import ResourceManager from "./ResourceManager";
import SiteSettingsPanel from "./SiteSettingsPanel";
import Reports from "./Reports";
import AlertsPanel from "./AlertsPanel";
import Spinner from "../UI/Spinner";
import { resolveMediaUrl } from "../../utils/media";

const TABS = [
  { key: "alerts", label: "Alerts", icon: <Bell className="w-4 h-4" /> },
  { key: "reports", label: "Reports", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "content", label: "Content", icon: <LayoutGrid className="w-4 h-4" /> },
  { key: "users", label: "Users", icon: <UsersIcon className="w-4 h-4" /> },
  { key: "operations", label: "Operations", icon: <ClipboardList className="w-4 h-4" /> },
];

const SERVICE_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug (used in URL, e.g. \"hvac\")", type: "text", required: true },
  { name: "short_description", label: "Short Description", type: "textarea", required: true },
  { name: "description", label: "Full Description", type: "textarea" },
  { name: "icon", label: "Icon (lucide-react name, e.g. \"Wrench\")", type: "text" },
  { name: "features", label: "Key Features", type: "string-array" },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const TEAM_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", required: true },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const FAQ_FIELDS = [
  { name: "question", label: "Question", type: "text", required: true },
  { name: "answer", label: "Answer", type: "textarea", required: true },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const PLAN_FIELDS = [
  { name: "name", label: "Plan Name", type: "text", required: true },
  { name: "price_cents", label: "Price (cents, leave blank for \"Contact Us\")", type: "number" },
  { name: "price_label", label: "Price Label (shown when no price set)", type: "text" },
  { name: "billing_period", label: "Billing Period (e.g. \"month\")", type: "text" },
  { name: "features", label: "Features", type: "string-array" },
  { name: "is_featured", label: "Featured / Most Popular", type: "checkbox" },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const PART_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "category", label: "Category", type: "text" },
  { name: "price_cents", label: "Price (cents)", type: "number", required: true },
  { name: "sku", label: "SKU", type: "text" },
  { name: "stock_quantity", label: "Stock Quantity", type: "number", default: 0 },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const GUIDE_FIELDS = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "steps", label: "Steps", type: "string-array" },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const VIDEO_FIELDS = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "video_url", label: "Video URL (YouTube link or direct .mp4)", type: "text", required: true },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "is_active", label: "Published", type: "checkbox", default: true },
];

const resourceApi = (plural, singular) => ({
  adminList: apiService[`get${plural}Admin`],
  create: apiService[`create${singular}`],
  update: apiService[`update${singular}`],
  remove: apiService[`delete${singular}`],
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [alertCount, setAlertCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, feedbackData, blogData, paymentData, requestData, messageData] = await Promise.all([
          apiService.getUsers({ limit: 100 }),
          apiService.getFeedback({ limit: 100 }),
          apiService.getBlogs(),
          apiService.getPayments({ limit: 100 }),
          apiService.getServiceRequests({ limit: 100 }),
          apiService.getContactMessages({ limit: 100 }),
        ]);
        setUsers(userData.data);
        setFeedback(feedbackData.data);
        setBlogs(blogData);
        setPayments(paymentData.data);
        setServiceRequests(requestData.data);
        setContactMessages(messageData.data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">Admin Dashboard</h2>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 flex items-center justify-center gap-2 text-center"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-500 mb-4 flex items-center justify-center gap-2 text-center"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </motion.p>
      )}

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === "alerts" && alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : (
        <>
          {activeTab === "alerts" && <AlertsPanel onCountChange={setAlertCount} />}
          {activeTab === "reports" && <Reports />}

          {activeTab === "content" && (
            <>
              <ResourceManager
                title="Services"
                icon={<Wrench className="w-6 h-6" />}
                api={resourceApi("Services", "Service")}
                fields={SERVICE_FIELDS}
                hasImage
                renderPreview={(item) => (
                  <>
                    {item.image_url && (
                      <img
                        src={resolveMediaUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.short_description}</p>
                  </>
                )}
              />
              <ResourceManager
                title="Team Members"
                icon={<UserRound className="w-6 h-6" />}
                api={resourceApi("TeamMembers", "TeamMember")}
                fields={TEAM_FIELDS}
                hasImage
                renderPreview={(item) => (
                  <>
                    {item.image_url && (
                      <img
                        src={resolveMediaUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </>
                )}
              />
              <ResourceManager
                title="FAQs"
                icon={<HelpCircle className="w-6 h-6" />}
                api={resourceApi("Faqs", "Faq")}
                fields={FAQ_FIELDS}
                renderPreview={(item) => (
                  <>
                    <p className="font-semibold">{item.question}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.answer}</p>
                  </>
                )}
              />
              <ResourceManager
                title="Service Plans"
                icon={<Layers className="w-6 h-6" />}
                api={resourceApi("ServicePlans", "ServicePlan")}
                fields={PLAN_FIELDS}
                renderPreview={(item) => (
                  <>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.price_cents !== null ? `$${(item.price_cents / 100).toFixed(2)}` : item.price_label}
                    </p>
                  </>
                )}
              />
              <ResourceManager
                title="Parts"
                icon={<Package className="w-6 h-6" />}
                api={resourceApi("Parts", "Part")}
                fields={PART_FIELDS}
                hasImage
                renderPreview={(item) => (
                  <>
                    {item.image_url && (
                      <img
                        src={resolveMediaUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">${(item.price_cents / 100).toFixed(2)}</p>
                  </>
                )}
              />
              <ResourceManager
                title="Knowledge Guides"
                icon={<BookOpen className="w-6 h-6" />}
                api={resourceApi("KnowledgeGuides", "KnowledgeGuide")}
                fields={GUIDE_FIELDS}
                renderPreview={(item) => <p className="font-semibold">{item.title}</p>}
              />
              <ResourceManager
                title="Knowledge Videos"
                icon={<Video className="w-6 h-6" />}
                api={resourceApi("KnowledgeVideos", "KnowledgeVideo")}
                fields={VIDEO_FIELDS}
                renderPreview={(item) => <p className="font-semibold">{item.title}</p>}
              />
              <BlogManagement blogs={blogs} setBlogs={setBlogs} setSuccess={setSuccess} setError={setError} />
              <SiteSettingsPanel />
            </>
          )}

          {activeTab === "users" && (
            <UserManagement users={users} setUsers={setUsers} setSuccess={setSuccess} setError={setError} />
          )}

          {activeTab === "operations" && (
            <>
              <PaymentsList payments={payments} />
              <ServiceRequestsList serviceRequests={serviceRequests} setServiceRequests={setServiceRequests} />
              <ContactMessagesList contactMessages={contactMessages} />
              <FeedbackApproval
                feedback={feedback}
                setFeedback={setFeedback}
                setSuccess={setSuccess}
                setError={setError}
              />
            </>
          )}
        </>
      )}
    </motion.div>
  );
}

export default AdminDashboard;
