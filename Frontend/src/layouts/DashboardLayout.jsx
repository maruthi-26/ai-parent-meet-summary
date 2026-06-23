import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Menu,
  X,
  User,
  Bookmark,
  Code,
  Briefcase,
  HelpCircle,
  Gift,
  LogOut,
  Calendar,
  Bot,
  MessageSquare,
  Megaphone,
  UserCog,
  GraduationCap,
  BarChart3,
  Activity,
  Search,
} from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 0) return "just now";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function NotificationItem({ item, onRead }) {
  const Icon = item.type === "MEETING_CREATED"
    ? Calendar
    : item.type === "NOTICE_CREATED"
    ? Megaphone
    : item.type === "AI_SUMMARY"
    ? Bot
    : MessageSquare;

  const iconBg = item.type === "MEETING_CREATED"
    ? "bg-orange-50 text-orange-500"
    : item.type === "NOTICE_CREATED"
    ? "bg-amber-50 text-amber-500"
    : item.type === "AI_SUMMARY"
    ? "bg-purple-50 text-purple-500"
    : "bg-teal-50 text-teal-500";

  return (
    <div
      onClick={() => onRead(item.id)}
      className={`px-4 py-3 flex gap-3 hover:bg-slate-50/60 transition-colors cursor-pointer relative ${
        !item.read ? "bg-orange-50/10" : ""
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs text-slate-800 truncate ${!item.read ? "font-bold" : "font-medium"}`}>
            {item.title}
          </p>
          <span className="text-[9px] text-slate-400 flex-shrink-0">{timeAgo(item.timestamp)}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-normal">
          {item.description}
        </p>
      </div>

      {/* Status indicator dot */}
      <div className="flex-shrink-0 flex items-center">
        {!item.read && (
          <span className={`w-1.5 h-1.5 rounded-full ${item.priority === "red" ? "bg-red-500" : "bg-blue-500"}`} />
        )}
      </div>
    </div>
  );
}

