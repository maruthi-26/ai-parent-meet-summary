import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, ArrowLeft, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState(null); // Demo mode: shows the link

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Generating reset link...");

    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });

      toast.success("Reset link generated!", { id: toastId });
      setSubmitted(true);

      // Demo mode: show the reset link directly on screen
      if (res.data?.resetLink) {
        setResetLink(res.data.resetLink);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again.",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    if (resetLink) {
      navigator.clipboard.writeText(resetLink);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel — same as Login */}
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

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-xs mx-auto text-left">
            <p className="font-semibold text-sm mb-2">🔒 Secure Password Reset</p>
            <p className="text-orange-100 text-xs leading-relaxed">
              Enter your registered email address and we will generate a secure password reset link valid for 1 hour.
            </p>
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
            {!submitted ? (
              /* ── Request Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                    <Mail size={24} className="text-orange-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">Forgot Password?</h2>
                  <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
                    Enter your account email and we will generate a secure reset link for you.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@intellitots.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Generating Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </motion.button>

                  <Link
                    to="/"
                    className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-orange-500 transition-colors mt-2"
                  >
                    <ArrowLeft size={15} />
                    Back to Login
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
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-800">Link Generated!</h2>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    A password reset link has been generated for <span className="font-semibold text-slate-700">{email}</span>.
                    It is valid for <strong>1 hour</strong>.
                  </p>
                </div>

                {/* Demo mode: show the reset link directly */}
                {resetLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5"
                  >
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      🔗 Demo Mode — Your Reset Link
                    </p>
                    <p className="text-[10px] text-orange-600 mb-3 leading-relaxed">
                      In production, this link would be emailed to you. For demo purposes, copy and open it directly.
                    </p>
                    <div className="bg-white rounded-xl border border-orange-200 p-3 flex items-center gap-2">
                      <p className="text-[10px] text-slate-600 font-mono break-all flex-1 leading-relaxed">
                        {resetLink}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={copyLink}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      >
                        <Copy size={13} /> Copy Link
                      </button>
                      <a
                        href={resetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <ExternalLink size={13} /> Open Link
                      </a>
                    </div>
                  </motion.div>
                )}

                <Link
                  to="/"
                  className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={15} />
                  Back to Login
                </Link>

                <button
                  onClick={() => { setSubmitted(false); setResetLink(null); setEmail(""); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-orange-500 transition-colors mt-3"
                >
                  Try a different email
                </button>
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
