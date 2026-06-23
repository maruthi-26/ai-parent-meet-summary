import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Zap, Copy, Trash2, ChevronDown, ChevronUp, Send, Mail } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";



function NoticeCard({ notice, onDelete, onSendClick }) {
  const [expanded, setExpanded] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`${notice.title}\n\n${notice.content}`);
    toast.success("Notice copied to clipboard!");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-slate-400">
                {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              {notice.createdBy && (
                <span className="text-xs text-slate-400">by {notice.createdBy.name}</span>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{notice.title}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onSendClick(notice)}
              className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors"
              title="Send to Parents"
            >
              <Send size={15} />
            </button>
            <button onClick={copy} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Copy size={15} />
            </button>
            <button onClick={() => onDelete(notice.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function AINotices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [noticeType, setNoticeType] = useState("General Circular");
  const [preview, setPreview] = useState(null);
  const [selectedNoticeForSend, setSelectedNoticeForSend] = useState(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const handleOpenSendDialog = (notice) => {
    setSelectedNoticeForSend(notice);
    setSendDialogOpen(true);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/notices");
      setNotices(res.data);
    } catch {
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("Please enter a topic"); return; }
    setIsGenerating(true);
    const toastId = toast.loading("AI is drafting your notice...");
    try {
      const res = await api.post("/ai/generate-notice", {
        topic: topic.trim(),
        targetAudience: "ALL",
        noticeType
      });
      setPreview(res.data);
      toast.success("Notice generated!", { id: toastId });
    } catch {
      toast.error("Failed to generate notice", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    const toastId = toast.loading("Saving notice...");
    try {
      await api.post("/notices", { title: preview.title, content: preview.content, targetAudience: "ALL" });
      toast.success("Notice saved!", { id: toastId });
      setPreview(null);
      setTopic("");
      fetchNotices();
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting...");
    try {
      await api.delete(`/notices/${id}`);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notice deleted", { id: toastId });
    } catch {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Notice Generator"
        subtitle="Generate professional school notices instantly with AI"
        icon={Megaphone}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Generator Panel */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
          >
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-orange-500" /> Generate Notice
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 font-bold">Notice Type</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-700 transition-all mb-2"
                >
                  <option value="Parent Meeting Reminder">Parent Meeting Reminder</option>
                  <option value="Holiday Notice">Holiday Notice</option>
                  <option value="Fee Reminder">Fee Reminder</option>
                  <option value="Event Announcement">Event Announcement</option>
                  <option value="General Circular">General Circular</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Notice Purpose / Details</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Annual Sports Day details, School closure schedule, Term fee payment instructions..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition-shadow"
                  rows={4}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Generate with AI
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-orange-50 rounded-2xl p-5 border border-orange-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-orange-700 text-sm">Preview</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${preview.title}\n\n${preview.content}`); toast.success("Copied!"); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-600 font-medium hover:bg-orange-100 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleSave}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-sm">{preview.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{preview.content}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notices List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Saved Notices ({notices.length})</h3>
          </div>

          {notices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <EmptyState
                title="No notices yet"
                description="Generate your first AI notice using the panel on the left."
                illustration="notices"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {notices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} onDelete={handleDelete} onSendClick={handleOpenSendDialog} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <SendNoticeDialog
        notice={selectedNoticeForSend}
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
      />
    </DashboardLayout>
  );
}

function SendNoticeDialog({ notice, open, onOpenChange }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("ALL");

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      api.get("/students")
        .then((res) => {
          setStudents(res.data);
        })
        .catch((err) => {
          console.error("Error loading students:", err);
          toast.error("Failed to load students list");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open]);

  if (!notice) return null;

  // Extract unique classes
  const classes = ["ALL", ...new Set(students.map(s => s.className).filter(Boolean))];

  // Filter students based on selected class
  const filteredStudents = students.filter(s => {
    if (selectedClass === "ALL") return true;
    return s.className === selectedClass;
  });

  const handleSendWhatsApp = (student) => {
    let phone = student.parentPhone || "";
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    const message = `Dear ${student.parentName},\n\nNotice: *${notice.title}*\n\n${notice.content}\n\nWarm regards,\nFirstCry Intellitots Team`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Notice to Parents</DialogTitle>
          <DialogDescription>
            Send the notice "{notice.title}" to parents of the selected class.
          </DialogDescription>
        </DialogHeader>

        {/* Filter by Class */}
        <div className="flex items-center gap-2 mb-2 mt-1">
          <span className="text-xs font-semibold text-slate-500">Filter by Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {classes.map((c) => (
              <option key={c} value={c}>{c === "ALL" ? "All Classes" : c}</option>
            ))}
          </select>
        </div>

        {/* Students list */}
        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading student directory...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No students found for this class.</div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="p-3 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-400">Class: {student.className} · Parent: {student.parentName}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleSendWhatsApp(student)}
                    className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors flex items-center gap-1.5 font-semibold"
                    title="Send via WhatsApp"
                  >
                    <Send size={12} /> Send WhatsApp
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
