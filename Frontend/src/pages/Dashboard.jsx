import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, FileText, Bot, MessageSquare, UserCheck,
  Trophy, Medal, Award, Calendar, TrendingUp, Activity, Clock,
  ShieldAlert, ShieldCheck, Heart, Sparkles, AlertCircle
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import { PageLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import RemindersPanel from "../components/ui/RemindersPanel";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="recharts-custom-tooltip">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="text-sm">
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
    fetchAuditLogs();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get("/audit");
      setAuditLogs(response.data.slice(0, 10));
    } catch (error) {
      console.error(error);
    }
  };

  const getTimelineIconAndLabel = (action) => {
    switch (action) {
      case "MEETING_CREATED":
        return { label: "PTM Created", color: "bg-blue-50 text-blue-600 border-blue-200" };
      case "SUMMARY_GENERATED":
        return { label: "Summary Generated", color: "bg-purple-50 text-purple-600 border-purple-200" };
      case "MESSAGE_SENT":
        return { label: "WhatsApp Shared", color: "bg-teal-50 text-teal-600 border-teal-200" };
      case "FEEDBACK_SUBMITTED":
        return { label: "Feedback Received", color: "bg-amber-50 text-amber-600 border-amber-200" };
      case "STATUS_UPDATED":
        return { label: "Status Updated", color: "bg-orange-50 text-orange-600 border-orange-200" };
      default:
        return { label: action.replace(/_/g, " "), color: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/analytics/admin");
      if (response.data.monthlyTrend) {
        setMonthlyData(response.data.monthlyTrend);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !stats) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const rankIcon = (i) => {
    if (i === 0) return <Trophy size={16} className="text-amber-500" />;
    if (i === 1) return <Medal size={16} className="text-slate-400" />;
    if (i === 2) return <Award size={16} className="text-amber-700" />;
    return <span className="text-xs font-bold text-slate-400">#{i + 1}</span>;
  };

  return (
    <DashboardLayout>
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-8 bg-brand-gradient p-8 text-white shadow-lg shadow-orange-200/50"
      >
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">Good morning 👋</p>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="mt-2 text-orange-100 text-sm max-w-md">
            Here's what's happening at FirstCry Intellitots today. You have full administrative access.
          </p>
          <div className="mt-4 flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium">
              📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium">
              🏫 Admin Portal
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute right-24 top-4 w-16 h-16 bg-white/10 rounded-full" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatCard 
          title="Students" 
          value={stats.summary.students.value} 
          icon={Users} 
          gradient="bg-brand-gradient" 
          trend={stats.summary.students.growthDirection} 
          trendValue={stats.summary.students.growthText} 
          delay={0} 
        />
        <StatCard 
          title="Teachers" 
          value={stats.teachers.total} 
          icon={UserCheck} 
          gradient="bg-teal-gradient" 
          trend="up" 
          trendValue={`${stats.teachers.active} active educators`} 
          delay={0.08} 
        />
        <StatCard 
          title="Meetings" 
          value={stats.summary.meetings.value} 
          icon={FileText} 
          gradient="bg-blue-gradient" 
          trend={stats.summary.meetings.growthDirection} 
          trendValue={stats.summary.meetings.growthText} 
          delay={0.16} 
        />
        <StatCard 
          title="AI Summaries" 
          value={stats.summary.aiSummaries.value} 
          icon={Bot} 
          gradient="bg-purple-gradient" 
          trend={stats.summary.aiSummaries.growthDirection} 
          trendValue={stats.summary.aiSummaries.growthText} 
          delay={0.24} 
        />
        <StatCard 
          title="Messages Sent" 
          value={stats.summary.whatsappSent.value} 
          icon={MessageSquare} 
          gradient="bg-amber-gradient" 
          trend={stats.summary.whatsappSent.growthDirection} 
          trendValue={stats.summary.whatsappSent.growthText} 
          delay={0.32} 
        />
        <StatCard 
          title="Follow-Ups" 
          value={stats.parentSatisfaction.followUpsRequired} 
          icon={AlertCircle} 
          gradient="bg-gradient-to-br from-rose-500 to-red-600" 
          trend={stats.parentSatisfaction.followUpsRequired > 0 ? "down" : "none"} 
          trendValue={stats.parentSatisfaction.followUpsRequired > 0 ? `${stats.parentSatisfaction.followUpsRequired} actions pending` : "No urgent actions"} 
          delay={0.4} 
        />
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Satisfaction</span>
            <span className="text-2xl font-black text-slate-800 block">{stats.parentSatisfaction.percentage}%</span>
            <span className="text-xs text-slate-500 block">Based on {stats.parentSatisfaction.totalRatings} feedback scores</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
            <Heart className="fill-teal-500 text-teal-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Most Improved Student</span>
            <span className="text-sm font-extrabold text-slate-800 block truncate max-w-[280px]">{stats.mostImprovedStudent.name}</span>
            <span className="text-xs text-slate-500 block leading-tight">{stats.mostImprovedStudent.improvement}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Sparkles className="fill-orange-100 text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">Monthly Activity Trend</h2>
          </div>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No activity recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9B59B6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#9B59B6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="meetings" stroke="#FF6B35" strokeWidth={2.5} fill="url(#gradMeetings)" name="Meetings" />
                <Area type="monotone" dataKey="aiSummaries" stroke="#9B59B6" strokeWidth={2.5} fill="url(#gradAI)" name="AI Summaries" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Teacher Performance Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-teal-500" />
            <h2 className="text-base font-bold text-slate-800">Teacher Performance</h2>
          </div>
          {stats.teacherStats?.length === 0 ? (
            <EmptyState title="No teacher data yet" description="Teachers will appear here once meetings are created." illustration="students" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.teacherStats?.slice(0, 6)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="meetings" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Meetings" />
                <Bar dataKey="aiSummaries" fill="#9B59B6" radius={[4, 4, 0, 0]} name="AI Summaries" />
                <Bar dataKey="whatsappSent" fill="#4ECDC4" radius={[4, 4, 0, 0]} name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Bottom Row: Leaderboard + Recent Meetings + Risk Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-slate-800">Teacher Leaderboard</h2>
            </div>
            {stats.teacherStats?.length === 0 ? (
              <EmptyState title="No teachers yet" description="Add teachers to see the leaderboard." illustration="students" />
            ) : (
              <div className="space-y-2">
                {[...stats.teacherStats]
                  .sort((a, b) => b.meetings - a.meetings)
                  .slice(0, 5)
                  .map((teacher, i) => (
                    <div key={teacher.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {rankIcon(i)}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {teacher.name?.[0]?.toUpperCase() || "T"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{teacher.name}</p>
                      </div>
                      <div className="flex gap-2.5 text-right">
                        <div>
                          <p className="text-xs font-bold text-orange-500">{teacher.meetings}</p>
                          <p className="text-[10px] text-slate-400">mtgs</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-purple-500">{teacher.aiSummaries}</p>
                          <p className="text-[10px] text-slate-400">AI</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent PTM Workflow Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-blue-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-800">Recent Workflow Activities</h2>
            </div>
            {auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                <Clock size={32} className="text-slate-300 mb-2" />
                <p className="text-xs">No workflow activities recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {auditLogs.map((log) => {
                  const badge = getTimelineIconAndLabel(log.action);
                  return (
                    <div key={log.id} className="flex items-start gap-2.5 text-xs hover:bg-slate-50/50 p-1.5 rounded-xl transition-all">
                      <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${badge.color} border shrink-0`}>
                        {badge.label.split(" ")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {log.action === "FEEDBACK_SUBMITTED" ? "Feedback received" : 
                           log.action === "STATUS_UPDATED" ? "Status updated" : 
                           log.action === "SUMMARY_GENERATED" ? "Summary compiled" : 
                           log.action === "MESSAGE_SENT" ? "WhatsApp shared" : "PTM Scheduled"}
                          {log.student?.name && ` for ${log.student.name}`}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">By {log.teacher?.name}</p>
                      </div>
                      <div className="text-right text-[9px] text-slate-400 shrink-0">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Child Progression Risk Alerts & Concerns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                <h2 className="text-base font-bold text-slate-800">Progression Alerts</h2>
              </div>
              {stats.aiInsights?.studentsRequiringAttention > 0 && (
                <Badge variant="outline" className="text-[9px] font-extrabold uppercase bg-red-50 text-red-600 border-red-200">
                  {stats.aiInsights.studentsRequiringAttention} Flagged
                </Badge>
              )}
            </div>
            
            {/* AI keywords scan summary */}
            <div className="mb-4 p-3 bg-purple-50/20 border border-purple-100 rounded-2xl space-y-2">
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">AI Keywords Insights</span>
              <div className="space-y-1">
                <p className="text-[11px] text-slate-700">
                  <span className="font-bold text-slate-800">Strength:</span> {stats.aiInsights.mostCommonStrength}
                </p>
                <p className="text-[11px] text-slate-700">
                  <span className="font-bold text-slate-800">Concern:</span> {stats.aiInsights.mostCommonConcern}
                </p>
              </div>
            </div>

            {(!stats.riskAlerts || stats.riskAlerts.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                <ShieldCheck size={32} className="text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">All students on track</p>
                <p className="text-[10px] text-slate-400 mt-1">No developmental risks flagged.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.riskAlerts.map((alert) => (
                  <div key={alert.id} className="p-2.5 bg-rose-50/20 border border-rose-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/students/${alert.id}`} className="text-xs font-bold text-slate-800 hover:text-orange-500 transition-colors truncate">
                        {alert.name} ({alert.className})
                      </Link>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                        alert.riskLevel === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {alert.riskLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      {alert.riskExplanation || "Teacher flagged development concerns in PTM evaluation notes."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Reminders & Follow-Up Engine — Part H */}
      <div className="mt-6">
        <RemindersPanel />
      </div>
    </DashboardLayout>
  );
}