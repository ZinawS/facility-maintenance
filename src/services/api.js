import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

const validateToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (err) {
    console.error("Error decoding token:", err);
    return false;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && validateToken()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(
        new CustomEvent("unauthorized", {
          detail: { message: "Token expired" },
        })
      );
    }
    return Promise.reject(error);
  }
);

const apiService = {
  isAuthenticated: validateToken,

  async login(credentials) {
    try {
      const response = await api.post("/api/auth/login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      return { user, token };
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  },

  logout() {
    localStorage.removeItem("token");
    window.dispatchEvent(
      new CustomEvent("unauthorized", {
        detail: { message: "User logged out" },
      })
    );
  },

  async register(userData) {
    try {
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to send reset link"
      );
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await api.post("/api/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  },

  async getServiceHistory() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/client/service-history");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch service history"
      );
    }
  },

  async getEquipment() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/client/equipment");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch equipment data"
      );
    }
  },

  async getUsers() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/admin/users");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch users");
    }
  },

  async updateUserRole(id, role) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.put(`/api/admin/users/${id}/role`, { role });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update user role"
      );
    }
  },

  async banUser(id, banned) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.put(`/api/admin/users/${id}/ban`, { banned });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update ban status"
      );
    }
  },

  async getPayments() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/admin/payments");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch payments"
      );
    }
  },

  async getServiceRequests() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/admin/service-requests");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch service requests"
      );
    }
  },

  async getContactMessages() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/admin/contact-messages");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch contact messages"
      );
    }
  },

  async getFeedback() {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.get("/api/admin/feedback");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch feedback"
      );
    }
  },

  async approveFeedback(id) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.post(`/api/admin/feedback/approve/${id}`, {});
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to approve feedback"
      );
    }
  },

  async rejectFeedback(id) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.post(`/api/admin/feedback/reject/${id}`, {});
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to reject feedback"
      );
    }
  },

  async getApprovedFeedback() {
    try {
      const response = await api.get("/api/public/feedback/approved");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch approved feedback"
      );
    }
  },

  async getPublicBlogs() {
    try {
      const response = await api.get("/api/public/blogs");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch blogs");
    }
  },
    async getBlogs() {
    try {
      const response = await api.get("/api/blogs");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch blogs");
    }
  },

  async createBlog(blogData) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.post("/api/admin/blogs", blogData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create blog");
    }
  },

  async updateBlog(id, blogData) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.put(`/api/admin/blogs/${id}`, blogData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update blog");
    }
  },

  async submitFeedback(feedbackData) {
    try {
      if (!validateToken())
        throw new Error("No valid authentication token found");
      const response = await api.post("/api/client/feedback", feedbackData);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to submit feedback"
      );
    }
  },

  async submitContact(contactData) {
    try {
      const response = await api.post("/api/client/contact", contactData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to send message");
    }
  },

  async getParts() {
    try {
      const response = await api.get("/api/client/parts");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch parts");
    }
  },

  async createPaymentIntent(paymentData) {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/api/payments/create", {
        ...paymentData,
        userId: token ? jwtDecode(token).id : null,
      });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create payment intent"
      );
    }
  },

  async getServices() {
    try {
      const response = await api.get("/api/services");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch services"
      );
    }
  },

  async getBrands() {
    try {
      const response = await api.get("/api/brands");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch brands");
    }
  },

  async subscribeEmail(email) {
    try {
      const response = await api.post("/api/subscribe", { email });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to subscribe");
    }
  },
};

export default apiService;
