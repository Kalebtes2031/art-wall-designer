// src/pages/ProfilePage.tsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiSave, FiCheckCircle, FiEdit2, FiX, FiCamera } from "react-icons/fi";
import { motion } from "framer-motion";

interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
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
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current profile
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<MeResponse>("/auth/me");
        setForm(f => ({ ...f, name: data.name, email: data.email }));
      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password && form.password !== form.confirm) {
      return toast.error("Passwords do not match")
    }

    setSaving(true)
    setSaved(false)

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("email", form.email)
      if (form.password) {
        formData.append("password", form.password)
      }
      if (newImageFile) {
        formData.append("profileImage", newImageFile)
      }

      const { data: updated } = await api.patch<MeResponse>("/auth/me", formData)
      updateUser(updated)
      toast.success("Profile updated successfully")

      setForm(f => ({ ...f, password: "", confirm: "" }))
      setNewImageFile(null)
      setIsEditingImage(false)
      setImagePreview(null)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Get user initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-gray-100 py-3 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl font-bold text-gray-800">Your Profile</h1>
          <p className="font-heading text-gray-500 mt-2">Manage your account settings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Profile Sidebar - Left Column */}
            <div className="bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] p-8 text-center w-full md:w-1/3 flex flex-col justify-center">
              <div>

                <div className="relative inline-block mb-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white/30 shadow-lg">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-indigo-200 w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-indigo-800">{initials}</span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsEditingImage(true);
                        // fileInputRef.current?.click();
                      }}
                      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all duration-200"
                    >
                      <FiCamera className="text-indigo-600" size={18} />
                    </button>
                  </div>

                  {isEditingImage && (
                    <div className="mt-4 flex justify-center space-x-3">
                      <button
                        onClick={() => {
                          setIsEditingImage(false);
                          setNewImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-sm bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition-colors"
                      >
                        <FiX className="mr-1" /> Cancel
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                      >
                        <FiEdit2 className="mr-1" /> Change
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />

                <h2 className="font-display text-2xl font-bold text-white mt-4">{user?.name}</h2>
                <p className="font-heading text-indigo-100 mt-2">{user?.email}</p>
                <div className="inline-block mt-4 bg-white/20 text-white text-sm px-4 py-2 rounded-full">
                  {user?.role.toUpperCase()}
                </div>
              </div>
              {/* <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
                <h3 className="font-heading text-white font-semibold mb-2">Account Information</h3>
                <div className="font-body text-indigo-100 text-sm space-y-1">
                  <p>Member since: {new Date().getFullYear() - 1}</p>
                  <p>Last login: Yesterday</p>
                  <p>Storage used: 24MB / 1GB</p>
                </div>
              </div> */}
            </div>

            {/* Form Section - Right Column */}
            <div className="p-8 w-full md:w-2/3">
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={formVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
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
                    <label className="text-sm font-medium text-gray-700 flex items-center">
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
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="font-heading text-lg font-medium text-gray-800 mb-4">Password Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <FiLock className="mr-2 text-gray-400" /> New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Leave blank to keep current"
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
                        <label className="text-sm font-medium text-gray-700 flex items-center">
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
                  </div>
                </div>

                <motion.div variants={itemVariants} className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading text-lg font-medium text-gray-800">Account Actions</h3>
                      <p className="font-body text-sm text-gray-500">Manage your account preferences</p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`py-3 px-6 flex items-center justify-center rounded-xl font-medium text-white shadow-md transition-all duration-300 min-w-[180px] ${saving
                        ? 'bg-indigo-400'
                        : saved
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] hover:shadow-lg'
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
                          Saved!
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="text-gray-700 hover:bg-gray-100 py-3 px-4 rounded-lg border border-gray-200 transition-colors">
                      Download Data
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 py-3 px-4 rounded-lg border border-gray-200 transition-colors">
                      Two-Factor Auth
                    </button>
                    <button className="text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg border border-red-200 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              </motion.form>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </motion.div>
      </div>
    </div>
  );
}