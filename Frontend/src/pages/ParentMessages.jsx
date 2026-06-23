import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Eye, CheckCircle, Phone, User, Bot, Mail } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const generateParentCommunicationMessage = (meeting) => {
  if (!meeting || !meeting.aiSummary) return "";
  
  const aiSummary = meeting.aiSummary;
  const lines = aiSummary.split("\n");
  const summaryPattern = /MEETING SUMMARY/i;
  const strengthsPattern = /STRENGTHS/i;
  const improvementsPattern = /IMPROVEMENT/i;
  const actionPointsPattern = /PARENT ACTION POINTS/i;
  const recommendationsPattern = /TEACHER RECOMMENDATIONS/i;
  const followUpPattern = /FOLLOW-UP/i;

  const extractSectionText = (pattern, nextPatterns) => {
    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        startIndex = i;
        break;
      }
    }
    if (startIndex === -1) return "";

    let sectionLines = [];
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      let isNext = false;
      for (const p of nextPatterns) {
        if (p.test(line)) {
          isNext = true;
          break;
        }
      }
      if (isNext) break;
      sectionLines.push(line);
    }
    return sectionLines.join("\n").trim().replace(/^[\-\*•\s\:]+/gm, "• ");
  };

  const meetingSummary = extractSectionText(summaryPattern, [strengthsPattern, improvementsPattern, actionPointsPattern, recommendationsPattern, followUpPattern]);
  const actionPoints = extractSectionText(actionPointsPattern, [recommendationsPattern, followUpPattern]);
  const recommendations = extractSectionText(recommendationsPattern, [followUpPattern]);

  const parentName = meeting.student?.parentName || "Parent";
  
  const formattedActionPoints = actionPoints
    ? actionPoints.split("\n").map(l => l.trim().startsWith("•") ? l : `• ${l.replace(/^[-*•\s]+/g, "")}`).join("\n")
    : "";

  return `Hello ${parentName},

Thank you for attending today's discussion.

${meetingSummary || "We had a productive discussion regarding the child's development."}

Suggested activities at home:
${formattedActionPoints || "• Read together daily\n• Support school routine"}

Teacher Recommendations:
${recommendations || "Continue to encourage and support the child's interests."}

Please share your feedback using the link below:
${window.location.origin}/feedback/${meeting.id}

Thank you.`;
};

function MessagePreviewCard({ meeting, onSend }) {
  const [isSending, setIsSending] = useState(false);
  const [sendType, setSendType] = useState(null); // 'whatsapp' or 'email'
  const [previewType, setPreviewType] = useState(null); // 'whatsapp', 'email', or null

  const waMessage = meeting.aiSummary
    ? generateParentCommunicationMessage(meeting)
    : null;

  const emailSubject = `Parent-Teacher Meeting Summary - FirstCry Intellitots`;
  const emailMessage = waMessage;

  const handleSendWhatsApp = async () => {
    setIsSending(true);
    setSendType("whatsapp");
    const toastId = toast.loading(`Preparing WhatsApp for ${meeting.student?.parentName}...`);
    try {
      await api.post(`/whatsapp/send/${meeting.id}`);
      
      const phone = meeting.student?.parentPhone || "";
      let cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank");

      toast.success("WhatsApp link opened!", { id: toastId });
      onSend(meeting.id, "whatsapp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Student avatar */}
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 font-bold text-base">
              {meeting.student?.name?.[0]?.toUpperCase() || "S"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-800 text-sm">{meeting.student?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{meeting.student?.className}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {meeting.whatsappSent && (
                  <span className="flex items-center gap-1 text-[10px] bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle size={10} /> WA Sent
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User size={12} className="text-slate-400" /> {meeting.student?.parentName}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={12} className="text-slate-400" /> {meeting.student?.parentPhone}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Mail size={12} className="text-slate-400" /> {meeting.student?.parentEmail || <span className="text-slate-300 italic">No email</span>}
              </div>
            </div>

            {meeting.notes && (
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-0.5">Teacher's Notes:</span>
                <p className="whitespace-pre-wrap leading-relaxed">{meeting.notes}</p>
              </div>
            )}

            {/* AI Summary status */}
            <div className="mt-3">
              {meeting.aiSummary ? (
                <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg w-fit">
                  <Bot size={12} /> AI Summary Ready
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg w-fit">
                  No AI Summary — awaiting generation
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {meeting.aiSummary && (
          <div className="mt-4 flex gap-2 border-t border-slate-50 pt-4">
            <button
              onClick={() => setPreviewType(previewType === "whatsapp" ? null : "whatsapp")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium transition-colors ${
                previewType === "whatsapp" ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Eye size={13} /> {previewType === "whatsapp" ? "Hide Message" : "Preview Message"}
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={isSending}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-white text-xs font-semibold shadow-sm hover:bg-teal-600 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Send size={13} />
              )}
              Send WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <AnimatePresence>
        {previewType && waMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                WhatsApp Message Preview
              </p>
              <div className="rounded-xl rounded-tl-sm p-3 max-w-sm text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm bg-[#DCF8C6]">
                {waMessage}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ParentMessages() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/meetings");
      setMeetings(res.data);
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSent = (meetingId, type) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              [type === "whatsapp" ? "whatsappSent" : "emailSent"]: true,
            }
          : m
      )
    );
  };

  const filtered = meetings.filter((m) => {
    if (filter === "pending") return m.aiSummary && !m.whatsappSent;
    if (filter === "sent") return m.whatsappSent;
    if (filter === "no-summary") return !m.aiSummary;
    return true;
  });

  const counts = {
    all: meetings.length,
    pending: meetings.filter((m) => m.aiSummary && !m.whatsappSent).length,
    sent: meetings.filter((m) => m.whatsappSent).length,
    "no-summary": meetings.filter((m) => !m.aiSummary).length,
  };

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title={user?.role === "ADMIN" ? "Meetings" : "Parent Messages"}
        subtitle={user?.role === "ADMIN" ? "View all preschool meeting details and parent summaries" : "Preview and send AI-generated summaries to parents"}
        icon={MessageCircle}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { key: "all", label: "All Meetings" },
          { key: "pending", label: "Ready to Send" },
          { key: "sent", label: "Sent" },
          { key: "no-summary", label: "No Summary" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? "bg-brand-gradient text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            title={filter === "pending" ? "No messages ready to send" : "No meetings found"}
            description={filter === "pending" ? "Generate AI summaries in the Meetings page first." : "Meetings will appear here once created."}
            illustration="meetings"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filtered.map((meeting) => (
              <MessagePreviewCard key={meeting.id} meeting={meeting} onSend={handleSent} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </DashboardLayout>
  );
}
