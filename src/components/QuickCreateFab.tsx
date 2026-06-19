import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FAB_QUICK_ITEMS } from "@/lib/resources";
import { useAuth } from "@/hooks/useAuth";

export function QuickCreateFab() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const [open, setOpen] = useState(false);
  if (!canWrite) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 px-5 rounded-full brand-gradient text-white shadow-[var(--shadow-elegant)] hover:scale-[1.02] transition"
        >
          <Plus className="size-5" />
          <span className="font-semibold">Novo Cadastro</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-64 p-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">Criar rapidamente</div>
        <div className="grid grid-cols-1 gap-0.5">
          {FAB_QUICK_ITEMS.map((it, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpen(false);
                navigate({ to: `/${it.key}`, search: { create: 1 } as never });
              }}
              className="text-left px-2 py-1.5 rounded text-sm hover:bg-surface-2 transition"
            >
              {it.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
