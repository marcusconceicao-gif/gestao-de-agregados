import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { Truck, Users, Layers, Wrench, AlertTriangle, ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/export";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

const CHART_COLORS = ["#D90429", "#C0C0C0", "#22c55e", "#eab308", "#8b5cf6"];

function KpiCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint?: string }) {
  return (
    <div className="surface-card p-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-semibold mt-1">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <div className="size-10 rounded-md brand-gradient grid place-items-center text-white">
        <Icon className="size-5" />
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({ cavalos: 0, motoristas: 0, conjuntos: 0, manutMes: 0, alertas: 0, sinistros: 0 });
  const [manutMes, setManutMes] = useState<{ mes: string; total: number; custo: number }[]>([]);
  const [tecDist, setTecDist] = useState<{ name: string; value: number }[]>([]);
  const [advRank, setAdvRank] = useState<{ nome: string; total: number }[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [sinistros12, setSinistros12] = useState<{ mes: string; total: number; custo: number }[]>([]);
  const [carretasNovas, setCarretasNovas] = useState<{ mes: string; total: number }[]>([]);
  const [carretasNovasKpi, setCarretasNovasKpi] = useState({ total: 0, mes: 0, ativas: 0 });

  useEffect(() => {
    (async () => {
      const [cv, mt, cj, mn, al, sn, tc, adv, cn] = await Promise.all([
        supabase.from("cavalos").select("id, placa", { count: "exact" }),
        supabase.from("motoristas").select("id", { count: "exact" }).eq("status", "ativo"),
        supabase.from("conjuntos").select("id", { count: "exact" }).eq("ativo", true),
        supabase.from("manutencoes").select("id, data, custo, carreta_id"),
        supabase.from("alertas_v" as never).select("*"),
        supabase.from("acidentes_sinistros").select("id, data, custo"),
        supabase.from("tecnologias").select("tipo"),
        supabase.from("advertencias").select("motorista_id, motoristas(nome)").eq("ativa", true),
        supabase.from("carretas").select("id, placa, status, created_at, condicao" as never).eq("condicao" as never, "nova" as never),
      ]);

      const today = new Date();
      const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const curYm = ym(today);

      const manuts = (mn.data ?? []) as any[];
      const manutsThisMonth = manuts.filter((m) => m.data?.startsWith(curYm)).length;

      setKpis({
        cavalos: cv.count ?? 0,
        motoristas: mt.count ?? 0,
        conjuntos: cj.count ?? 0,
        manutMes: manutsThisMonth,
        alertas: (al.data ?? []).length,
        sinistros: (sn.data ?? []).length,
      });

      // Manutenções por mês (últimos 6)
      const meses: { mes: string; key: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        meses.push({ mes: d.toLocaleDateString("pt-BR", { month: "short" }), key: ym(d) });
      }
      setManutMes(meses.map((m) => {
        const list = manuts.filter((x) => x.data?.startsWith(m.key));
        return { mes: m.mes, total: list.length, custo: list.reduce((a, b) => a + (Number(b.custo) || 0), 0) };
      }));

      // Liberação de carretas novas (últimos 6 meses)
      const carretasNovasList = ((cn as any).data ?? []) as any[];
      setCarretasNovasKpi({
        total: carretasNovasList.length,
        mes: carretasNovasList.filter((c) => (c.created_at ?? "").slice(0,7) === curYm).length,
        ativas: carretasNovasList.filter((c) => c.status === "ativa").length,
      });
      setCarretasNovas(meses.map((m) => ({
        mes: m.mes,
        total: carretasNovasList.filter((c) => (c.created_at ?? "").slice(0,7) === m.key).length,
      })));

      // Distribuição tecnologias
      const tecCounts: Record<string, number> = {};
      (tc.data ?? []).forEach((t: any) => { tecCounts[t.tipo] = (tecCounts[t.tipo] ?? 0) + 1; });
      setTecDist(Object.entries(tecCounts).map(([name, value]) => ({ name: name.toUpperCase(), value })));

      // Advertências por motorista (top)
      const advMap: Record<string, { nome: string; total: number }> = {};
      (adv.data ?? []).forEach((a: any) => {
        const nome = a.motoristas?.nome ?? "—";
        advMap[nome] = { nome, total: (advMap[nome]?.total ?? 0) + 1 };
      });
      setAdvRank(Object.values(advMap).sort((a, b) => b.total - a.total).slice(0, 8));

      // Sinistros 12 meses
      const meses12: { mes: string; key: string }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        meses12.push({ mes: d.toLocaleDateString("pt-BR", { month: "short" }), key: ym(d) });
      }
      const sinList = (sn.data ?? []) as any[];
      setSinistros12(meses12.map((m) => {
        const list = sinList.filter((x) => x.data?.startsWith(m.key));
        return { mes: m.mes, total: list.length, custo: list.reduce((a, b) => a + (Number(b.custo) || 0), 0) };
      }));

      setAlertas((al.data ?? []).slice(0, 6));
    })();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground">Visão consolidada da operação Monfredini.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={Truck} label="Cavalos" value={kpis.cavalos} />
        <KpiCard icon={Users} label="Motoristas Ativos" value={kpis.motoristas} />
        <KpiCard icon={Layers} label="Conjuntos" value={kpis.conjuntos} />
        <KpiCard icon={Wrench} label="Manutenções/mês" value={kpis.manutMes} />
        <KpiCard icon={AlertTriangle} label="Alertas Abertos" value={kpis.alertas} />
        <KpiCard icon={ShieldAlert} label="Sinistros (total)" value={kpis.sinistros} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card p-4 lg:col-span-2">
          <h3 className="font-display font-semibold mb-2">Manutenções por mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={manutMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="mes" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8 }} />
                <Bar dataKey="total" fill="#D90429" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-4">
          <h3 className="font-display font-semibold mb-2">Tecnologias Embarcadas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tecDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {tecDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card p-4">
          <div className="flex items-start justify-between mb-2 gap-3">
            <div>
              <h3 className="font-display font-semibold">Liberação de carreta nova</h3>
              <p className="text-xs text-muted-foreground">Carretas zero-km liberadas para operação</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-primary leading-none">{carretasNovasKpi.total}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">total</p>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px]">Este mês: {carretasNovasKpi.mes}</Badge>
            <Badge variant="outline" className="text-[10px]">Ativas: {carretasNovasKpi.ativas}</Badge>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carretasNovas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="mes" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8 }} />
                <Bar dataKey="total" fill="#D90429" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-4">
          <h3 className="font-display font-semibold mb-2">Advertências por motorista</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advRank} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#888" fontSize={11} />
                <YAxis dataKey="nome" type="category" stroke="#888" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8 }} />
                <Bar dataKey="total" fill="#D90429" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-4">
          <h3 className="font-display font-semibold mb-2">Sinistros (12 meses)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sinistros12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="mes" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8 }} />
                <Line type="monotone" dataKey="total" stroke="#D90429" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Alertas Críticos</h3>
          <button onClick={() => navigate({ to: "/alertas" })} className="text-xs text-primary hover:underline">Ver todos</button>
        </div>
        {alertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem alertas no momento.</p>
        ) : (
          <ul className="divide-y divide-border">
            {alertas.map((a) => (
              <li key={a.id} className="py-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{a.descricao}</p>
                  <p className="text-xs text-muted-foreground">{a.tipo.toUpperCase()} · {a.vence_em ? formatDate(a.vence_em) : ""}</p>
                </div>
                <Badge variant={a.severidade === "critico" ? "destructive" : "secondary"}>{a.severidade}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
