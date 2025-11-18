import { Suspense } from "react";
import { SuccessContent } from "./SuccessContent";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
    </div>
  );
}

