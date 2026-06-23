import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, GraduationCap, ShieldCheck, User, Mail, Lock } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function SetupAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = {
    length: formData.password.length >= 8,
    matches: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
  };

  const handleChange = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!passwordChecks.length) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!passwordChecks.matches) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating administrator account...");

    try {
      const res = await api.post("/setup/create-admin", {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Administrator account created successfully!", {
          id: toastId,
        });
        navigate("/");
      } else {
        toast.error(res.data.message || "Failed to complete setup.", { id: toastId });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Setup failed. Please check validation rules.",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-brand-gradient flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2" />

        <div className="relative z-10 text-center text-white">
          {/* Logo */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <GraduationCap size={40} className="text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-2">FirstCry Intellitots</h1>
          <p className="text-orange-100 text-lg font-medium mb-8">Smart Parent Communication</p>

          {/* Features */}
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <ShieldCheck className="text-white w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">System Onboarding Wizard</p>
                <p className="text-orange-100 text-xs mt-1">
                  You are setting up the initial administrator account. This account grants full credentials to manage teachers, configure classrooms, and view dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-sm">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">FirstCry Intellitots</h1>
              <p className="text-xs text-orange-500 font-medium">Smart Parent Communication</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800">System Initialization</h2>
            <p className="text-slate-500 mt-1.5 text-sm">Create the primary administrator account to begin.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Administrator Name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  disabled={isLoading}
                  autoFocus
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@intellitots.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange("password")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Length indicator */}
              {formData.password.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-[11px] mt-1.5 font-semibold ${
                    passwordChecks.length ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {passwordChecks.length ? "✓ At least 8 characters" : "✗ Must be at least 8 characters"}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Match indicator */}
              {formData.confirmPassword.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-[11px] mt-1.5 font-semibold ${
                    passwordChecks.matches ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {passwordChecks.matches ? "✓ Passwords match" : "✗ Passwords do not match"}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !passwordChecks.length || !passwordChecks.matches}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Initializing System...
                </>
              ) : (
                "Create Administrator"
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2025 FirstCry Intellitots · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
}
