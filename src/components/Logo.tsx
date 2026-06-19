import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/monfredini-logo.png.asset.json";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 group select-none">
      <img
        src={logoAsset.url}
        alt="Monfredini Transportes"
        className="h-10 w-10 rounded-full object-cover shadow-[var(--shadow-elegant)]"
      />
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
