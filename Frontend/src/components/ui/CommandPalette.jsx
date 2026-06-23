import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  User,
  GraduationCap,
  Calendar,
  MessageSquare,
  BarChart3,
  LogOut,
  Plus,
  Command,
  X,
  Keyboard,
  Compass,
  Activity,
  Megaphone
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Custom listener for global navbar search click
  useEffect(() => {
    const handleOpenPalette = () => setIsOpen(true);
    window.addEventListener("open-command-palette", handleOpenPalette);
    return () => window.removeEventListener("open-command-palette", handleOpenPalette);
  }, []);

  // Load students, teachers, meetings, feedback & notices when palette opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [studentsRes, teachersRes, meetingsRes, feedbacksRes, noticesRes] = await Promise.all([
            api.get("/students"),
            api.get("/teachers").catch(() => ({ data: [] })),
            api.get("/meetings").catch(() => ({ data: [] })),
            api.get("/feedback").catch(() => ({ data: [] })),
            api.get("/notices").catch(() => ({ data: [] }))
          ]);
          setStudents(studentsRes.data || []);
          setTeachers(teachersRes.data || []);
          setMeetings(meetingsRes.data || []);
          setFeedbacks(feedbacksRes.data || []);
          setNotices(noticesRes.data || []);
        } catch (err) {
          console.error("Failed to load command palette resources:", err);
        }
      };
      fetchData();
      setQuery("");
      setSelectedIndex(0);
      // Timeout to ensure input is mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown listeners for Ctrl+K / Cmd+K and arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle keyboard list navigation
  const handleListKeyDown = (e, items) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
      scrollIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      scrollIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  const scrollIntoView = () => {
    const activeEl = listRef.current?.querySelector("[data-active='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  };

  // Navigation Items
  const pageItems = [
    { name: "Admin Dashboard", icon: BarChart3, path: "/dashboard", roles: ["ADMIN"] },
    { name: "Teacher Dashboard", icon: Compass, path: "/teacherDashboard", roles: ["TEACHER", "ADMIN"] },
    { name: "Enrolled Students", icon: GraduationCap, path: "/students", roles: ["ADMIN", "TEACHER"] },
    { name: "Manage Teachers", icon: User, path: "/teachers", roles: ["ADMIN"] },
    { name: "Parent-Teacher Meetings", icon: Calendar, path: "/meetings", roles: ["ADMIN", "TEACHER"] },
    { name: "Communication Board", icon: MessageSquare, path: "/communication", roles: ["ADMIN", "TEACHER"] },
    { name: "System Activity Feed", icon: Activity, path: "/activity-feed", roles: ["ADMIN", "TEACHER"] },
    { name: "Parent Feedback Scores", icon: FileText, path: "/parent-satisfaction", roles: ["ADMIN", "TEACHER"] },
    { name: "AI Notice Desk (Admin)", icon: Megaphone, path: "/admin/notices", roles: ["ADMIN"] },
    { name: "AI Notice Board (Teacher)", icon: Megaphone, path: "/teacher/notices", roles: ["TEACHER"] },
  ];

  // Actions
  const actionItems = [
    {
      name: "Schedule a PTM Meeting",
      icon: Plus,
      action: () => {
        setIsOpen(false);
        navigate("/meetings");
        toast.success("Add Meeting dialog is available on this page");
      }
    },
    {
      name: "Add New Student Profile",
      icon: Plus,
      action: () => {
        setIsOpen(false);
        navigate("/students");
        toast.success("Add Student dialog is available on this page");
      }
    },
    {
      name: "Log Out of System",
      icon: LogOut,
      action: () => {
        setIsOpen(false);
        logout();
        navigate("/");
        toast.success("Log out successful");
      }
    }
  ];

  // Map and Filter items
  const filteredPages = pageItems
    .filter(p => user && p.roles.includes(user.role))
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .map(p => ({
      name: p.name,
      icon: p.icon,
      category: "Navigation Pages",
      action: () => {
        setIsOpen(false);
        navigate(p.path);
      }
    }));

  const filteredStudents = students
    .filter(s => s.name?.toLowerCase().includes(query.toLowerCase()) || s.className?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(s => ({
      name: `${s.name} (${s.className})`,
      icon: GraduationCap,
      category: "Students (360° Profile)",
      action: () => {
        setIsOpen(false);
        navigate(`/students/${s.id}`);
      }
    }));

  const filteredTeachers = user && user.role === "ADMIN"
    ? teachers
        .filter(t => t.name?.toLowerCase().includes(query.toLowerCase()) || t.email?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(t => ({
          name: `${t.name} — ${t.email}`,
          icon: User,
          category: "Teachers Directory",
          action: () => {
            setIsOpen(false);
            navigate(`/teachers`);
          }
        }))
    : [];

  const filteredActions = actionItems
    .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    .map(a => ({
      name: a.name,
      icon: a.icon,
      category: "Quick Actions",
      action: a.action
    }));

  const filteredMeetings = meetings
    .filter(m => m.student?.name?.toLowerCase().includes(query.toLowerCase()) || m.notes?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(m => ({
      name: `PTM Meeting: ${m.student?.name} (${new Date(m.createdAt).toLocaleDateString("en-IN")})`,
      icon: Calendar,
      category: "Meetings Logs",
      action: () => {
        setIsOpen(false);
        navigate(`/meetings/${m.id}`);
      }
    }));

  const filteredFeedbacks = feedbacks
    .filter(f => f.meeting?.student?.name?.toLowerCase().includes(query.toLowerCase()) || f.comment?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(f => ({
      name: `Feedback: ${f.meeting?.student?.name} (${f.rating}★ — ${f.sentiment})`,
      icon: Star,
      category: "Parent Feedbacks",
      action: () => {
        setIsOpen(false);
        navigate(`/parent-satisfaction`);
      }
    }));

  const filteredNotices = notices
    .filter(n => n.title?.toLowerCase().includes(query.toLowerCase()) || n.content?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(n => ({
      name: `Notice: ${n.title}`,
      icon: Megaphone,
      category: "Circulars & Notices",
      action: () => {
        setIsOpen(false);
        navigate(user?.role === "ADMIN" ? "/admin/notices" : "/teacher/notices");
      }
    }));

  // Combine items
  const allFilteredItems = [
    ...filteredPages,
    ...filteredStudents,
    ...filteredTeachers,
    ...filteredMeetings,
    ...filteredFeedbacks,
    ...filteredNotices,
    ...filteredActions
  ];

  // Adjust selection bound checks
  useEffect(() => {
    if (selectedIndex >= allFilteredItems.length) {
      setSelectedIndex(Math.max(0, allFilteredItems.length - 1));
    }
  }, [allFilteredItems.length, selectedIndex]);

  // Group items by category to display clean subheadings
  const groupedItems = allFilteredItems.reduce((groups, item) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});

  // Flattened ordered keys to help layout item index matches
  let itemCounter = 0;

  if (!user) return null; // Command palette only for logged in users

  return (
    <>
      {/* Palette Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Dialog Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 glass-card"
            >
              {/* Input Area */}
              <div className="relative border-b border-slate-100 p-4 flex items-center">
                <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={(e) => handleListKeyDown(e, allFilteredItems)}
                  placeholder="Search pages, students, quick actions..."
                  className="w-full text-slate-800 bg-transparent placeholder-slate-400 text-sm focus:outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Items List */}
              <div 
                ref={listRef}
                className="max-h-[360px] overflow-y-auto p-2 space-y-4"
              >
                {allFilteredItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No results found matching "{query}"
                  </div>
                ) : (
                  Object.keys(groupedItems).map((categoryName) => {
                    const categoryItems = groupedItems[categoryName];
                    return (
                      <div key={categoryName} className="space-y-1">
                        {/* Category Heading */}
                        <div className="px-3 py-1 bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider rounded-lg">
                          {categoryName}
                        </div>

                        {/* Category Items */}
                        <div className="space-y-0.5">
                          {categoryItems.map((item) => {
                            const currentItemIndex = itemCounter;
                            itemCounter++;
                            const isActive = selectedIndex === currentItemIndex;

                            return (
                              <div
                                key={item.name}
                                data-active={isActive}
                                onClick={item.action}
                                onMouseEnter={() => setSelectedIndex(currentItemIndex)}
                                className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                                  isActive
                                    ? "bg-orange-50 text-orange-600 shadow-sm border-l-4 border-orange-500"
                                    : "text-slate-600 hover:bg-slate-50/60"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <item.icon
                                    size={15}
                                    className={`flex-shrink-0 ${
                                      isActive ? "text-orange-500" : "text-slate-400"
                                    }`}
                                  />
                                  <span className="text-xs font-semibold truncate leading-none">
                                    {item.name}
                                  </span>
                                </div>
                                {isActive && (
                                  <span className="text-[10px] text-orange-400 font-bold bg-white px-2 py-0.5 rounded border border-orange-100 flex items-center gap-1 shadow-sm font-mono uppercase">
                                    <Keyboard size={10} /> Enter
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom status bar */}
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 select-none">
                <span className="flex items-center gap-1">
                  Use arrow keys <kbd className="font-mono bg-white border px-1 py-0.5 rounded">↑</kbd> <kbd className="font-mono bg-white border px-1 py-0.5 rounded">↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  Press <kbd className="font-mono bg-white border px-1 py-0.5 rounded">ESC</kbd> to close
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
