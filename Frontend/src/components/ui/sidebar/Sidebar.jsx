import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold">
          Parent Summary AI
        </h1>
      </div>

      <nav className="p-4 space-y-2">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 p-3 rounded hover:bg-slate-800"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/students"
          className="flex items-center gap-3 p-3 rounded hover:bg-slate-800"
        >
          <Users size={18} />
          Students
        </NavLink>

        <NavLink
          to="/meetings"
          className="flex items-center gap-3 p-3 rounded hover:bg-slate-800"
        >
          <FileText size={18} />
          Meetings
        </NavLink>

        <NavLink
          to="/history"
          className="flex items-center gap-3 p-3 rounded hover:bg-slate-800"
        >
          <MessageSquare size={18} />
          Communication
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 w-full text-left"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );
}