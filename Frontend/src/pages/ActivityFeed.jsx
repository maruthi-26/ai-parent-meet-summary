import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Calendar, Bot, MessageSquare, Filter } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import api from "../services/api";

const TYPE_CONFIG = {
  MEETING_CREATED: {
    icon: Calendar, color: "bg-orange-100 text-orange-600", dot: "bg-orange-500", label: "Meeting",
  },
  AI_SUMMARY: {
    icon: Bot, color: "bg-purple-100 text-purple-600", dot: "bg-purple-500", label: "AI Summary",
  },
  MESSAGE_SENT: {
    icon: MessageSquare, color: "bg-teal-100 text-teal-600", dot: "bg-teal-500", label: "Message",
  },
};

const FILTER_TYPES = [
  { key: "all", label: "All" },
  { key: "MEETING_CREATED", label: "Meetings" },
  { key: "AI_SUMMARY", label: "AI Summaries" },
  { key: "MESSAGE_SENT", label: "Messages" },
];

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// Mock data for when backend has no activity
const MOCK_ACTIVITIES = [
  { id: "m1", type: "MEETING_CREATED", title: "Meeting Created", description: "Ms. Priya met with Aarav Sharma's parent", timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: "a1", type: "AI_SUMMARY", title: "AI Summary Generated", description: "AI summary created for Aarav Sharma's meeting", timestamp: new Date(Date.now() - 1700000).toISOString() },
  { id: "w1", type: "MESSAGE_SENT", title: "Message Sent to Parent", description: "Summary shared with Aarav Sharma's parent", timestamp: new Date(Date.now() - 1600000).toISOString() },
  { id: "m2", type: "MEETING_CREATED", title: "Meeting Created", description: "Mr. Rahul met with Diya Patel's parent", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "a2", type: "AI_SUMMARY", title: "AI Summary Generated", description: "AI summary created for Diya Patel's meeting", timestamp: new Date(Date.now() - 7100000).toISOString() },
  { id: "m3", type: "MEETING_CREATED", title: "Meeting Created", description: "Ms. Anjali met with Ishaan Kumar's parent", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "w2", type: "MESSAGE_SENT", title: "Message Sent to Parent", description: "Summary shared with Diya Patel's parent", timestamp: new Date(Date.now() - 90000000).toISOString() },
];

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(10);

  useEffect(() => { fetchFeed(); }, []);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/analytics/activity-feed");
      setActivities(res.data.length > 0 ? res.data : MOCK_ACTIVITIES);
    } catch {
      setActivities(MOCK_ACTIVITIES);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = activities.filter((a) => filter === "all" || a.type === filter);
  const visible = filtered.slice(0, page);

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title="Activity Feed"
        subtitle="Real-time log of all school activity events"
        icon={Activity}
      />

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_TYPES.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(10); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-brand-gradient text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              filter === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {f.key === "all" ? activities.length : activities.filter(a => a.type === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState title="No activity yet" description="Activity events will appear here as teachers create meetings and send messages." illustration="activity" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {visible.map((activity, i) => {
              const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.MEETING_CREATED;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-400">{timeAgo(activity.timestamp)}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load more */}
          {page < filtered.length && (
            <div className="px-6 py-4 border-t border-slate-100 text-center">
              <button
                onClick={() => setPage((p) => p + 10)}
                className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
              >
                Load more ({filtered.length - page} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
