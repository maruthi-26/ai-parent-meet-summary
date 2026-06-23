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
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-slate-800">
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
            </p>
            {suffix && <span className="text-lg font-semibold text-slate-500">{suffix}</span>}
          </div>

          {trend && trendValue && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shrink-0 ${trendBg} ${trendColor}`}>
                <TrendIcon size={10} className={trendColor} />
                {badge}
              </span>
              {desc && (
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  {desc}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon size={22} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
