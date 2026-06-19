import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { exportToExcel, exportToPDF, formatMoney } from "@/lib/export";
import { FileSpreadsheet, FileText } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: Relatorios,
});

function Relatorios() {
  const [resumo, setResumo] = useState<any[]>([]);
  const [custos, setCustos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [emp, mt, cv, car, cj, sg, mn, ad, ac, tc] = await Promise.all([
        supabase.from("empresas").select("id", { count: "exact", head: true }),
        supabase.from("motoristas").select("id", { count: "exact", head: true }),
        supabase.from("cavalos").select("id", { count: "exact", head: true }),
        supabase.from("carretas").select("id", { count: "exact", head: true }),
        supabase.from("conjuntos").select("id", { count: "exact", head: true }),
        supabase.from("seguros").select("id", { count: "exact", head: true }),
        supabase.from("manutencoes").select("custo, data"),
        supabase.from("advertencias").select("id", { count: "exact", head: true }),
        supabase.from("acidentes_sinistros").select("custo"),
        supabase.from("tecnologias").select("id", { count: "exact", head: true }),
      ]);

      setResumo([
        { Indicador: "Empresas", Total: emp.count ?? 0 },
        { Indicador: "Motoristas", Total: mt.count ?? 0 },
        { Indicador: "Cavalos", Total: cv.count ?? 0 },
        { Indicador: "Carretas", Total: car.count ?? 0 },
        { Indicador: "Conjuntos", Total: cj.count ?? 0 },
        { Indicador: "Seguros", Total: sg.count ?? 0 },
        { Indicador: "Tecnologias", Total: tc.count ?? 0 },
        { Indicador: "Advertências", Total: ad.count ?? 0 },
        { Indicador: "Custo total manutenções", Total: formatMoney((mn.data ?? []).reduce((a: number, b: any) => a + (Number(b.custo) || 0), 0)) },
        { Indicador: "Custo total sinistros", Total: formatMoney((ac.data ?? []).reduce((a: number, b: any) => a + (Number(b.custo) || 0), 0)) },
      ]);

      // Custos manutenção últimos 6 meses
      const today = new Date();
      const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const buckets: { mes: string; key: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        buckets.push({ mes: d.toLocaleDateString("pt-BR",{month:"short"}), key: ym(d) });
      }
      const manuts = (mn.data ?? []) as any[];
      setCustos(buckets.map((b) => ({
        mes: b.mes,
        custo: manuts.filter((m) => m.data?.startsWith(b.key)).reduce((a, b) => a + (Number(b.custo) || 0), 0),
      })));
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Relatórios Gerenciais</h1>
          <p className="text-sm text-muted-foreground">Visão consolidada e exportação para Excel e PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToExcel("relatorio_gerencial", resumo)}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToPDF("Relatório Gerencial", [{header:"Indicador",dataKey:"Indicador"},{header:"Total",dataKey:"Total"}], resumo)}>
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="surface-card p-4">
        <h3 className="font-display font-semibold mb-3">Resumo Operacional</h3>
        <table className="w-full text-sm">
          <thead className="text-secondary">
            <tr><th className="text-left py-2">Indicador</th><th className="text-right py-2">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {resumo.map((r) => (
              <tr key={r.Indicador}><td className="py-2">{r.Indicador}</td><td className="py-2 text-right font-medium">{r.Total}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="surface-card p-4">
        <h3 className="font-display font-semibold mb-3">Custo de manutenção (6 meses)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={custos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="mes" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8 }} />
              <Bar dataKey="custo" fill="#D90429" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
