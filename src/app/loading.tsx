function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 pb-12 pt-28 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-4">
          <ShimmerBlock className="h-14 w-14 flex-none rounded-2xl" />
          <div className="w-full max-w-md space-y-3">
            <ShimmerBlock className="h-4 w-40 rounded-full" />
            <ShimmerBlock className="h-8 w-full rounded-full" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-4">
            <ShimmerBlock className="h-14 w-full max-w-xl" />
            <ShimmerBlock className="h-5 w-full max-w-lg rounded-full" />
            <ShimmerBlock className="h-5 w-3/4 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ShimmerBlock className="h-24 rounded-3xl" />
            <ShimmerBlock className="h-24 rounded-3xl" />
            <ShimmerBlock className="h-24 rounded-3xl" />
          </div>
        </div>

        <ShimmerBlock className="mt-8 h-16 rounded-[1.75rem]" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-start gap-4">
                <ShimmerBlock className="h-16 w-16 flex-none rounded-full" />
                <div className="min-w-0 flex-1 space-y-3">
                  <ShimmerBlock className="h-4 w-24 rounded-full" />
                  <ShimmerBlock className="h-7 w-full rounded-full" />
                  <ShimmerBlock className="h-4 w-32 rounded-full" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <ShimmerBlock className="h-4 w-full rounded-full" />
                <ShimmerBlock className="h-4 w-5/6 rounded-full" />
                <ShimmerBlock className="h-4 w-2/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
