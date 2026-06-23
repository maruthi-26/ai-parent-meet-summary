import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckCircle,
  Phone,
  User,
  Calendar,
  Search,
  Megaphone,
  SlidersHorizontal,
  Bot,
  FileText,
  Clock,
  Download
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { SkeletonTable } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import api from "../services/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export default function Communication() {
  const [meetings, setMeetings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [teacherFilter, setTeacherFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [meetingsRes, noticesRes] = await Promise.all([
        api.get("/meetings"),
        api.get("/notices")
      ]);
      setMeetings(meetingsRes.data || []);
      setNotices(noticesRes.data || []);
    } catch {
      toast.error("Failed to load communication history");
    } finally {
      setIsLoading(false);
    }
  };

  // Compile unified communication feed
  const rawItems = [];

  meetings.forEach((m) => {
    rawItems.push({
      id: `msg-${m.id}`,
      type: "Parent Message",
      title: `Parent Message regarding ${m.student?.name}`,
      details: m.aiSummary || m.notes || "No summary or notes captured.",
      date: new Date(m.createdAt),
      studentName: m.student?.name || "Student",
      studentClass: m.student?.className || "Class",
      teacherName: m.teacher?.name || "Teacher",
      parentName: m.student?.parentName || "Parent",
      parentPhone: m.student?.parentPhone || "—",
      status: m.whatsappSent ? "Sent" : "Pending",
      raw: m
    });
  });

  notices.forEach((n) => {
    rawItems.push({
      id: `notice-${n.id}`,
      type: "Notice",
      title: n.title,
      details: n.content,
      date: new Date(n.createdAt),
      studentName: "ALL STUDENTS",
      studentClass: n.targetAudience || "ALL",
      teacherName: n.createdBy?.name || "Administrator",
      parentName: "—",
      parentPhone: "—",
      status: "Published",
      raw: n
    });
  });

  // Sort chronological descending
  rawItems.sort((a, b) => b.date - a.date);

  // Extract unique teachers for filter list
  const uniqueTeachers = ["ALL", ...new Set(rawItems.map(item => item.teacherName).filter(Boolean))];

  // Apply filters
  const filteredItems = rawItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.details.toLowerCase().includes(search.toLowerCase()) ||
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || item.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesTeacher = teacherFilter === "ALL" || item.teacherName === teacherFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const filterDateStr = new Date(dateFilter).toDateString();
      const itemDateStr = item.date.toDateString();
      matchesDate = filterDateStr === itemDateStr;
    }

    return matchesSearch && matchesType && matchesStatus && matchesTeacher && matchesDate;
  });

  const exportCSV = () => {
    try {
      const rows = filteredItems.map((item) => ({
        Type: item.type,
        Title: item.title,
        Details: item.details,
        Date: item.date.toLocaleDateString("en-IN"),
        Recipient: item.studentName,
        Class: item.studentClass,
        Sender: item.teacherName,
        Status: item.status,
      }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "intellitots-communications.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const exportPDF = () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(255, 107, 53);
      doc.text("FirstCry Intellitots — Communication History Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);

      autoTable(doc, {
        startY: 34,
        head: [["Type", "Title", "Recipient", "Sender", "Date", "Status"]],
        body: filteredItems.map((item) => [
          item.type,
          item.title,
          item.studentName,
          item.teacherName,
          item.date.toLocaleDateString("en-IN"),
          item.status,
        ]),
        headStyles: { fillColor: [255, 107, 53] },
        alternateRowStyles: { fillColor: [255, 244, 240] },
      });

      doc.save("intellitots-communications.pdf");
      toast.success("PDF exported successfully!", { id: toastId });
    } catch (e) {
      toast.error("Failed to export PDF", { id: toastId });
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication Center"
        subtitle="Manage and track all parent updates, circulars, and notices in one place"
        icon={MessageSquare}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm cursor-pointer"
            >
              <FileText size={14} /> Export PDF
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
          <SlidersHorizontal size={15} className="text-orange-500" />
          <span className="text-xs font-bold text-slate-700">Filter Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search message text, recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-600 font-semibold"
          >
            <option value="ALL">All Types</option>
            <option value="Parent Message">Parent Messages</option>
            <option value="Notice">School Notices</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-600 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="Sent">Sent (WhatsApp)</option>
            <option value="Pending">Pending Share</option>
            <option value="Published">Published Notices</option>
          </select>

          {/* Teacher Filter */}
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-600 font-semibold"
          >
            {uniqueTeachers.map((t) => (
              <option key={t} value={t}>{t === "ALL" ? "All Senders" : t}</option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-500 font-semibold"
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            title="No communications match filters"
            description="Adjust your search criteria or write a new notice to get started."
            illustration="notices"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((item, idx) => {
              const isNotice = item.type === "Notice";
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row md:items-start gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Left Column: Icon Type Indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isNotice ? "bg-amber-50 text-amber-500 border border-amber-100" : "bg-teal-50 text-teal-600 border border-teal-100"
                  }`}>
                    {isNotice ? <Megaphone size={18} /> : <MessageSquare size={18} />}
                  </div>

                  {/* Middle Column: Details content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                        isNotice ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-teal-50 text-teal-600 border-teal-200"
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {item.details}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-slate-50 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-400">
                      <div>
                        <span>Sender: </span>
                        <span className="font-bold text-slate-700">{item.teacherName}</span>
                      </div>
                      <div>
                        <span>Recipient: </span>
                        <span className="font-bold text-slate-700">{item.studentName} {item.studentName !== "ALL STUDENTS" && `(${item.studentClass})`}</span>
                      </div>
                      {item.parentPhone !== "—" && (
                        <div className="flex items-center gap-1">
                          <Phone size={11} />
                          <span className="font-semibold text-slate-600">{item.parentPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status badges */}
                  <div className="flex-shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-start gap-3 mt-2 md:mt-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                      item.status === "Sent" || item.status === "Published"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {item.status}
                    </span>
                    {item.type === "Parent Message" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.details);
                          toast.success("Message content copied!");
                        }}
                        className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                      >
                        Copy text
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </DashboardLayout>
  );
}