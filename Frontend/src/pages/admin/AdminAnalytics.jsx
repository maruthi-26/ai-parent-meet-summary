import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, Download, FileText, TrendingUp, Users, Award, Star, ShieldAlert } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import api from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import toast from "react-hot-toast";

const COLORS = ["#FF6B35", "#4ECDC4", "#9B59B6", "#FFB347", "#3498DB", "#E74C3C"];

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

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/analytics/admin");
      setData(res.data);
    } catch {
      setData({
        totalStudents: 0, totalTeachers: 0, totalMeetings: 0,
        totalAiSummaries: 0, totalMessagesSent: 0,
        monthlyTrend: [],
        teacherPerformance: [],
        growth: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(255, 107, 53);
      doc.text("FirstCry Intellitots — Analytics Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);

      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text("Overview Statistics", 14, 40);

      autoTable(doc, {
        startY: 44,
        head: [["Metric", "Value"]],
        body: [
          ["Total Students", data?.totalStudents || 0],
          ["Total Teachers", data?.totalTeachers || 0],
          ["Total Meetings", data?.totalMeetings || 0],
          ["AI Summaries", data?.totalAiSummaries || 0],
          ["Messages Sent", data?.totalMessagesSent || 0],
        ],
        headStyles: { fillColor: [255, 107, 53] },
        alternateRowStyles: { fillColor: [255, 244, 240] },
      });

      if (data?.teacherPerformance?.length > 0) {
        doc.text("Teacher Performance", 14, doc.lastAutoTable.finalY + 14);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 18,
          head: [["Teacher", "Meetings", "AI Summaries", "Messages"]],
          body: data.teacherPerformance.map((t) => [t.name, t.meetings, t.aiSummaries, t.messagesSent]),
          headStyles: { fillColor: [78, 205, 196] },
        });
      }

      doc.save("intellitots-analytics.pdf");
      toast.success("PDF exported successfully!", { id: toastId });
    } catch (e) {
      toast.error("Failed to export PDF", { id: toastId });
    }
  };

  const exportCSV = () => {
    try {
      const rows = [
        { Metric: "Total Students", Value: data?.totalStudents || 0 },
        { Metric: "Total Teachers", Value: data?.totalTeachers || 0 },
        { Metric: "Total Meetings", Value: data?.totalMeetings || 0 },
        { Metric: "AI Summaries", Value: data?.totalAiSummaries || 0 },
        { Metric: "Messages Sent", Value: data?.totalMessagesSent || 0 },
      ];
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "intellitots-analytics.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const pieData = data?.teacherPerformance?.map((t) => ({
    name: t.name.split(" ")[0], value: t.meetings,
  })) || [];

  const monthlyDisplay = data?.monthlyTrend || [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive school performance insights"
        icon={BarChart3}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
            >
              <FileText size={15} /> CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              <Download size={15} /> Export PDF
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full">
        <StatCard
          title="Students"
          value={data?.totalStudents || 0}
          icon={Users}
          gradient="bg-brand-gradient"
          trend={data?.growth?.students?.growthDirection}
          trendValue={data?.growth?.students?.growthText}
          delay={0}
        />
        <StatCard
          title="Teachers"
          value={data?.totalTeachers || 0}
          icon={Users}
          gradient="bg-teal-gradient"
          trend={data?.growth?.teachers?.growthDirection}
          trendValue={data?.growth?.teachers?.growthText}
          delay={0.08}
        />
        <StatCard
          title="Meetings"
          value={data?.totalMeetings || 0}
          icon={FileText}
          gradient="bg-blue-gradient"
          trend={data?.growth?.meetings?.growthDirection}
          trendValue={data?.growth?.meetings?.growthText}
          delay={0.16}
        />
        <StatCard
          title="AI Summaries"
          value={data?.totalAiSummaries || 0}
          icon={TrendingUp}
          gradient="bg-purple-gradient"
          trend={data?.growth?.aiSummaries?.growthDirection}
          trendValue={data?.growth?.aiSummaries?.growthText}
          delay={0.24}
        />
        <StatCard
          title="Messages"
          value={data?.totalMessagesSent || 0}
          icon={FileText}
          gradient="bg-amber-gradient"
          trend={data?.growth?.messages?.growthDirection}
          trendValue={data?.growth?.messages?.growthText}
          delay={0.32}
        />
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-orange-500" />
          <h2 className="text-base font-bold text-slate-800">12-Month Activity Overview</h2>
        </div>
        {monthlyDisplay.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No activity recorded yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyDisplay} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="meetings" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Meetings" opacity={0.85} />
              <Bar dataKey="aiSummaries" fill="#9B59B6" radius={[4, 4, 0, 0]} name="AI Summaries" opacity={0.85} />
              <Line type="monotone" dataKey="messagesSent" stroke="#4ECDC4" strokeWidth={2.5} dot={{ r: 4 }} name="Messages Sent" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Top Performing Teachers rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Highest Satisfaction</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-slate-800 block truncate">
              {data?.rankings?.highestSatisfaction?.name || "N/A"}
            </span>
            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1 font-semibold">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              {data?.rankings?.highestSatisfaction?.averageSatisfaction || 0} / 5 Rating
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">Most Meetings Conducted</span>
            <FileText size={18} className="text-purple-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-slate-800 block truncate">
              {data?.rankings?.mostMeetings?.name || "N/A"}
            </span>
            <p className="text-xs text-purple-700 mt-1 font-semibold">
              {data?.rankings?.mostMeetings?.meetings || 0} Meetings Conducted
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">Best Response Rate</span>
            <Users size={18} className="text-teal-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-slate-800 block truncate">
              {data?.rankings?.bestResponseRate?.name || "N/A"}
            </span>
            <p className="text-xs text-teal-700 mt-1 font-semibold">
              {data?.rankings?.bestResponseRate?.responseRate || 0}% Response Rate
            </p>
          </div>
        </motion.div>
      </div>

      {/* Pie + Teacher Table */}
      <div className="grid lg:grid-cols-12 gap-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-4"
        >
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-purple-500" />
            <h2 className="text-base font-bold text-slate-800">Teacher Contribution</h2>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No teacher data recorded yet</div>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-teal-500" />
            <h2 className="text-base font-bold text-slate-800">Teacher Performance Table</h2>
          </div>
          {data?.teacherPerformance?.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No teacher performance data yet</div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="text-left py-2 font-semibold uppercase tracking-wide">Teacher</th>
                    <th className="text-center py-2 font-semibold text-orange-500 uppercase tracking-wide">Meetings</th>
                    <th className="text-center py-2 font-semibold text-purple-500 uppercase tracking-wide">AI Summaries</th>
                    <th className="text-center py-2 font-semibold text-teal-500 uppercase tracking-wide">Messages</th>
                    <th className="text-center py-2 font-semibold text-slate-600 uppercase tracking-wide">Feedback</th>
                    <th className="text-center py-2 font-semibold text-amber-500 uppercase tracking-wide">Satisfaction</th>
                    <th className="text-center py-2 font-semibold text-rose-500 uppercase tracking-wide">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.teacherPerformance?.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-slate-600">
                      <td className="py-3 font-semibold text-slate-700">{t.name}</td>
                      <td className="text-center py-3 font-bold text-orange-500">{t.meetings}</td>
                      <td className="text-center py-3 font-bold text-purple-500">{t.aiSummaries}</td>
                      <td className="text-center py-3 font-bold text-teal-500">{t.messagesSent}</td>
                      <td className="text-center py-3 font-bold">{t.feedbackCount}</td>
                      <td className="text-center py-3 font-bold text-amber-500">
                        {t.feedbackCount > 0 ? (
                          <span className="inline-flex items-center gap-0.5">
                            {t.averageSatisfaction} <Star size={11} className="fill-amber-400 text-amber-400" />
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="text-center py-3">
                        {t.followUpsPending > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                            <ShieldAlert size={10} /> {t.followUpsPending} Pending
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
