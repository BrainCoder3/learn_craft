// app/loading.tsx
/**
 * Global loading skeleton
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 h-12 w-1/3 animate-pulse rounded-lg bg-gray-200" />

        {/* Content skeletons */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="h-40 w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="h-6 w-2/3 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-4/5 animate-pulse rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
