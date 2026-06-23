import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/dashboard", { replace: true });
      } else if (user.role === "TEACHER") {
        navigate("/teacherDashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Signing in...");
    try {
      const response = await api.post("/auth/login", formData);
      if (response.data.success) {
        login(response.data.user, response.data.token);
        toast.success(`Welcome back, ${response.data.user.name}!`, { id: toastId });
        if (response.data.user.role === "ADMIN") navigate("/dashboard");
        else navigate("/teacherDashboard");
      } else {
        toast.error(response.data.message || "Login failed", { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.", { id: toastId });
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
            {[
              { emoji: "🤖", title: "AI-Powered Summaries", desc: "Generate professional parent messages instantly" },
              { emoji: "📊", title: "Analytics Dashboard", desc: "Track performance and engagement metrics" },
              { emoji: "💬", title: "WhatsApp Integration", desc: "Send summaries directly to parents" },
              { emoji: "📋", title: "Notice Generator", desc: "Create school notices with one click" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <span className="text-2xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-orange-200 text-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-3xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 mt-1.5">Sign in to your account to continue</p>
          </div>



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@intellitots.com"
                value={formData.email}
                onChange={handleChange("email")}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-slate-400 hover:text-orange-500 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
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