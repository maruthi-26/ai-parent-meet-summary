import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Plus } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { SkeletonTable } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import MeetingTable from "../components/meetings/MeetingTable";
import AddMeetingDialog from "../components/meetings/AddMeetingDialog";
import api from "../services/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/meetings");
      setMeetings(response.data);
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMeetings(); }, []);

  const exportPDF = () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(255, 107, 53);
      doc.text("FirstCry Intellitots — Parent Meetings Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);

      autoTable(doc, {
        startY: 34,
        head: [["Student", "Class", "Teacher", "Notes", "AI Summary", "WhatsApp", "Date"]],
        body: filtered.map((m) => [
          m.student?.name,
          m.student?.className,
          m.teacher?.name,
          m.notes || "",
          m.aiSummary ? "Generated" : "Pending",
          m.whatsappSent ? "Sent" : "Not Sent",
          new Date(m.createdAt).toLocaleDateString("en-IN")
        ]),
        headStyles: { fillColor: [255, 107, 53] },
        alternateRowStyles: { fillColor: [255, 244, 240] },
      });

      doc.save("intellitots-meetings.pdf");
      toast.success("PDF exported successfully!", { id: toastId });
    } catch (e) {
      toast.error("Failed to export PDF", { id: toastId });
    }
  };

  const exportCSV = () => {
    try {
      const rows = filtered.map((m) => ({
        "Student": m.student?.name,
        "Class": m.student?.className,
        "Teacher": m.teacher?.name,
        "Notes": m.notes || "",
        "AI Summary Status": m.aiSummary ? "Generated" : "Pending",
        "AI Summary Text": m.aiSummary || "",
        "WhatsApp Sent": m.whatsappSent ? "Yes" : "No",
        "WhatsApp Sent At": m.whatsappSentAt ? new Date(m.whatsappSentAt).toLocaleString("en-IN") : "",
        "Date": new Date(m.createdAt).toLocaleDateString("en-IN"),
      }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "intellitots-meetings.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const filtered = meetings.filter((m) => {
    const matchesSearch =
      m.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.teacher?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.notes?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || m.meetingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Meetings"
        subtitle={`${meetings.length} parent meetings recorded`}
        icon={FileText}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
            >
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
            >
              Export PDF
            </button>
            <AddMeetingDialog onMeetingCreated={fetchMeetings} />
          </div>
        }
      />

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3 mb-5"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, teacher or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all text-slate-600 font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Follow-Up Required">Follow-Up Required</option>
          <option value="Closed">Closed</option>
        </select>
      </motion.div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            title="No meetings yet"
            description="Create your first parent meeting to start generating AI summaries."
            illustration="meetings"
            action={<AddMeetingDialog onMeetingCreated={fetchMeetings} />}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState title="No results" description={`No meetings match "${search}"`} illustration="meetings" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <MeetingTable meetings={filtered} refreshMeetings={fetchMeetings} />
        </motion.div>
      )}
    </DashboardLayout>
  );
}