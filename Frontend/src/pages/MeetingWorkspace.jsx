import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  User,
  Calendar,
  Save,
  MessageSquare,
  Sparkles,
  ClipboardList,
  Smile,
  Copy,
  Check,
  Star,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink,
  BookOpen,
  Home,
  UserCheck
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import api from "../services/api";
import toast from "react-hot-toast";

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

const getTimelineIconAndLabel = (action) => {
  switch (action) {
    case "MEETING_CREATED":
      return { label: "Meeting Created" };
    case "SUMMARY_GENERATED":
      return { label: "AI Summary Generated" };
    case "MESSAGE_SENT":
      return { label: "Parent Message Sent" };
    case "FEEDBACK_SUBMITTED":
      return { label: "Parent Feedback Submitted" };
    case "STATUS_UPDATED":
      return { label: "Status Updated" };
    default:
      return { label: action.replace(/_/g, " ") };
  }
};

export default function MeetingWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [notes, setNotes] = useState("");
  const [refinement, setRefinement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("followups");
  const [parentMessage, setParentMessage] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const fetchMeetingDetails = async () => {
    try {
      const response = await api.get(`/meetings/${id}`);
      setMeeting(response.data);
      setNotes(response.data.notes || "");
      if (response.data.aiSummary) {
        setParentMessage(generateParentCommunicationMessage(response.data));
      }
    } catch (error) {
      toast.error("Failed to load meeting details");
      navigate("/meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMeetingDetails();
  }, [id]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/meetings/${id}`, { notes });
      toast.success("Meeting notes saved successfully!");
      fetchMeetingDetails();
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!notes.trim()) {
      toast.error("Please add some meeting notes first!");
      return;
    }
    
    setIsGenerating(true);
    const toastId = toast.loading(refinement ? "Refining AI summary..." : "Generating AI summary...");
    try {
      await api.post(`/ai/generate/${id}`, { refinementInstruction: refinement });
      toast.success(refinement ? "AI summary refined!" : "AI summary generated!", { id: toastId });
      setRefinement("");
      fetchMeetingDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate summary", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRateMeeting = async (rating) => {
    try {
      await api.patch(`/meetings/${id}/rate`, { rating });
      toast.success(`Meeting satisfaction logged: ${rating} Stars!`);
      fetchMeetingDetails();
    } catch (error) {
      toast.error("Failed to update rating");
    }
  };

  const handleSimulateWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    const toastId = toast.loading("Simulating WhatsApp delivery...");
    try {
      await api.post(`/whatsapp/send/${id}`);
      
      const phone = meeting.student?.parentPhone || "";
      let cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(parentMessage)}`;
      window.open(waUrl, "_blank");

      toast.success("WhatsApp delivery simulated! Message state: SENT -> READ", { id: toastId });
      fetchMeetingDetails();
    } catch (error) {
      toast.error("Failed to trigger delivery simulation", { id: toastId });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!parentMessage) return;
    try {
      await navigator.clipboard.writeText(parentMessage);
      setCopied(true);
      toast.success("Parent message copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!meeting) return null;

  // Safe parse for smart follow-up suggestions
  let followUpData = null;
  if (meeting.followUpActions) {
    try {
      followUpData = JSON.parse(meeting.followUpActions);
    } catch (e) {
      // If it's stored as plain text fallback
      followUpData = {
        nextActions: meeting.followUpActions,
        parentFollowUp: "Refer to notes for specific parent action items.",
        studentSuggestions: "Practice relevant learning sheets.",
        teacherItems: "Observe classroom social dynamics."
      };
    }
  }

  return (
    <DashboardLayout>
      {/* Back button & page metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/meetings")}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm text-slate-600"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Meeting Workspace</h1>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border-orange-200">
                {meeting.student?.className}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Collaborative workspace with {meeting.student?.name}'s parents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">
            Date: {new Date(meeting.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Notes & AI summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Educator notes capture */}
          <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/40">
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={15} className="text-orange-500" /> Educator Meeting Notes
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 mt-0.5">Capture classroom performance, behaviour, and goals</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="bg-brand-gradient text-white hover:opacity-90 rounded-xl px-4 text-xs font-semibold h-8"
              >
                <Save size={13} className="mr-1" />
                {isSaving ? "Saving..." : "Save Notes"}
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              <Textarea
                placeholder="E.g., Vihaan is showing excellent focus in drawing and has learnt numbers 1-20. We need to work on pencil grasp and sharing toys during playtime."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[140px] rounded-xl border-slate-200 text-sm focus-visible:ring-orange-400 leading-relaxed"
              />
            </CardContent>
          </Card>

          {/* AI generated communications summary pane */}
          <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/20">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Bot size={15} className="text-purple-600 animate-pulse" /> AI Summary & Personalized Insights
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 mt-0.5">Automated child development evaluation</CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating || !notes.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-8"
                >
                  <Sparkles size={13} className="mr-1" />
                  {meeting.aiSummary ? "Regenerate Summary" : "Generate Summary"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Output summary box */}
              <div className="min-h-[100px] bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap relative">
                {meeting.aiSummary ? (
                  meeting.aiSummary
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                    <Bot size={28} className="text-slate-300 mb-2" />
                    <p className="text-xs">No AI summary generated for this meeting yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Press the Generate button above to compile notes.</p>
                  </div>
                )}
              </div>

              {/* Interactive prompt adjustment panel */}
              {meeting.aiSummary && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Tweak or Adjust with AI</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="E.g., Make it more encouraging, focus heavily on writing, translate to Hindi..."
                      value={refinement}
                      onChange={(e) => setRefinement(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs focus-visible:ring-purple-400"
                    />
                    <Button
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isGenerating || !refinement.trim()}
                      className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold px-4 h-9 flex-shrink-0"
                    >
                      Apply Tweak
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Development smart recommendations tab */}
          {followUpData && (
            <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <CardHeader className="py-3.5 border-b border-slate-100 bg-slate-50/50 flex gap-1 pb-px">
                <div className="flex gap-1.5">
                  {[
                    { id: "followups", label: "Smart Action Items", icon: TrendingUp },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 border-orange-500 text-orange-500"
                    >
                      <tab.icon size={13} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* next checkin */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Next Step Checks</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-normal">{followUpData.nextActions || "Routine follow-up in 4 weeks."}</p>
                  </div>

                  {/* parent followups */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Home size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Parent Actions (Home)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-normal">{followUpData.parentFollowUp || "Daily counting and reading tasks."}</p>
                  </div>

                  {/* student suggestions */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 text-teal-600">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Student suggestions</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-normal">{followUpData.studentSuggestions || "Writing worksheets practice."}</p>
                  </div>

                  {/* teacher actions */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 text-blue-600">
                      <UserCheck size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Teacher items (Class)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-normal">{followUpData.teacherItems || "Regular classroom participation check."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column - Parent Message Generator, Feedback & Satisfaction details, and Workflow Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Student details mini-card */}
          <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  {meeting.student?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <Link to={`/students/${meeting.studentId}`} className="text-sm font-bold text-slate-800 hover:text-orange-500 transition-colors flex items-center gap-1">
                    {meeting.student?.name}
                    <ExternalLink size={11} className="text-slate-400" />
                  </Link>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{meeting.student?.className} • Parent: {meeting.student?.parentName}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Meeting Status</span>
                <Badge className={`text-[9px] font-bold uppercase mt-1 ${
                  meeting.meetingStatus === "Closed" ? "bg-slate-500 text-white" :
                  meeting.meetingStatus === "Follow-Up Required" ? "bg-rose-500 text-white animate-pulse" :
                  meeting.meetingStatus === "Completed" ? "bg-emerald-500 text-white" :
                  "bg-blue-500 text-white"
                }`}>
                  {meeting.meetingStatus || "Scheduled"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Parent Communication Message Card */}
          {meeting.aiSummary && (
            <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <CardHeader className="py-4 border-b border-slate-100 bg-teal-50/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare size={15} className="text-teal-600" /> Parent Message Generator
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-400 mt-0.5">Format, edit, and send updates to parents</CardDescription>
                </div>
                <button
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="text-xs font-bold text-teal-600 hover:underline"
                >
                  {isEditingMessage ? "Preview" : "Edit"}
                </button>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                {isEditingMessage ? (
                  <Textarea
                    value={parentMessage}
                    onChange={(e) => setParentMessage(e.target.value)}
                    className="min-h-[220px] rounded-xl border-slate-200 text-xs focus-visible:ring-teal-400 leading-relaxed"
                  />
                ) : (
                  <div className="rounded-2xl p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm bg-[#DCF8C6] border border-[#C5E1A5] max-h-[300px] overflow-y-auto">
                    {parentMessage}
                  </div>
                )}

                {/* Simulated delivery log indicator */}
                <div className="flex items-center justify-between border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
                  <span className="text-slate-500 font-medium">Message Dispatch Status</span>
                  {meeting.whatsappSent ? (
                    <span className="text-teal-600 font-bold bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                      Delivered & Read
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">
                      Pending Send
                    </span>
                  )}
                </div>

                {/* Dispatch buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCopyMessage}
                    className="rounded-xl border-slate-200 text-slate-700 font-bold text-xs h-10 hover:bg-slate-50"
                  >
                    {copied ? (
                      <Check size={14} className="mr-1 text-teal-600" />
                    ) : (
                      <Copy size={14} className="mr-1" />
                    )}
                    {copied ? "Copied" : "Copy Message"}
                  </Button>

                  <Button
                    onClick={handleSimulateWhatsApp}
                    disabled={isSendingWhatsApp}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs h-10 shadow-sm"
                  >
                    Send on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parent Feedback Survey Response */}
          {meeting.feedback ? (
            <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <CardHeader className="py-4 border-b border-slate-100 bg-amber-50/10">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Smile size={15} className="text-amber-500" /> Parent Feedback Response
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 mt-0.5">Response submitted by parent directly</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={star <= meeting.feedback.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <Badge className={`text-[10px] font-bold uppercase ${
                    meeting.feedback.sentiment === "Positive" ? "bg-teal-500 text-white" :
                    meeting.feedback.sentiment === "Negative" ? "bg-rose-500 text-white animate-pulse" :
                    "bg-slate-500 text-white"
                  }`}>
                    {meeting.feedback.sentiment} Sentiment
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Satisfaction Level</span>
                  <p className="text-xs font-semibold text-slate-700">{meeting.feedback.satisfactionLevel}</p>
                </div>
                {meeting.feedback.comment && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Parent Comment</span>
                    <p className="text-xs text-slate-700 italic">"{meeting.feedback.comment}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/10">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Smile size={15} className="text-slate-400" /> Parent Feedback Response
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 mt-0.5">Response submitted by parent directly</CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col items-center py-6 text-center text-slate-400">
                <Smile size={28} className="text-slate-300 mb-2" />
                <p className="text-xs">No feedback submitted by the parent yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Status will auto-update upon feedback submission.</p>
              </CardContent>
            </Card>
          )}

          {/* Workflow Timeline Card */}
          <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock size={15} className="text-slate-600" /> PTM Workflow Timeline
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-400 mt-0.5">Chronological workflow tracking of this meeting</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l border-slate-100 pl-6 ml-2 space-y-6 py-2">
                {meeting.auditLogs && meeting.auditLogs.length > 0 ? (
                  meeting.auditLogs.map((log) => {
                    const badge = getTimelineIconAndLabel(log.action);
                    return (
                      <div key={log.id} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          log.action === "FEEDBACK_SUBMITTED" ? "bg-amber-500 ring-4 ring-amber-100" :
                          log.action === "STATUS_UPDATED" ? "bg-orange-500 ring-4 ring-orange-100" :
                          log.action === "SUMMARY_GENERATED" ? "bg-purple-500 ring-4 ring-purple-100" :
                          log.action === "MESSAGE_SENT" ? "bg-teal-500 ring-4 ring-teal-100" :
                          "bg-blue-500 ring-4 ring-blue-100"
                        }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">{badge.label}</span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(log.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              {(() => {
                                try {
                                  const detailsObj = JSON.parse(log.details);
                                  if (detailsObj.from && detailsObj.to) {
                                    return `Status transitioned from ${detailsObj.from} to ${detailsObj.to}`;
                                  }
                                  if (detailsObj.rating) {
                                    return `Rating: ${detailsObj.rating} Stars (${detailsObj.satisfactionLevel})`;
                                  }
                                  if (detailsObj.channel) {
                                    return `Sent via ${detailsObj.channel}`;
                                  }
                                  return "";
                                } catch (e) {
                                  return log.details;
                                }
                              })()}
                            </p>
                          )}
                          <p className="text-[9px] text-slate-400 mt-0.5">By: {log.teacher?.name}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400">No activity logged for this meeting.</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
