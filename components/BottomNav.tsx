"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "心の土壌",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" />
        <path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7z" fill="currentColor" stroke="none" opacity="0.4" />
        <path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7z" />
        <path d="M12 16c0 0-3-1.5-5-4" />
        <path d="M12 14c0 0 3-1.5 5-4" />
      </svg>
    ),
  },
  {
    href: "/seeds",
    label: "強み",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12"   cy="7.5"  r="4.2" />
        <circle cx="16.3" cy="10.6" r="4.2" />
        <circle cx="14.6" cy="15.6" r="4.2" />
        <circle cx="9.4"  cy="15.6" r="4.2" />
        <circle cx="7.7"  cy="10.6" r="4.2" />
        <circle cx="12"   cy="12"   r="3.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/treasures",
    label: "価値観",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <line x1="2" y1="9" x2="22" y2="9" />
        <polyline points="6 3 12 9 18 3" />
      </svg>
    ),
  },
  {
    href: "/report",
    label: "レポート",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
        <line x1="2"  y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "設定",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const SHOW_ON = new Set(["/", "/seeds", "/treasures", "/report", "/settings"]);

export default function BottomNav() {
  const pathname = usePathname();
  if (!SHOW_ON.has(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 border-t border-slate-800 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-3 flex-1 transition-colors ${
                active
                  ? "text-emerald-400"
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              {icon}
              <span className="text-[10px] tracking-wide leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