const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "MEETING_CREATED", title: "PTM Schedule Created", description: "Ms. Priya created meeting with Aarav Sharma's parent", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), priority: "blue", read: false },
  { id: "n2", type: "AI_SUMMARY", title: "AI Summary Ready", description: "AI generated summary for Aarav Sharma's meeting is ready to review", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), priority: "blue", read: false },
  { id: "n3", type: "NOTICE_CREATED", title: "AI Notice: Sports Day", description: "AI Notice drafted for Upcoming Annual Sports Day 2026", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), priority: "red", read: false },
  { id: "n4", type: "MESSAGE_SENT", title: "WhatsApp Message Sent", description: "Meeting summary shared with parent of Diya Patel", timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), priority: "blue", read: true },
  { id: "n5", type: "MEETING_CREATED", title: "PTM Scheduled", description: "Mr. Rahul scheduled a meeting with parent of Vihaan Mehta", timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), priority: "blue", read: true },
  { id: "n6", type: "NOTICE_CREATED", title: "AI Notice: Holiday Notice", description: "Drafted notice for Summer Holiday schedule", timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), priority: "blue", read: true },
  { id: "n7", type: "MESSAGE_SENT", title: "Email Sent Successfully", description: "Summary report emailed to parent of Ishaan Kumar", timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), priority: "blue", read: true },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState("all");

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/analytics/activity-feed");
        if (res.data && res.data.length > 0) {
          const transformed = res.data.map((item, idx) => ({
            id: item.id || `feed-${idx}`,
            type: item.type,
            title: item.title,
            description: item.description,
            timestamp: item.timestamp || new Date().toISOString(),
            priority: item.type === "NOTICE_CREATED" ? "red" : "blue",
            read: idx >= 3 // Let the first 3 items be unread for demonstration
          }));
          
          const hasNotice = transformed.some(t => t.type === "NOTICE_CREATED");
          if (!hasNotice) {
            transformed.push(
              { id: "n3", type: "NOTICE_CREATED", title: "AI Notice: Sports Day", description: "AI Notice drafted for Upcoming Annual Sports Day 2026", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), priority: "red", read: false },
              { id: "n6", type: "NOTICE_CREATED", title: "AI Notice: Holiday Notice", description: "Drafted notice for Summer Holiday schedule", timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), priority: "blue", read: true }
            );
          }
          transformed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setNotifications(transformed);
        }
      } catch (err) {
        console.error("Error loading notification activity:", err);
      }
    };
    fetchNotifications();
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success("All updates marked as read");
  };

  const adminMenuItems = [
    { label: "Manage Teachers", icon: UserCog, action: () => navigate("/teachers") },
    { label: "Enrolled Students", icon: GraduationCap, action: () => navigate("/students") },
    { label: "Analytics Report", icon: BarChart3, action: () => navigate("/admin/analytics") },
    { label: "System Activity", icon: Activity, action: () => navigate("/activity-feed") },
  ];

  const teacherMenuItems = [
    { label: "My Students", icon: GraduationCap, action: () => navigate("/students") },
    { label: "Analytics Dashboard", icon: BarChart3, action: () => navigate("/teacher/analytics") },
    { label: "AI Notice board", icon: Megaphone, action: () => navigate("/teacher/notices") },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === "all") return true;
    if (activeCategory === "meetings") return n.type === "MEETING_CREATED";
    if (activeCategory === "notices") return n.type === "NOTICE_CREATED";
    if (activeCategory === "messages") return n.type === "MESSAGE_SENT" || n.type === "AI_SUMMARY";
    return true;
  });

  const todayNotifications = filteredNotifications.filter(n => {
    const diffHours = (Date.now() - new Date(n.timestamp).getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  });

  const previousNotifications = filteredNotifications.filter(n => {
    const diffHours = (Date.now() - new Date(n.timestamp).getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
  });

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-orange-50 via-white to-teal-50/30 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 sidebar-overlay lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden font-sans">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-orange-50 text-slate-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Brand name on mobile */}
          <span className="lg:hidden text-lg font-bold text-orange-500">
            Intellitots
          </span>

          {/* Global Search box in navbar */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 hover:border-orange-300 rounded-xl bg-slate-50/50 hover:bg-white text-slate-400 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <span>Search students, teachers, meetings, feedback, notices...</span>
              </div>
              <kbd className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400 shadow-sm">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            
            {/* Updates Bell and Popover */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl hover:bg-orange-50 text-slate-500 transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">Updates</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {notifications.filter(n => !n.read).length} New
                          </span>
                        )}
                      </div>
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1 border-b border-slate-100 px-3 py-2 bg-slate-50/50">
                      {[
                        { key: "all", label: "All" },
                        { key: "meetings", label: "Meetings" },
                        { key: "notices", label: "AI Notices" },
                        { key: "messages", label: "Messages" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveCategory(tab.key)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            activeCategory === tab.key
                              ? "bg-white text-orange-600 shadow-sm border border-slate-100"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {todayNotifications.length > 0 && (
                        <div>
                          <div className="px-4 py-1.5 bg-slate-50/40 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Today
                          </div>
                          {todayNotifications.map((n) => (
                            <NotificationItem key={n.id} item={n} onRead={markAsRead} />
                          ))}
                        </div>
                      )}

                      {previousNotifications.length > 0 && (
                        <div>
                          <div className="px-4 py-1.5 bg-slate-50/40 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Previous
                          </div>
                          {previousNotifications.map((n) => (
                            <NotificationItem key={n.id} item={n} onRead={markAsRead} />
                          ))}
                        </div>
                      )}

                      {filteredNotifications.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No updates in this category
                        </div>
                      )}
                    </div>

                    {/* View Feed Link */}
                    <div className="p-3 border-t border-slate-100 text-center bg-slate-50/20">
                      <Link
                        to="/activity-feed"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
                      >
                        Open Activity Feed
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-orange-50 transition-all text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user?.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className={user?.role === "ADMIN" ? "badge-admin" : "badge-teacher"}>
                      {user?.role}
                    </span>
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl py-3 z-50 overflow-hidden"
                  >
                    {/* User Header */}
                    <div className="px-4 pb-3 border-b border-slate-100">
                      <p className="font-extrabold text-slate-800 text-sm">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                        ID: <span className="text-orange-500 font-bold">{user?.id || "N/A"}</span>
                      </p>
                    </div>

                    {/* Menu Options */}
                    <div className="py-2">
                      {(user?.role === "ADMIN" ? adminMenuItems : teacherMenuItems).map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { item.action(); setProfileOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-orange-50/50 hover:text-orange-600 flex items-center gap-3 transition-colors group"
                        >
                          <item.icon size={15} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-500 hover:bg-red-50/50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut size={15} className="text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50/10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}