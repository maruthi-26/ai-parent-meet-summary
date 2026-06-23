import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, AlertCircle, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/teacherDashboard", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents matching login page */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-gradient/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-gradient/5 rounded-full translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-md border border-slate-100 text-center space-y-6 relative z-10 overflow-hidden"
      >
        {/* Accent line at the top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gradient" />

        {/* Brand Logo header */}
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-sm">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">FirstCry Intellitots</h1>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Smart Parent Communication</p>
          </div>
        </div>

        {/* 404 Illustration / Icon */}
        <div className="py-4 relative">
          <div className="text-7xl sm:text-8xl font-black bg-brand-gradient bg-clip-text text-transparent opacity-15 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm">
              <AlertCircle size={28} className="text-orange-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Oops! Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page you are looking for does not exist, has been moved, or you might not have authorization to view it.
          </p>
        </div>

        {/* Back home button */}
        <motion.button
          onClick={handleGoHome}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
        >
          <Home size={16} />
          Return to Dashboard
        </motion.button>

        <p className="text-[10px] text-slate-400 italic pt-2">
          © 2025 FirstCry Intellitots · All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
