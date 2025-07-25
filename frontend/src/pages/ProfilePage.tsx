// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiSave, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load current profile
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<MeResponse>("/auth/me");
        setForm(f => ({ ...f, name: data.name, email: data.email }));
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) {
      return toast.error("Passwords do not match");
    }

    setSaving(true);
    setSaved(false);
    try {
      const payload: Partial<MeResponse & { password: string }> = {
        name: form.name,
        email: form.email,
      };
      if (form.password) payload.password = form.password;

      const { data: updated } = await api.patch<MeResponse>("/auth/me", payload);
      updateUser(updated);
      toast.success("Profile updated successfully");
      setForm(f => ({ ...f, password: "", confirm: "" }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Get user initials for avatar
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account settings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">{initials}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
            <p className="text-indigo-100 mt-1">{user?.email}</p>
            <div className="inline-block mt-3 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              {user?.role.toUpperCase()}
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Name */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className=" text-sm font-medium text-gray-700 flex items-center">
                  <FiUser className="mr-2 text-gray-400" /> Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-colors"
                  />
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className=" text-sm font-medium text-gray-700 flex items-center">
                  <FiMail className="mr-2 text-gray-400" /> Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-colors"
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className=" text-sm font-medium text-gray-700 flex items-center">
                  <FiLock className="mr-2 text-gray-400" /> New Password
                  <span className="ml-2 text-xs text-gray-500">(leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-colors"
                  />
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* Confirm Password */}
              {form.password && (
                <motion.div 
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <FiLock className="mr-2 text-gray-400" /> Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-colors"
                    />
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 px-4 flex items-center justify-center rounded-xl font-medium text-white shadow-md transition-all duration-300 ${
                    saving 
                      ? 'bg-indigo-400' 
                      : saved 
                        ? 'bg-green-500' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Saved Successfully!
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
      </div>
    </div>
  );
}