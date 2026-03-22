// app/checkout/success/loading.tsx
// This file is the Next.js route-segment loading UI.
// It renders instantly while the page JS chunk is being fetched —
// before any client-side code runs. Keep it dependency-free and static.

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Pure CSS spinner — no JS dependency */}
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xl font-medium text-slate-700">
          Verifying payment &amp; signing you in…
        </p>
        <p className="text-sm text-slate-400">
          Do not close this tab.
        </p>
      </div>
    </div>
  );
}