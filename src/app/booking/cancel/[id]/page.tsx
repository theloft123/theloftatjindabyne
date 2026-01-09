import { Suspense } from "react";
import { CancelBookingContent } from "./CancelBookingContent";

export default function CancelBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <CancelBookingContent params={params} />
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
