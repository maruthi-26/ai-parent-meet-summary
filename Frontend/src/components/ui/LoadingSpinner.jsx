export function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-3 border-orange-200 border-t-orange-500`} />
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-8 w-1/2 rounded" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <div key={i} className="skeleton h-3 w-full rounded" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="skeleton h-4 w-1/4 rounded" />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className={`skeleton h-3 rounded flex-1 ${c === 0 ? "max-w-[120px]" : ""}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto shadow-lg float-animation">
          <span className="text-white text-2xl font-bold">FC</span>
        </div>
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
