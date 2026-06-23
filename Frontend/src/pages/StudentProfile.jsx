import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  Bot,
  MessageSquare,
  ClipboardList,
  Heart,
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import api from "../services/api";
import toast from "react-hot-toast";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  const fetchStudentProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/students/${id}/profile`);
      setStudent(response.data);
    } catch (error) {
      toast.error("Failed to load student profile");
      navigate("/students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse lg:col-span-1" />
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse lg:col-span-2" />
        </div>
      </DashboardLayout>
    );
  }

  if (!student) return null;

  // Compute Stats
  const totalMeetings = student.meetings?.length || 0;
  const meetingsWithRating = student.meetings?.filter(m => m.satisfactionRating !== null) || [];
  const avgSatisfaction = meetingsWithRating.length > 0 
    ? (meetingsWithRating.reduce((sum, m) => sum + m.satisfactionRating, 0) / meetingsWithRating.length).toFixed(1)
    : "N/A";

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH": return "from-rose-500 to-red-600 text-white border-rose-600";
      case "MEDIUM": return "from-amber-500 to-orange-600 text-white border-amber-600";
      default: return "from-teal-500 to-emerald-600 text-white border-teal-600";
    }
  };

  // Compile timeline events from meetings and audit logs
  const timelineEvents = [];
  
  if (student.meetings) {
    student.meetings.forEach(meeting => {
      timelineEvents.push({
        id: `meeting-${meeting.id}`,
        type: "meeting",
        date: new Date(meeting.createdAt),
        title: "Parent-Teacher Meeting",
        description: meeting.notes ? `Notes: "${meeting.notes.substring(0, 120)}..."` : "Meeting conducted.",
        rating: meeting.satisfactionRating,
        aiSummary: meeting.aiSummary,
        raw: meeting
      });
      
      if (meeting.whatsappSent) {
        timelineEvents.push({
          id: `whatsapp-${meeting.id}`,
          type: "whatsapp",
          date: new Date(meeting.whatsappSentAt || meeting.createdAt),
          title: "WhatsApp Message Sent",
          description: "AI Parent Summary successfully shared on WhatsApp.",
          raw: meeting
        });
      }

      if (meeting.emailSent) {
        timelineEvents.push({
          id: `email-${meeting.id}`,
          type: "email",
          date: new Date(meeting.emailSentAt || meeting.createdAt),
          title: "Email Notification Sent",
          description: "Summary report dispatched to parent email address.",
          raw: meeting
        });
      }
    });
  }

  if (student.auditLogs) {
    student.auditLogs.forEach(log => {
      // Avoid duplication with direct meeting states but add other events
      if (!["MEETING_CREATED", "SUMMARY_GENERATED"].includes(log.action)) {
        let actionTitle = log.action.replace(/_/g, " ");
        timelineEvents.push({
          id: `audit-${log.id}`,
          type: "audit",
          date: new Date(log.createdAt),
          title: actionTitle.charAt(0).toUpperCase() + actionTitle.slice(1).toLowerCase(),
          description: log.details ? JSON.parse(log.details).notesSnippet || JSON.parse(log.details).name || "Administrative log detail." : "Activity logged.",
          teacherName: log.teacher?.name || "Teacher"
        });
      }
    });
  }

  // Sort timeline chronological (descending)
  timelineEvents.sort((a, b) => b.date - a.date);

  return (
    <DashboardLayout>
      {/* Back navigation & header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/students")}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm text-slate-600"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{student.name}</h1>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border-orange-200">
                {student.className}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Student 360° Profile & Development Dashboard</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/meetings`, { state: { filterStudent: student.name } })}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all"
          >
            <Calendar size={14} className="text-slate-400" />
            View Meetings
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Parent Satisfaction"
          value={avgSatisfaction === "N/A" ? "N/A" : `${avgSatisfaction} / 5`}
          icon={Heart}
          color="teal"
          description={avgSatisfaction === "N/A" ? "No feedback ratings yet" : "Average meeting satisfaction rating"}
        />

        <div className={`rounded-2xl border bg-gradient-to-r p-5 shadow-sm relative overflow-hidden flex flex-col justify-between ${getRiskColor(student.riskLevel)}`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">AI Development Risk</span>
            {student.riskLevel?.toUpperCase() === "LOW" ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          </div>
          <div>
            <span className="text-3xl font-extrabold tracking-tight">{student.riskLevel}</span>
            <p className="text-[11px] mt-1.5 opacity-90 truncate max-w-full" title={student.riskExplanation}>
              {student.riskExplanation || "Standard developmental trajectory observed."}
            </p>
          </div>
        </div>

        <StatCard
          title="Recorded Meetings"
          value={totalMeetings}
          icon={Calendar}
          color="orange"
          description="Total parent interactions scheduled"
        />
      </div>

      {/* Grid: Profile detail & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Metadata Cards */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Profile info card */}
          <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User size={15} className="text-orange-500" /> Student Profile Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender</span>
                  <span className="text-sm font-semibold text-slate-700 capitalize mt-0.5 block">{student.gender?.toLowerCase() || "Not set"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Enrollment</span>
                  <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{new Date(student.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Parent / Guardian</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{student.parentName}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Phone size={13} className="text-slate-400" />
                  <a href={`tel:${student.parentPhone}`} className="hover:underline hover:text-orange-500">{student.parentPhone}</a>
                </div>
                {student.parentEmail && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 overflow-hidden">
                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${student.parentEmail}`} className="hover:underline hover:text-orange-500 truncate">{student.parentEmail}</a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Teacher card */}
          {student.teacher && (
            <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap size={15} className="text-orange-500" /> Assigned Educator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-sm font-bold">
                      {student.teacher.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{student.teacher.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{student.teacher.email}</p>
                    {student.teacher.gender && (
                      <Badge variant="outline" className="text-[9px] font-bold bg-slate-50 text-slate-500 border-slate-200 mt-1.5 capitalize">
                        {student.teacher.gender.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Risk Assessment Rationale details */}
          {student.riskLevel !== "LOW" && student.riskExplanation && (
            <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />
              <div className="flex gap-2.5 items-start">
                <Sparkles className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">AI Evaluation Details</h4>
                  <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">{student.riskExplanation}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Navigation Tabs & Feeds */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs bar */}
          <div className="flex gap-1.5 border-b border-slate-200 pb-px">
            {[
              { id: "timeline", label: "Interactive Feed", icon: ClipboardList },
              { id: "meetings", label: "Meeting History", icon: Calendar },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content corresponding to active tab */}
          {activeTab === "timeline" ? (
            <div className="space-y-6">
              {timelineEvents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 text-xs">
                  No interactions recorded yet. Schedule a meeting to begin.
                </div>
              ) : (
                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {timelineEvents.map((evt, idx) => (
                    <motion.div 
                      key={evt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <span className={`absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-white flex-shrink-0 shadow-sm ${
                        evt.type === "meeting"
                          ? "bg-purple-500"
                          : evt.type === "whatsapp"
                          ? "bg-teal-500"
                          : evt.type === "email"
                          ? "bg-blue-500"
                          : "bg-slate-400"
                      }`} />

                      {/* Timeline Card */}
                      <Card className="rounded-xl border border-slate-100 shadow-sm hover:shadow transition-shadow overflow-hidden">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-800">{evt.title}</h3>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {evt.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {evt.type === "meeting" && (
                              <div className="flex gap-1.5 flex-wrap">
                                {evt.rating && (
                                  <Badge variant="outline" className="text-[9px] font-bold bg-teal-50 text-teal-600 border-teal-200">
                                    Rating: {evt.rating}/5
                                  </Badge>
                                )}
                                {evt.raw.riskLevel && (
                                  <Badge variant="outline" className={`text-[9px] font-bold ${
                                    evt.raw.riskLevel === "HIGH" ? "bg-rose-50 text-rose-600 border-rose-200" :
                                    evt.raw.riskLevel === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                    "bg-teal-50 text-teal-600 border-teal-200"
                                  }`}>
                                    Risk: {evt.raw.riskLevel}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-3 leading-relaxed whitespace-pre-wrap">
                            {evt.description}
                          </p>

                          {/* Expansion for meetings */}
                          {evt.type === "meeting" && (
                            <div className="border-t border-slate-50 mt-4 pt-4 flex items-center justify-between gap-4 flex-wrap">
                              {evt.aiSummary ? (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                  <Bot size={13} className="text-purple-500" />
                                  AI Summary Prepared
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400 italic">AI Summary Pending</div>
                              )}
                              <button 
                                onClick={() => navigate(`/meetings/${evt.raw.id}`)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
                              >
                                Open Workspace
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Meetings List Tab
            <div className="space-y-4">
              {(!student.meetings || student.meetings.length === 0) ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 text-xs">
                  No meeting records exist for this student.
                </div>
              ) : (
                student.meetings.map((meeting) => (
                  <Card key={meeting.id} className="rounded-xl border border-slate-100 hover:border-orange-100 hover:shadow-sm transition-all overflow-hidden">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {new Date(meeting.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </h4>
                          {meeting.satisfactionRating && (
                            <Badge variant="outline" className="text-[9px] font-bold bg-teal-50 text-teal-600 border-teal-200">
                              Feedback Score: {meeting.satisfactionRating}/5
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-[9px] font-bold ${
                            meeting.riskLevel === "HIGH" ? "bg-rose-50 text-rose-600 border-rose-200" :
                            meeting.riskLevel === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-teal-50 text-teal-600 border-teal-200"
                          }`}>
                            Risk: {meeting.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-2 max-w-lg" title={meeting.notes}>
                          {meeting.notes || <span className="italic text-slate-300">No meeting notes captured.</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/meetings/${meeting.id}`)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
                        >
                          Workspace
                          <ExternalLink size={12} className="text-slate-400" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
