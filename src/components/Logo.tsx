import { Link } from "@tanstack/react-router";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group select-none">
      <div className="relative h-9 w-9 rounded-md brand-gradient grid place-items-center shadow-[var(--shadow-elegant)]">
        <span className="font-display text-white font-bold text-lg leading-none">M</span>
        <span className="absolute -bottom-1 left-1 right-1 h-[2px] bg-secondary/70 rounded-full" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-secondary">
            MONFREDINI
          </span>
          <span className="font-display text-[11px] font-bold tracking-[0.4em] text-primary -mt-0.5">
            HUB
          </span>
        </div>
      )}
    </Link>
  );
}
