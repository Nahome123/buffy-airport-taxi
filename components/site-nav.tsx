import Link from "next/link";

type SiteNavProps = {
  currentPath: string;
  accentLabel?: string;
};

const navItems = [
  { href: "/", label: "Book Ride" },
  { href: "/admin/login", label: "Admin Login" },
  { href: "/admin", label: "Dispatch Board" },
];

export function SiteNav({ currentPath, accentLabel }: SiteNavProps) {
  return (
    <header className="animate-rise flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="brand-lockup rounded-[1.8rem] border border-white/12 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <div className="brand-mark-ring" />
              <div className="brand-mark-road" />
              <div className="brand-mark-dash brand-mark-dash-top" />
              <div className="brand-mark-dash brand-mark-dash-bottom" />
              <div className="brand-mark-wing brand-mark-wing-top" />
              <div className="brand-mark-wing brand-mark-wing-bottom" />
            </div>
            <div>
              <p className="brand-name text-sm font-semibold uppercase tracking-[0.34em] text-[color:var(--color-gold)]">
                Buffy Airport Taxi
              </p>
              {accentLabel ? (
                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-200/82">
                  {accentLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href === "/admin" && currentPath.startsWith("/admin"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                isActive
                  ? "border border-[color:var(--color-gold)] bg-white/12 text-white"
                  : "border border-white/15 bg-white/6 text-white hover:border-[color:var(--color-gold)] hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
