import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FileText, Bot, MessageSquare, Calendar,
  TrendingUp, Plus, Zap, ArrowRight, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import { PageLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import RemindersPanel from "../components/ui/RemindersPanel";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [meetingsRes, analyticsRes] = await Promise.all([
        api.get("/meetings"),
        api.get(`/analytics/teacher/${user.id}`)
      ]);
      setRecentMeetings(meetingsRes.data.slice(0, 5));
      setStats(analyticsRes.data);
      setTrendData(analyticsRes.data.monthlyTrend || []);
    } catch (error) {
      console.error("Error loading teacher dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const QUICK_ACTIONS = [
    { label: "New Meeting", icon: Plus, color: "bg-brand-gradient", action: () => navigate("/meetings") },
    { label: "AI Notices", icon: Zap, color: "bg-purple-gradient", action: () => navigate("/teacher/notices") },
    { label: "Messages", icon: MessageSquare, color: "bg-teal-gradient", action: () => navigate("/parent-messages") },
    { label: "Analytics", icon: TrendingUp, color: "bg-amber-gradient", action: () => navigate("/teacher/analytics") },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-8 bg-teal-gradient p-8 text-white shadow-lg shadow-teal-200/50"
      >
        <div className="relative z-10">
          <p className="text-teal-100 text-sm font-medium mb-1">Welcome back 🎓</p>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          {user?.classes && (
            <p className="text-xs text-teal-100/90 font-medium mt-1">Assigned Classes: <span className="font-bold">{user.classes}</span></p>
          )}
          <p className="mt-2 text-teal-100 text-sm">
            Your teaching dashboard — manage meetings, AI summaries, and parent communication.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium">
            📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full" />
        <div className="absolute right-10 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="My Meetings"
          value={stats.totalMeetings}
          icon={FileText}
          gradient="bg-brand-gradient"
          trend={stats.growth?.meetings?.growthDirection}
          trendValue={stats.growth?.meetings?.growthText}
          delay={0}
        />
        <StatCard
          title="My Summaries"
          value={stats.totalAiSummaries}
          icon={Bot}
          gradient="bg-purple-gradient"
          trend={stats.growth?.aiSummaries?.growthDirection}
          trendValue={stats.growth?.aiSummaries?.growthText}
          delay={0.1}
        />
        <StatCard
          title="Feedback Received"
          value={stats.feedbackCount}
          icon={MessageSquare}
          gradient="bg-teal-gradient"
          trend={stats.growth?.messages?.growthDirection}
          trendValue={stats.growth?.messages?.growthText}
          delay={0.2}
        />
        <StatCard
          title="Parent Satisfaction"
          value={stats.avgSatisfaction}
          suffix="%"
          icon={Star}
          gradient="bg-amber-gradient"
          trend={stats.avgSatisfaction >= 80 ? "up" : "none"}
          trendValue={stats.avgSatisfaction > 0 ? "Excellent satisfaction score" : "No ratings collected"}
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.action}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.color} text-white shadow-sm`}
            >
              <action.icon size={22} />
              <span className="text-xs font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Charts + Recent Meetings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-teal-500" />
            <h2 className="text-base font-bold text-slate-800">My Activity Trend</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No activity trend details recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="meetings" stroke="#4ECDC4" strokeWidth={2.5} dot={{ r: 4, fill: "#4ECDC4" }} name="Meetings" />
                <Line type="monotone" dataKey="aiSummaries" stroke="#9B59B6" strokeWidth={2.5} dot={{ r: 4, fill: "#9B59B6" }} name="AI Summaries" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent Meetings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-orange-500" />
              <h2 className="text-base font-bold text-slate-800">Recent Meetings</h2>
            </div>
            <button
              onClick={() => navigate("/meetings")}
              className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentMeetings.length === 0 ? (
            <EmptyState
              title="No meetings yet"
              description="Start your first parent meeting to see it here."
              illustration="meetings"
            />
          ) : (
            <div className="space-y-2">
              {recentMeetings.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 text-sm font-bold">
                      {m.student?.name?.[0]?.toUpperCase() || "S"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{m.student?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{m.student?.className}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </p>
                    <div className="flex gap-1">
                      {m.aiSummary && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">AI</span>}
                      {m.whatsappSent && <span className="text-xs bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded font-medium">Sent</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Reminders & Follow-Up Engine — Part H */}
      <div className="mt-6">
        <RemindersPanel />
      </div>
    </DashboardLayout>
  );
}