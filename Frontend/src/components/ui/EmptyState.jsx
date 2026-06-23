import { motion } from "framer-motion";

const ILLUSTRATIONS = {
  meetings: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <rect x="20" y="40" width="160" height="100" rx="12" fill="#FFF4F0" />
      <rect x="40" y="60" width="60" height="8" rx="4" fill="#FFB347" opacity="0.6" />
      <rect x="40" y="76" width="100" height="6" rx="3" fill="#e2e8f0" />
      <rect x="40" y="90" width="80" height="6" rx="3" fill="#e2e8f0" />
      <circle cx="155" cy="55" r="20" fill="#FF6B35" opacity="0.15" />
      <circle cx="155" cy="55" r="12" fill="#FF6B35" opacity="0.3" />
      <path d="M149 55l4 4 8-8" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <circle cx="100" cy="60" r="28" fill="#FFF4F0" />
      <circle cx="100" cy="50" r="14" fill="#FFB347" opacity="0.5" />
      <path d="M70 90c0-16.6 13.4-30 30-30s30 13.4 30 30" fill="#FF6B35" opacity="0.15" />
      <rect x="30" y="110" width="140" height="8" rx="4" fill="#e2e8f0" />
      <rect x="55" y="126" width="90" height="6" rx="3" fill="#e2e8f0" />
    </svg>
  ),
  notices: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <rect x="30" y="20" width="140" height="110" rx="12" fill="#FFF4F0" />
      <rect x="50" y="45" width="100" height="8" rx="4" fill="#FF6B35" opacity="0.4" />
      <rect x="50" y="62" width="100" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="50" y="74" width="80" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="50" y="86" width="90" height="5" rx="2.5" fill="#e2e8f0" />
      <circle cx="165" cy="35" r="15" fill="#4ECDC4" opacity="0.2" />
      <path d="M158 35l4 4 8-8" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <circle cx="40" cy="50" r="10" fill="#FF6B35" opacity="0.3" />
      <circle cx="40" cy="90" r="10" fill="#4ECDC4" opacity="0.3" />
      <circle cx="40" cy="130" r="10" fill="#FFB347" opacity="0.3" />
      <line x1="40" y1="60" x2="40" y2="80" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="40" y1="100" x2="40" y2="120" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 2" />
      <rect x="60" y="43" width="110" height="14" rx="7" fill="#e2e8f0" />
      <rect x="60" y="83" width="90" height="14" rx="7" fill="#e2e8f0" />
      <rect x="60" y="123" width="100" height="14" rx="7" fill="#e2e8f0" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <circle cx="100" cy="70" r="40" fill="#FFF4F0" />
      <path d="M85 70l10 10 20-20" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="30" y="120" width="140" height="8" rx="4" fill="#e2e8f0" />
      <rect x="55" y="136" width="90" height="6" rx="3" fill="#e2e8f0" />
    </svg>
  ),
};

export default function EmptyState({
  title = "Nothing here yet",
  description = "Get started by creating your first item.",
  action,
  illustration = "default",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {ILLUSTRATIONS[illustration] || ILLUSTRATIONS.default}
      </motion.div>

      <h3 className="mt-5 text-lg font-bold text-slate-700">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-xs">{description}</p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </motion.div>
  );
}
