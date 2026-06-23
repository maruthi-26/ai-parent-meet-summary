import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    matches: password === confirmPassword && confirmPassword.length > 0,
  };

  // Redirect countdown after success
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  // Guard: no token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm px-6">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Reset Link</h2>
          <p className="text-slate-500 text-sm mb-6">
            This password reset link is missing a token. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating your password...");

    try {
      await api.post("/auth/reset-password", { token, password });

      toast.success("Password updated successfully!", { id: toastId });
      setSuccess(true);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to reset password. The link may be expired or invalid.";
      toast.error(msg, { id: toastId });
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
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2" />

        <div className="relative z-10 text-center text-white">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <GraduationCap size={40} className="text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-2">FirstCry Intellitots</h1>
          <p className="text-orange-100 text-lg font-medium mb-8">Smart Parent Communication</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-xs mx-auto text-left space-y-3">
            <p className="font-semibold text-sm">🔐 Password Requirements</p>
            <div className="space-y-1.5">
              {[
                "Minimum 8 characters",
                "Both passwords must match",
                "Link is valid for 1 hour only",
                "Each link can only be used once",
              ].map((req) => (
                <div key={req} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-200 flex-shrink-0" />
                  <p className="text-orange-100 text-xs">{req}</p>
                </div>
              ))}
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

          <AnimatePresence mode="wait">
            {!success ? (
              /* ── Reset Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                    <Lock size={24} className="text-orange-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">Reset Password</h2>
                  <p className="text-slate-500 mt-1.5 text-sm">
                    Enter a new password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                        className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Length indicator */}
                    {password.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-[11px] mt-1.5 font-medium ${
                          passwordChecks.length ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {passwordChecks.length ? "✓ At least 8 characters" : "✗ Must be at least 8 characters"}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-[11px] mt-1.5 font-medium ${
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
                    className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </motion.button>

                  <Link
                    to="/forgot-password"
                    className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-orange-500 transition-colors mt-2"
                  >
                    <ArrowLeft size={15} />
                    Request a new reset link
                  </Link>
                </form>
              </motion.div>
            ) : (
              /* ── Success Screen ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </motion.div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Password Updated Successfully!
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Your password has been changed. You can now log in with your new credentials.
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-700 font-medium">
                  Redirecting to Login in <span className="font-bold text-emerald-800">{countdown}s</span>...
                </div>

                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-orange-200 transition-all"
                >
                  Go to Login Now
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2025 FirstCry Intellitots · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
}
