import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { Star, Smile, Frown, Meh, TrendingUp, BarChart3, PieChart as PieIcon, Calendar, Heart, ShieldAlert } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import api from "../services/api";
import toast from "react-hot-toast";
import { Badge } from "../components/ui/badge";

const COLORS = ["#4ECDC4", "#FFB347", "#FF6B35"]; // Positive, Neutral, Negative

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ParentSatisfaction() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSatisfactionData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, analyticsRes, feedbacksRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/analytics/admin"),
        api.get("/feedback")
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setFeedbacks(feedbacksRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load parent satisfaction analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSatisfactionData();
  }, []);

  if (isLoading || !stats || !analytics) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  const { percentage, totalRatings, positiveCount, neutralCount, negativeCount, followUpsRequired } = stats.parentSatisfaction;

  const pieData = [
    { name: "Positive", value: positiveCount },
    { name: "Neutral", value: neutralCount },
    { name: "Negative", value: negativeCount }
  ].filter(item => item.value > 0);

  const feedbackTrend = analytics.feedbackTrend || [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Parent Satisfaction"
        subtitle="Real-time parent satisfaction tracking and sentiment analysis"
        icon={Star}
      />

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Satisfaction</span>
          <span className="text-3xl font-black text-orange-500 mt-2 block">{percentage}%</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Based on feedback ratings</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Feedback Received</span>
          <span className="text-3xl font-black text-purple-600 mt-2 block">{totalRatings}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Total responses received</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-teal-50/20 rounded-2xl p-5 border border-teal-100 flex flex-col justify-between"
        >
          <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Smile size={12} /> Positive Reviews
          </span>
          <span className="text-3xl font-black text-teal-600 mt-2 block">{positiveCount}</span>
          <span className="text-[10px] text-teal-500 mt-1 block">Rating 4 or 5 stars</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-amber-50/20 rounded-2xl p-5 border border-amber-100 flex flex-col justify-between"
        >
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Meh size={12} /> Neutral Reviews
          </span>
          <span className="text-3xl font-black text-amber-600 mt-2 block">{neutralCount}</span>
          <span className="text-[10px] text-amber-500 mt-1 block">Rating 3 stars</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-rose-50/20 rounded-2xl p-5 border border-rose-100 flex flex-col justify-between"
        >
          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Frown size={12} /> Negative Reviews
          </span>
          <span className="text-3xl font-black text-rose-600 mt-2 block">{negativeCount}</span>
          <span className="text-[10px] text-rose-500 mt-1 block">Rating 1 or 2 stars</span>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Feedback Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={16} className="text-orange-500" />
            <h3 className="text-sm font-bold text-slate-800">Feedback Distribution</h3>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-xs">No feedback data recorded</div>
          ) : (
            <div className="relative h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius="55%" outerRadius="75%" paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px", marginTop: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Satisfaction Trend Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between lg:col-span-1"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800">Satisfaction Trend (Avg Rating)</h3>
          </div>
          {feedbackTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-xs">No trend records found</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={feedbackTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="averageRating" stroke="#9B59B6" strokeWidth={3} dot={{ r: 4 }} name="Average Rating" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Monthly Feedback Trend Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between lg:col-span-1"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">Monthly Submission Volume</h3>
          </div>
          {feedbackTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-xs">No submission trend records found</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feedbackTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#4ECDC4" radius={[4, 4, 0, 0]} name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Feedbacks Responses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-orange-500" />
            <h2 className="font-bold text-slate-800 text-sm">Submitted Parent Feedback</h2>
          </div>
          {followUpsRequired > 0 && (
            <span className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
              <ShieldAlert size={10} /> {followUpsRequired} Follow-Ups Needed
            </span>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <EmptyState title="No feedback logged yet" description="Feedback from parents will appear here automatically upon submission." illustration="meetings" />
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((item) => (
              <div key={item.id} className="px-6 py-5 flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-50/30 transition-colors">
                
                {/* Left Info: Student, Class, Date */}
                <div className="w-full md:w-1/4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">
                      {item.meeting?.student?.name?.[0]?.toUpperCase() || "S"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.meeting?.student?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.meeting?.student?.className}</p>
                    <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar size={10} />
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                {/* Middle Content: Comments & Teacher name */}
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">Teacher: {item.meeting?.teacher?.name}</p>
                  {item.comment ? (
                    <p className="text-xs text-slate-700 mt-1.5 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      {`"${item.comment}"`}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300 italic mt-1.5">No comments shared.</p>
                  )}
                </div>

                {/* Right Rating Details */}
                <div className="w-full md:w-auto flex flex-row md:flex-col md:items-end justify-between items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 md:mt-1.5">
                    <Badge className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {item.satisfactionLevel}
                    </Badge>
                    <Badge className={`text-[9px] font-bold uppercase ${
                      item.sentiment === "Positive" ? "bg-teal-50 text-teal-600 border border-teal-200" :
                      item.sentiment === "Negative" ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse" :
                      "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>
                      {item.sentiment}
                    </Badge>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
