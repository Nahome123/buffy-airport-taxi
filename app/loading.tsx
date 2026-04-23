export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <div className="h-16 animate-pulse rounded-3xl bg-white/10" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[33rem] animate-pulse rounded-[2.25rem] bg-white/10" />
        <div className="h-[44rem] animate-pulse rounded-[2.25rem] bg-white/10" />
      </div>
    </main>
  );
}
