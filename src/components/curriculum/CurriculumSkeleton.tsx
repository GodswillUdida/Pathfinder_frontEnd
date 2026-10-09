// components/curriculum/CurriculumSkeleton.tsx

export function CurriculumSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading curriculum">

      {/* Header skeleton */}
      <div className="flex items-center justify-between h-9">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/[0.07]" />
          <div className="h-4 w-24 rounded-lg bg-gray-100 dark:bg-white/[0.07]" />
          <div className="h-3 w-14 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
        </div>
        <div className="h-7 w-24 rounded-xl bg-gray-100 dark:bg-white/[0.07]" />
      </div>

      {/* Module skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden"
          style={{ opacity: 1 - (i - 1) * 0.2 }}
        >
          {/* Module header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-white/[0.03]">
            {/* Chapter number */}
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/[0.07] shrink-0" />
            {/* Drag handle */}
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-white/[0.05] shrink-0" />
            {/* Title */}
            <div className="flex-1 h-4 rounded-lg bg-gray-100 dark:bg-white/[0.07]" style={{ maxWidth: `${55 + i * 8}%` }} />
            {/* Meta pills */}
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/[0.05]" />
              <div className="h-5 w-12 rounded-full bg-gray-100 dark:bg-white/[0.05]" />
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
            </div>
          </div>

          {/* Topic skeletons (only for first 2 modules) */}
          {i < 3 && (
            <div className="border-t border-gray-100 dark:border-white/[0.04]">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="flex items-center gap-3 pl-12 pr-4 py-2.5 border-b border-gray-50 dark:border-white/[0.03] last:border-0"
                >
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-white/[0.05] shrink-0" />
                  <div className="w-3.5 h-3.5 rounded bg-gray-100 dark:bg-white/[0.05] shrink-0" />
                  <div
                    className="flex-1 h-3.5 rounded-lg bg-gray-100 dark:bg-white/[0.06]"
                    style={{ maxWidth: `${40 + j * 15}%` }}
                  />
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="h-4 w-12 rounded-full bg-gray-100 dark:bg-white/[0.04]" />
                    <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
                    <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
                  </div>
                </div>
              ))}

              {/* Add topic placeholder */}
              <div className="flex items-center gap-2 pl-12 pr-4 py-2.5">
                <div className="h-3.5 w-20 rounded-lg bg-gray-50 dark:bg-white/[0.03]" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}