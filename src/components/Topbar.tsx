import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/export";

interface AlertaRow {
  id: string;
  tipo: string;
  entidade_tipo: string;
  entidade_id: string;
  entidade_nome: string;
  vence_em: string;
  severidade: string;
  descricao: string;
}

export function Topbar() {
  const [alertas, setAlertas] = useState<AlertaRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("alertas_v" as never).select("*").limit(50);
      setAlertas((data as AlertaRow[]) ?? []);
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const criticos = alertas.filter((a) => a.severidade === "critico").length;

  return (
    <header className="h-16 shrink-0 border-b border-border bg-surface/60 backdrop-blur supports-[backdrop-filter]:bg-surface/40 flex items-center justify-between px-6">
      <div className="text-sm text-muted-foreground">
        <span className="text-secondary font-medium">Painel Operacional</span>
        <span className="mx-2">/</span>
        <span>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {alertas.length > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 size-4 rounded-full text-[10px] font-bold grid place-items-center ${criticos > 0 ? "bg-primary text-white" : "bg-secondary text-black"}`}>
                  {alertas.length > 9 ? "9+" : alertas.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0 max-h-[70vh] overflow-y-auto">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold">Alertas</h3>
              <Link to="/alertas" className="text-xs text-primary hover:underline">Ver todos</Link>
            </div>
            <ul className="divide-y divide-border">
              {alertas.length === 0 && (
                <li className="p-6 text-sm text-muted-foreground text-center">Nenhum alerta no momento.</li>
              )}
              {alertas.slice(0, 10).map((a) => (
                <li key={a.id} className="p-3 hover:bg-surface-2/50">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">{a.descricao}</p>
                    <Badge variant={a.severidade === "critico" ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                      {a.severidade}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.tipo.toUpperCase()} · {a.vence_em ? formatDate(a.vence_em) : ""}
                  </p>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
