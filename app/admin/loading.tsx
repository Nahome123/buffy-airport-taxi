export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10">
      <div className="buffalo-card rounded-[2.25rem] border border-white/10 p-8">
        <div className="h-8 w-64 animate-pulse rounded-full bg-white/10" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[1.8rem] bg-white/10"
            />
          ))}
        </div>
        <div className="mt-8 h-96 animate-pulse rounded-[1.9rem] bg-white/10" />
      </div>
    </main>
  );
}
