import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportToExcel, exportToPDF, formatDate } from "@/lib/export";
import { FileSpreadsheet, FileText, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/alertas")({
  component: AlertasPage,
});

function AlertasPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<string>("todos");

  useEffect(() => {
    supabase.from("alertas_v" as never).select("*").then(({ data }) => setRows((data as any[]) ?? []));
  }, []);

  const tipos = Array.from(new Set(rows.map((r) => r.tipo)));
  const filtered = rows.filter((r) =>
    (tipo === "todos" || r.tipo === tipo) &&
    (search === "" || (r.descricao + " " + (r.entidade_nome ?? "")).toLowerCase().includes(search.toLowerCase())),
  );

  const exportRows = filtered.map((r) => ({
    Tipo: r.tipo, Severidade: r.severidade, Descrição: r.descricao,
    Entidade: r.entidade_nome, "Vence em": r.vence_em ? formatDate(r.vence_em) : "",
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Alertas Automáticos</h1>
          <p className="text-sm text-muted-foreground">CNH, MOPP, seguros, tacógrafos, tecnologia e advertências.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToExcel("alertas", exportRows)}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToPDF("Alertas", Object.keys(exportRows[0]||{Tipo:""}).map(k=>({header:k,dataKey:k})), exportRows)}>
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." className="pl-9 w-64 bg-surface" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant={tipo === "todos" ? "default" : "outline"} onClick={() => setTipo("todos")}>Todos</Button>
          {tipos.map((t) => (
            <Button key={t} size="sm" variant={tipo === t ? "default" : "outline"} onClick={() => setTipo(t)}>
              {t.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="surface-card divide-y divide-border">
        {filtered.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">Nenhum alerta encontrado.</div>
        )}
        {filtered.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`size-2.5 rounded-full ${a.severidade === "critico" ? "bg-primary" : "bg-secondary"}`} />
              <div>
                <p className="font-medium">{a.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {a.tipo.toUpperCase()} · {a.entidade_nome} · {a.vence_em ? formatDate(a.vence_em) : ""}
                </p>
              </div>
            </div>
            <Badge variant={a.severidade === "critico" ? "destructive" : "secondary"}>{a.severidade}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
