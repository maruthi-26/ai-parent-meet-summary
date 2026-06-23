import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  MessageCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Bell,
  Calendar,
} from "lucide-react";
import api from "../../services/api";

const SECTION_CONFIG = {
  followUps: {
    key: "pendingFollowUps",
    label: "Pending Follow-Ups",
    icon: AlertTriangle,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
    badgeColor: "bg-rose-100 text-rose-700",
    dotColor: "bg-rose-500",
    emptyText: "No pending follow-ups",
  },
  feedback: {
    key: "feedbackAwaiting",
    label: "Awaiting Parent Feedback",
    icon: MessageCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    badgeColor: "bg-amber-100 text-amber-700",
    dotColor: "bg-amber-500",
    emptyText: "All feedback collected",
  },
  upcoming: {
    key: "upcomingMeetings",
    label: "Upcoming Scheduled Meetings",
    icon: Calendar,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    badgeColor: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-400",
    emptyText: "No upcoming meetings scheduled",
  },
};

function ReminderItem({ meeting, navigate }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
      onClick={() => navigate(`/meetings/${meeting.id}`)}
    >
      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 text-xs font-bold">
        {meeting.student?.name?.[0]?.toUpperCase() || "S"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">
          {meeting.student?.name}
        </p>
        <p className="text-[10px] text-slate-400 truncate">
          {meeting.student?.className}
          {meeting.teacher?.name && ` · ${meeting.teacher.name}`}
        </p>
      </div>
      <div className="flex items-center gap-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-semibold">Open</span>
        <ChevronRight size={11} />
      </div>
    </div>
  );
}

function ReminderSection({ config, items, navigate }) {
  const Icon = config.icon;
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`rounded-2xl border ${config.borderColor} ${config.bgColor}/30 overflow-hidden`}>
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-white/50`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center`}>
            <Icon size={14} className={config.color} />
          </div>
          <span className="text-xs font-bold text-slate-700">{config.label}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.badgeColor}`}>
            {items.length}
          </span>
        </div>
        <ChevronRight
          size={14}
          className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-0.5">
              {items.length === 0 ? (
                <div className="flex items-center gap-2 py-3 px-2 text-xs text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  {config.emptyText}
                </div>
              ) : (
                items.slice(0, 5).map((m) => (
                  <ReminderItem key={m.id} meeting={m} navigate={navigate} />
                ))
              )}
              {items.length > 5 && (
                <p className="text-[10px] text-slate-400 text-center pt-1">
                  +{items.length - 5} more
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RemindersPanel() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReminders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await api.get("/analytics/reminders");
      setReminders(res.data);
    } catch (err) {
      console.error("Failed to load reminders:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const totalActions = reminders?.summary?.totalActionsRequired || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell size={18} className="text-orange-500" />
            {totalActions > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none">
                {totalActions > 9 ? "9+" : totalActions}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-800">Reminders & Follow-Ups</h2>
        </div>
        <button
          onClick={() => fetchReminders(true)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all ${
            isRefreshing ? "animate-spin text-orange-500" : ""
          }`}
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <ReminderSection
            config={SECTION_CONFIG.followUps}
            items={reminders?.pendingFollowUps || []}
            navigate={navigate}
          />
          <ReminderSection
            config={SECTION_CONFIG.feedback}
            items={reminders?.feedbackAwaiting || []}
            navigate={navigate}
          />
          <ReminderSection
            config={SECTION_CONFIG.upcoming}
            items={reminders?.upcomingMeetings || []}
            navigate={navigate}
          />
        </div>
      )}

      {!isLoading && totalActions > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 bg-rose-50/40 border border-rose-100 rounded-xl px-3 py-2.5">
            <Clock size={13} className="text-rose-500 flex-shrink-0" />
            <span className="text-[11px] text-rose-700 font-semibold">
              {totalActions} action{totalActions !== 1 ? "s" : ""} require your immediate attention
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
