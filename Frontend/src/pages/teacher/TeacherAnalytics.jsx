import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, FileText, TrendingUp, Bot, MessageSquare } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

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

export default function TeacherAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/analytics/teacher/${user.id}`);
      setData(res.data);
    } catch {
      setData({ totalMeetings: 0, totalAiSummaries: 0, totalMessagesSent: 0, monthlyTrend: [], growth: {} });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const trendData = data?.monthlyTrend || [];
  const aiRate = data?.totalMeetings > 0 ? Math.round((data.totalAiSummaries / data.totalMeetings) * 100) : 0;
  const msgRate = data?.totalMeetings > 0 ? Math.round((data.totalMessagesSent / data.totalMeetings) * 100) : 0;

  return (
    <DashboardLayout>
      <PageHeader
        title="My Analytics"
        subtitle="Personal performance metrics and trends"
        icon={BarChart3}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Meetings"
          value={data?.totalMeetings || 0}
          icon={FileText}
          gradient="bg-brand-gradient"
          trend={data?.growth?.meetings?.growthDirection}
          trendValue={data?.growth?.meetings?.growthText}
          delay={0}
        />
        <StatCard
          title="AI Summaries"
          value={data?.totalAiSummaries || 0}
          icon={Bot}
          gradient="bg-purple-gradient"
          trend={data?.growth?.aiSummaries?.growthDirection}
          trendValue={data?.growth?.aiSummaries?.growthText}
          delay={0.1}
        />
        <StatCard
          title="Messages Sent"
          value={data?.totalMessagesSent || 0}
          icon={MessageSquare}
          gradient="bg-teal-gradient"
          trend={data?.growth?.messages?.growthDirection}
          trendValue={data?.growth?.messages?.growthText}
          delay={0.2}
        />
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Summary Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-purple-500">{aiRate}%</p>
            <p className="text-sm text-slate-400 mb-1">of meetings</p>
          </div>
          <div className="mt-3 bg-slate-100 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${aiRate}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="bg-purple-500 h-2 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Message Send Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-teal-500">{msgRate}%</p>
            <p className="text-sm text-slate-400 mb-1">of meetings</p>
          </div>
          <div className="mt-3 bg-slate-100 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${msgRate}%` }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="bg-teal-500 h-2 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">Meeting Activity Trend</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No activity recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="meetings" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 4, fill: "#FF6B35" }} name="Meetings" />
                <Line type="monotone" dataKey="aiSummaries" stroke="#9B59B6" strokeWidth={2.5} dot={{ r: 4, fill: "#9B59B6" }} name="AI Summaries" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <Bot size={18} className="text-purple-500" />
            <h2 className="text-base font-bold text-slate-800">Monthly Breakdown</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No breakdowns recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="meetings" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Meetings" />
                <Bar dataKey="messagesSent" fill="#4ECDC4" radius={[4, 4, 0, 0]} name="Messages Sent" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
