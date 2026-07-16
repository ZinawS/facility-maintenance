import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    "VITE_API_URL is not set — falling back to http://localhost:4000. Set it in client/.env for other environments."
  );
}

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const validateToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && validateToken()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("unauthorized", { detail: { message: "Token expired" } }));
    }
    return Promise.reject(error);
  }
);

/** Unwraps an axios call and normalizes errors to a plain, user-facing message. */
async function request(promise, fallbackMessage) {
  try {
    const response = await promise;
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || fallbackMessage);
  }
}

/** Builds a multipart/form-data body; arrays/booleans are serialized so the server can parse them. */
function toFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

/**
 * Builds public list / admin list+create+update+delete methods for a simple
 * admin-managed content resource, matching the server's generic resource
 * router (server/utils/resourceRouter.js) one-for-one.
 */
function buildResourceApi(path, label, { hasImage = false } = {}) {
  return {
    list: () => request(api.get(`/api/public/${path}`), `Failed to fetch ${label}`),
    adminList: () => request(api.get(`/api/admin/${path}`), `Failed to fetch ${label}`),
    create: (fields) =>
      request(
        api.post(`/api/admin/${path}`, hasImage ? toFormData(fields) : fields, hasImage ? multipartConfig : undefined),
        `Failed to create ${label}`
      ),
    update: (id, fields) =>
      request(
        api.put(`/api/admin/${path}/${id}`, hasImage ? toFormData(fields) : fields, hasImage ? multipartConfig : undefined),
        `Failed to update ${label}`
      ),
    remove: (id) => request(api.delete(`/api/admin/${path}/${id}`), `Failed to delete ${label}`),
  };
}

const servicesApi = buildResourceApi("services", "services", { hasImage: true });
const teamApi = buildResourceApi("team", "team members", { hasImage: true });
const faqsApi = buildResourceApi("faqs", "FAQs");
const plansApi = buildResourceApi("service-plans", "service plans");
const partsApi = buildResourceApi("parts", "parts", { hasImage: true });
const guidesApi = buildResourceApi("knowledge-guides", "knowledge base guides");
const videosApi = buildResourceApi("knowledge-videos", "knowledge base videos");

