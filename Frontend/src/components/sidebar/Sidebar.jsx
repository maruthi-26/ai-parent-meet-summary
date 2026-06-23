import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  UserCog,
  BarChart3,
  Megaphone,
  MessageCircle,
  Star,
  Activity,
  GraduationCap,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const ADMIN_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/teachers", icon: UserCog, label: "Teachers" },
  { to: "/students", icon: GraduationCap, label: "Students" },
  { to: "/communication", icon: MessageSquare, label: "Communication" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/notices", icon: Megaphone, label: "AI Notices" },
  { to: "/parent-messages", icon: FileText, label: "Meetings" },
  { to: "/parent-satisfaction", icon: Star, label: "Satisfaction" },
  { to: "/activity-feed", icon: Activity, label: "Activity Feed" },
];

const TEACHER_NAV = [
  { to: "/teacherDashboard", icon: LayoutDashboard, label: "My Dashboard" },
  { to: "/students", icon: GraduationCap, label: "My Students" },
  { to: "/meetings", icon: FileText, label: "My Meetings" },
  { to: "/communication", icon: MessageSquare, label: "Communication" },
  { to: "/teacher/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/teacher/notices", icon: Megaphone, label: "AI Notices" },
  { to: "/parent-messages", icon: MessageCircle, label: "Parent Messages" },
];

export default function Sidebar({ onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = user?.role === "ADMIN" ? ADMIN_NAV : TEACHER_NAV;

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group ${
      isActive
        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
        : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen flex flex-col shadow-xl shadow-slate-100/50">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">FC</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">FirstCry</h1>
              <p className="text-xs text-orange-500 font-semibold">Intellitots</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Smart Parent Communication</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
            <span className={user?.role === "ADMIN" ? "badge-admin" : "badge-teacher"} style={{ fontSize: "10px" }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-1">
          {user?.role === "ADMIN" ? "Administration" : "My Workspace"}
        </p>

        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <NavLink to={item.to} className={menuClass} onClick={onClose}>
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={isActive ? "text-white" : "text-slate-400 group-hover:text-orange-500 transition-colors"}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}