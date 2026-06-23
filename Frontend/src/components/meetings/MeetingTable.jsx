import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Bot, CheckCircle, Clock, MessageSquare, Briefcase, Calendar } from "lucide-react";
import SummaryDialog from "./SummaryDialog";
import GenerateSummaryButton from "./GenerateSummaryButton";
import SendWhatsAppButton from "./SendWhatsAppButton";

export default function MeetingTable({ meetings, refreshMeetings }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Completed":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Follow-Up Required":
        return "bg-rose-50 text-rose-600 border border-rose-100 font-bold animate-pulse";
      case "Closed":
        return "bg-slate-50 text-slate-600 border border-slate-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-100";
    }
  };

  const formatDate = (dateStr, createdAt) => {
    if (!dateStr) {
      return new Date(createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
    // Handle yyyy-mm-dd or similar
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Teacher</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Meeting Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Summary</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting, i) => (
              <motion.tr
                key={meeting.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                {/* Student */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Link to={`/students/${meeting.studentId}`} className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 hover:opacity-85 transition-opacity">
                      <span className="text-orange-600 text-xs font-bold">
                        {meeting.student?.name?.[0]?.toUpperCase() || "S"}
                      </span>
                    </Link>
                    <div>
                      <Link to={`/students/${meeting.studentId}`} className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline transition-colors block">
                        {meeting.student?.name}
                      </Link>
                      <p className="text-xs text-slate-400">{meeting.student?.className}</p>
                    </div>
                  </div>
                </td>

                {/* Teacher */}
                <td className="px-5 py-3.5">
                  <p className="text-sm text-slate-700">{meeting.teacher?.name}</p>
                </td>

                {/* Meeting Date */}
                <td className="px-5 py-3.5 text-sm text-slate-600">
                  {formatDate(meeting.meetingDate, meeting.createdAt)}
                </td>

                {/* Meeting Time */}
                <td className="px-5 py-3.5 text-sm text-slate-600">
                  {meeting.meetingTime || "10:00"}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeClass(meeting.meetingStatus)}`}>
                    {meeting.meetingStatus || "Scheduled"}
                  </span>
                </td>

                {/* AI Summary Status */}
                <td className="px-5 py-3.5">
                  {meeting.aiSummary ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">
                      <Bot size={11} /> Generated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                      <Clock size={11} /> Pending
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Open Workspace"
                    >
                      <Briefcase size={13} /> Workspace
                    </button>

                    <GenerateSummaryButton
                      meetingId={meeting.id}
                      hasExisting={!!meeting.aiSummary}
                      onGenerated={refreshMeetings}
                    />

                    {meeting.aiSummary && (
                      <SendWhatsAppButton
                        meeting={meeting}
                        alreadySent={meeting.whatsappSent}
                        onSent={refreshMeetings}
                      />
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <SummaryDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        summary={selectedMeeting?.aiSummary || ""} 
        studentName={selectedMeeting?.student?.name || "Student"}
      />
    </div>
  );
}