import { motion } from "framer-motion";
import { Users, Ban } from "lucide-react";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";
import apiService from "../../services/api";

/**
 * UserManagement component for managing user roles and ban status
 * @param {Object} props - Component props
 * @param {Array} props.users - List of users
 * @param {Function} props.setUsers - Function to update users state
 * @param {Function} props.setSuccess - Function to set success message
 * @param {Function} props.setError - Function to set error message
 * @returns {JSX.Element} The rendered UserManagement component
 */
function UserManagement({ users, setUsers, setSuccess, setError }) {
  /**
   * Update user role
   * @param {number} id - User ID
   * @param {string} role - New role ('admin' or 'client')
   */
  const handleUpdateRole = async (id, role) => {
    try {
      await apiService.updateUserRole(id, role);
      setUsers(users.map((user) => (user.id === id ? { ...user, role } : user)));
      setSuccess(`User role updated to ${role}`);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update user role");
      setSuccess("");
    }
  };

  /**
   * Ban or unban a user
   * @param {number} id - User ID
   * @param {boolean} banned - Ban status
   */
  const handleBanUser = async (id, banned) => {
    try {
      await apiService.banUser(id, banned);
      setUsers(users.map((user) => (user.id === id ? { ...user, banned } : user)));
      setSuccess(`User ${banned ? "banned" : "unbanned"} successfully`);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update ban status");
      setSuccess("");
    }
  };

  // Animation variants for cards
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
        <Users className="w-6 h-6" />
        <span>User Management</span>
      </h3>
      {users.length === 0 && <EmptyState message="No users yet." />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
          >
            <p className="text-gray-700">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Role:</strong> {user.role} {user.banned && "(Banned)"}
            </p>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleUpdateRole(user.id, user.role === "admin" ? "client" : "admin")}
                  className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                  aria-label={`Set ${user.name} as ${user.role === "admin" ? "client" : "admin"}`}
                >
                  <Users className="w-5 h-5" />
                  <span>{user.role === "admin" ? "Make Client" : "Make Admin"}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleBanUser(user.id, !user.banned)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
                  aria-label={`${user.banned ? "Unban" : "Ban"} ${user.name}`}
                >
                  <Ban className="w-5 h-5" />
                  <span>{user.banned ? "Unban" : "Ban"}</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default UserManagement;