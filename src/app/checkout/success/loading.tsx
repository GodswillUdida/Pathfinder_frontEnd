// app/checkout/success/loading.tsx
export default function Loading() {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-6 text-xl font-medium">Verifying payment &amp; signing you in...</p>
        </div>
      </div>
    );
  }