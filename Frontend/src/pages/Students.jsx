import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, Plus } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { SkeletonTable } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import StudentTable from "../components/students/StudentTable";
import AddStudentDialog from "../components/students/AddStudentDialog";
import api from "../services/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const exportPDF = () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(255, 107, 53);
      doc.text("FirstCry Intellitots — Enrolled Students Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);

      autoTable(doc, {
        startY: 34,
        head: [["Student Name", "Class", "Assigned Teacher", "Parent Name", "Parent Phone", "Parent Email"]],
        body: filtered.map((s) => [s.name, s.className, s.teacher?.name || "Unassigned", s.parentName, s.parentPhone, s.parentEmail || "N/A"]),
        headStyles: { fillColor: [255, 107, 53] },
        alternateRowStyles: { fillColor: [255, 244, 240] },
      });

      doc.save("intellitots-students.pdf");
      toast.success("PDF exported successfully!", { id: toastId });
    } catch (e) {
      toast.error("Failed to export PDF", { id: toastId });
    }
  };

  const exportCSV = () => {
    try {
      const rows = filtered.map((s) => ({
        "Student Name": s.name,
        "Class": s.className,
        "Assigned Teacher": s.teacher?.name || "Unassigned",
        "Parent Name": s.parentName,
        "Parent Phone": s.parentPhone,
        "Parent Email": s.parentEmail || "",
      }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "intellitots-students.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.className?.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.parentEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Students"
        subtitle={`${students.length} enrolled students`}
        icon={GraduationCap}
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
            <AddStudentDialog onStudentCreated={fetchStudents} />
          </div>
        }
      />

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-5"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search students, class or parent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
        />
      </motion.div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            title="No students yet"
            description="Add your first student to get started with meetings and parent communication."
            illustration="students"
            action={<AddStudentDialog onStudentCreated={fetchStudents} />}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState title="No results found" description={`No students match "${search}"`} illustration="students" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <StudentTable students={filtered} onStudentChanged={fetchStudents} />
        </motion.div>
      )}
    </DashboardLayout>
  );
}