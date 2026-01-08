import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-4 pb-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