const apiService = {
  isAuthenticated: validateToken,

  // --- Auth ---
  async login(credentials) {
    const { token, user } = await request(api.post("/api/auth/login", credentials), "Login failed");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { user, token };
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("unauthorized", { detail: { message: "User logged out" } }));
  },
  register: (userData) => request(api.post("/api/auth/register", userData), "Registration failed"),
  forgotPassword: (email) =>
    request(api.post("/api/auth/forgot-password", { email }), "Failed to send reset link"),
  resetPassword: (token, password) =>
    request(api.post("/api/auth/reset-password", { token, password }), "Failed to reset password"),

  // --- Client dashboard ---
  getServiceHistory: () => request(api.get("/api/client/service-history"), "Failed to fetch service history"),
  getEquipment: () => request(api.get("/api/client/equipment"), "Failed to fetch equipment data"),
  getMyPayments: () => request(api.get("/api/client/payments"), "Failed to fetch order history"),
  cancelOrder: (id, reason) =>
    request(api.put(`/api/client/payments/${id}/cancel`, { reason }), "Failed to cancel order"),
  submitFeedback: (feedbackData) =>
    request(api.post("/api/client/feedback", feedbackData), "Failed to submit feedback"),
  submitContact: (contactData) =>
    request(api.post("/api/client/contact", contactData), "Failed to send message"),
  getMyServiceRequests: () =>
    request(api.get("/api/client/service-requests"), "Failed to fetch service requests"),
  submitServiceRequest: (data) =>
    request(api.post("/api/client/service-requests", data), "Failed to submit service request"),

  // --- Admin: users / payments / service requests / contact messages / feedback (paginated) ---
  getUsers: (params) => request(api.get("/api/admin/users", { params }), "Failed to fetch users"),
  updateUserRole: (id, role) =>
    request(api.put(`/api/admin/users/${id}/role`, { role }), "Failed to update user role"),
  banUser: (id, banned) =>
    request(api.put(`/api/admin/users/${id}/ban`, { banned }), "Failed to update ban status"),
  getPayments: (params) => request(api.get("/api/admin/payments", { params }), "Failed to fetch payments"),
  updateOrderStatus: (id, data) =>
    request(api.put(`/api/admin/payments/${id}/status`, data), "Failed to update order status"),
  getServiceRequests: (params) =>
    request(api.get("/api/admin/service-requests", { params }), "Failed to fetch service requests"),
  respondToServiceRequest: (id, data) =>
    request(api.put(`/api/admin/service-requests/${id}`, data), "Failed to update service request"),
  getContactMessages: (params) =>
    request(api.get("/api/admin/contact-messages", { params }), "Failed to fetch contact messages"),
  markContactMessageRead: (id) =>
    request(api.put(`/api/admin/contact-messages/${id}/read`, {}), "Failed to mark message as read"),
  getFeedback: (params) => request(api.get("/api/admin/feedback", { params }), "Failed to fetch feedback"),
  approveFeedback: (id) =>
    request(api.post(`/api/admin/feedback/approve/${id}`, {}), "Failed to approve feedback"),
  rejectFeedback: (id) =>
    request(api.post(`/api/admin/feedback/reject/${id}`, {}), "Failed to reject feedback"),
  getAlerts: () => request(api.get("/api/admin/alerts"), "Failed to fetch alerts"),

  // --- Blog (admin-managed) ---
  getBlogs: () => request(api.get("/api/admin/blogs"), "Failed to fetch blogs"),
  createBlog: (blogData) => request(api.post("/api/admin/blogs", blogData), "Failed to create blog"),
  updateBlog: (id, blogData) => request(api.put(`/api/admin/blogs/${id}`, blogData), "Failed to update blog"),
  deleteBlog: (id) => request(api.delete(`/api/admin/blogs/${id}`), "Failed to delete blog"),

  // --- Public marketing content ---
  getApprovedFeedback: () =>
    request(api.get("/api/public/feedback/approved"), "Failed to fetch approved feedback"),
  getPublicBlogs: () => request(api.get("/api/public/blogs"), "Failed to fetch blogs"),
  getSiteSettings: () => request(api.get("/api/public/settings"), "Failed to fetch site settings"),

  // --- Admin-managed content resources ---
  getServices: servicesApi.list,
  getServicesAdmin: servicesApi.adminList,
  createService: servicesApi.create,
  updateService: servicesApi.update,
  deleteService: servicesApi.remove,

  getTeamMembers: teamApi.list,
  getTeamMembersAdmin: teamApi.adminList,
  createTeamMember: teamApi.create,
  updateTeamMember: teamApi.update,
  deleteTeamMember: teamApi.remove,

  getFaqs: faqsApi.list,
  getFaqsAdmin: faqsApi.adminList,
  createFaq: faqsApi.create,
  updateFaq: faqsApi.update,
  deleteFaq: faqsApi.remove,

  getServicePlans: plansApi.list,
  getServicePlansAdmin: plansApi.adminList,
  createServicePlan: plansApi.create,
  updateServicePlan: plansApi.update,
  deleteServicePlan: plansApi.remove,

  getParts: partsApi.list,
  getPartsAdmin: partsApi.adminList,
  createPart: partsApi.create,
  updatePart: partsApi.update,
  deletePart: partsApi.remove,

  getKnowledgeGuides: guidesApi.list,
  getKnowledgeGuidesAdmin: guidesApi.adminList,
  createKnowledgeGuide: guidesApi.create,
  updateKnowledgeGuide: guidesApi.update,
  deleteKnowledgeGuide: guidesApi.remove,

  getKnowledgeVideos: videosApi.list,
  getKnowledgeVideosAdmin: videosApi.adminList,
  createKnowledgeVideo: videosApi.create,
  updateKnowledgeVideo: videosApi.update,
  deleteKnowledgeVideo: videosApi.remove,

  getSettingsAdmin: () => request(api.get("/api/admin/settings"), "Failed to fetch settings"),
  updateSettings: (settings) =>
    request(api.put("/api/admin/settings", settings), "Failed to update settings"),

  // --- Reports / analytics ---
  getReportsSummary: (params) =>
    request(api.get("/api/admin/reports/summary", { params }), "Failed to fetch reports"),
  async exportReport(type, params) {
    try {
      const response = await api.get(`/api/admin/reports/export/${type}`, {
        params,
        responseType: "blob",
      });
      return response.data;
    } catch (err) {
      throw new Error("Failed to export report");
    }
  },

  // --- Payments (server computes the amount; the client only references a
  // catalog item, or provides a bounded custom amount for ad-hoc quotes) ---
  createPlanPayment: (planId) =>
    request(api.post("/api/payments/create", { kind: "plan", planId }), "Failed to start checkout"),
  createPartPayment: (partId, quantity = 1) =>
    request(api.post("/api/payments/create", { kind: "part", partId, quantity }), "Failed to start checkout"),
  createCustomPayment: (amount, description) =>
    request(
      api.post("/api/payments/create", { kind: "custom", amount, description }),
      "Failed to start checkout"
    ),
  createServiceRequestPayment: (serviceRequestId) =>
    request(
      api.post("/api/payments/create", { kind: "service_request", serviceRequestId }),
      "Failed to start checkout"
    ),
};

export default apiService;
