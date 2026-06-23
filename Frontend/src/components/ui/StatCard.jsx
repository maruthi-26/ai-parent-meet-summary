import { motion } from "framer-motion";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const parseTrendValue = (val) => {
  if (!val) return { badge: "", desc: "" };
  
  // 1. Matches "100% increase compared to last month" or similar
  const matchPercent = val.match(/^(\d+(?:%|\.\d+%)?\s+\w+)\s+(.*)$/i);
  if (matchPercent) {
    return { badge: matchPercent[1], desc: matchPercent[2] };
  }
  
  // 2. Matches "1 active educators" -> badge: "1 active", desc: "educators"
  const matchActive = val.match(/^(\d+\s+active)\s+(.*)$/i);
  if (matchActive) {
    return { badge: matchActive[1], desc: matchActive[2] };
  }

  // 3. Matches "1 actions pending" -> badge: "1 pending", desc: "actions"
  const matchPending = val.match(/^(\d+)\s+actions\s+pending$/i);
  if (matchPending) {
    return { badge: `${matchPending[1]} pending`, desc: "actions" };
  }

  // 4. Matches "1 pending" / "2 actions"
  const matchGenericNum = val.match(/^(\d+\s+\w+)\s*(.*)$/);
  if (matchGenericNum) {
    return { badge: matchGenericNum[1], desc: matchGenericNum[2] || "" };
  }
  
  // 5. Special case for No urgent actions
  if (val.toLowerCase().includes("no urgent actions")) {
    return { badge: "None", desc: "urgent actions" };
  }

  return { badge: val, desc: "" };
};

export default function StatCard({
  title,
  value = 0,
  icon: Icon,
  gradient = "bg-brand-gradient",
  trend,
  trendValue,
  suffix = "",
  delay = 0,
  onClick,
}) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400";
  const trendBg =
    trend === "up" ? "bg-emerald-50" : trend === "down" ? "bg-red-50" : "bg-slate-50";

  const CountUpComponent = typeof CountUp === "function" 
    ? CountUp 
    : (CountUp && typeof CountUp.default === "function" 
        ? CountUp.default 
        : (CountUp && typeof CountUp.CountUp === "function" 
            ? CountUp.CountUp 
            : null));

  const { badge, desc } = parseTrendValue(trendValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 card-hover flex flex-col justify-between h-full ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon size={16} className="text-white" />
          </div>
        )}
      </div>

      <div className="space-y-1 sm:space-y-1.5 mt-auto">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {CountUpComponent ? (
              <CountUpComponent
                end={typeof value === "number" ? value : 0}
                duration={1.5}
                delay={delay + 0.2}
                separator=","
              />
            ) : (
              typeof value === "number" ? value : 0
            )}
          </span>
          {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
        </div>

        {trend && trendValue && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold whitespace-nowrap shrink-0 ${trendBg} ${trendColor}`}>
              <TrendIcon size={9} className={trendColor} />
              {badge}
            </span>
            {desc && (
              <span className="text-[9px] text-slate-400 font-medium leading-none truncate max-w-[100px] sm:max-w-none">
                {desc}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
