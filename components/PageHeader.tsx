"use client";
import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  titleClass?: string;
  right?: ReactNode;
};

export default function PageHeader({ title, subtitle, titleClass = "text-slate-200", right }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 border-b border-slate-800/60 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="relative flex items-center justify-center h-14 max-w-lg mx-auto px-4">
        <div className="text-center">
          <h1 className={`text-xl font-light tracking-widest ${titleClass}`}>{title}</h1>
          {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="absolute right-4">{right}</div>}
      </div>
    </header>
  );
}
