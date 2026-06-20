import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ClipboardCheck, History, LayoutDashboard, Plus, Save, FileDown, Eraser,
  Search, User as UserIcon, Users, Calendar as CalendarIcon, CheckCircle2, Clock,
  Truck, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { friendlyDbError } from "@/lib/db-errors";
import logoAsset from "@/assets/monfredini-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/integracoes")({
  component: IntegracoesPage,
});

type ChecklistKey =
  | "checklist_visual"
  | "checklist_rastreador"
  | "documentacao_carreta"
  | "kit"
  | "datapar"
  | "email"
  | "planilha_status"
  | "motorista_programacao";

const CHECKLIST_ITEMS: { key: ChecklistKey; label: string }[] = [
  { key: "checklist_visual", label: "Checklist Visual" },
  { key: "checklist_rastreador", label: "Checklist Rastreador" },
  { key: "documentacao_carreta", label: "Documentação da Carreta" },
  { key: "kit", label: "Kit (Vassoura + Corda + Cadeado)" },
  { key: "datapar", label: "Datapar (Engate – Desengate)" },
  { key: "email", label: "E-mail" },
  { key: "planilha_status", label: "Planilha de Status" },
  { key: "motorista_programacao", label: "Motorista / Programação" },
];

interface FormState {
  id?: string;
  data: string;
  nome_motorista: string;
  contato: string;
  placa_cavalo: string;
  placa_carreta: string;
  observacoes: string;
  responsavel: string;
  assinatura: string | null;
  checks: Record<ChecklistKey, boolean>;
  obs: Record<ChecklistKey, string>;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): FormState => ({
  data: todayISO(),
  nome_motorista: "",
  contato: "",
  placa_cavalo: "",
  placa_carreta: "",
  observacoes: "",
  responsavel: "",
  assinatura: null,
  checks: Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.key, false])) as Record<ChecklistKey, boolean>,
  obs: Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.key, ""])) as Record<ChecklistKey, string>,
});

function rowToForm(row: any): FormState {
  return {
    id: row.id,
    data: row.data ?? todayISO(),
    nome_motorista: row.nome_motorista ?? "",
    contato: row.contato ?? "",
    placa_cavalo: row.placa_cavalo ?? "",
    placa_carreta: row.placa_carreta ?? "",
    observacoes: row.observacoes ?? "",
    responsavel: row.responsavel ?? "",
    assinatura: row.assinatura ?? null,
    checks: Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.key, !!row[i.key]])) as Record<ChecklistKey, boolean>,
    obs: Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.key, row[`${i.key}_obs`] ?? ""])) as Record<ChecklistKey, string>,
  };
}

function statusFromChecks(checks: Record<ChecklistKey, boolean>) {
  return Object.values(checks).every(Boolean) ? "concluido" : "pendente";
}

function IntegracoesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("novo");
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterPlate, setFilterPlate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [driverTab, setDriverTab] = useState<string>("");
  const signatureRef = useRef<SignaturePadHandle>(null);

  const fetchList = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("integracoes" as never)
      .select("*")
      .order("data", { ascending: false })
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(friendlyDbError(error));
      return;
    }
    setList((data ?? []) as any[]);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filtered = useMemo(() => {
    return list.filter((r) => {
      if (filterName && !(r.nome_motorista ?? "").toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterPlate) {
        const p = filterPlate.toLowerCase();
        if (
          !(r.placa_cavalo ?? "").toLowerCase().includes(p) &&
          !(r.placa_carreta ?? "").toLowerCase().includes(p)
        )
          return false;
      }
      if (filterDate && r.data !== filterDate) return false;
      return true;
    });
  }, [list, filterName, filterPlate, filterDate]);

  const kpis = useMemo(() => {
    const t = todayISO();
    const ym = t.slice(0, 7);
    const hoje = list.filter((r) => r.data === t).length;
    const mes = list.filter((r) => (r.data ?? "").startsWith(ym)).length;
    const concl = list.filter((r) => r.status === "concluido").length;
    const pend = list.filter((r) => r.status !== "concluido").length;
    return { hoje, mes, concl, pend };
  }, [list]);

  const driverGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const r of list) {
      const nome = (r.nome_motorista ?? "").trim() || "Sem nome";
      if (!map.has(nome)) map.set(nome, []);
      map.get(nome)!.push(r);
    }
    return Array.from(map.entries())
      .map(([nome, items]) => ({ nome, items }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [list]);

  useEffect(() => {
    if (driverGroups.length === 0) {
      setDriverTab("");
      return;
    }
    if (!driverGroups.find((g) => g.nome === driverTab)) {
      setDriverTab(driverGroups[0].nome);
    }
  }, [driverGroups, driverTab]);

  const novoCadastro = () => {
    setForm(emptyForm());
    signatureRef.current?.clear();
    setTab("novo");
  };

  const limparCampos = () => {
    novoCadastro();
    toast.success("Campos limpos.");
  };

  const salvar = async () => {
    if (!form.nome_motorista.trim()) {
      toast.error("Informe o nome do motorista.");
      return;
    }
    setSaving(true);
    const payload: any = {
      data: form.data,
      nome_motorista: form.nome_motorista.trim(),
      contato: form.contato || null,
      placa_cavalo: form.placa_cavalo || null,
      placa_carreta: form.placa_carreta || null,
      observacoes: form.observacoes || null,
      responsavel: form.responsavel || null,
      assinatura: form.assinatura,
      status: statusFromChecks(form.checks),
    };
    for (const it of CHECKLIST_ITEMS) {
      payload[it.key] = form.checks[it.key];
      payload[`${it.key}_obs`] = form.obs[it.key] || null;
    }
    if (!form.id) payload.created_by = user?.id ?? null;

    const table = supabase.from("integracoes" as never) as any;
    const q = form.id ? table.update(payload).eq("id", form.id) : table.insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) {
      toast.error(friendlyDbError(error));
      return;
    }
    toast.success(form.id ? "Integração atualizada." : "Integração salva.");
    fetchList();
    if (!form.id) novoCadastro();
  };

  const editar = (row: any) => {
    setForm(rowToForm(row));
    setTab("novo");
  };

  const gerarPDF = (src?: FormState) => {
    const f = src ?? form;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(17, 17, 17);
    doc.rect(0, 0, w, 28, "F");
    try {
      doc.addImage(logoAsset.url, "PNG", 10, 4, 20, 20);
    } catch { /* ignore */ }
    doc.setTextColor(214, 0, 0);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("CHECKLIST DE INTEGRAÇÃO", 36, 13);
    doc.setTextColor(192, 192, 192);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Monfredini Transportes — Controle Interno de Integração de Motoristas", 36, 19);
    doc.setFontSize(8);
    doc.text(`Data: ${new Date(f.data + "T00:00:00").toLocaleDateString("pt-BR")}`, w - 14, 13, { align: "right" });

    let y = 36;
    doc.setTextColor(17, 17, 17);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Dados do Motorista", 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [245, 245, 245], textColor: 17 },
      body: [
        ["Nome", f.nome_motorista || "—", "Contato", f.contato || "—"],
        ["Placa Cavalo", f.placa_cavalo || "—", "Placa Carreta", f.placa_carreta || "—"],
      ],
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 30 }, 2: { fontStyle: "bold", cellWidth: 30 } },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Checklist", 14, y);
    autoTable(doc, {
      startY: y + 2,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [214, 0, 0], textColor: 255 },
      head: [["Item", "Status", "Observação"]],
      body: CHECKLIST_ITEMS.map((it) => [
        it.label,
        f.checks[it.key] ? "OK" : "Pendente",
        f.obs[it.key] || "",
      ]),
      columnStyles: { 1: { cellWidth: 25, halign: "center" } },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "bold");
    doc.text("Observações Gerais", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const obsLines = doc.splitTextToSize(f.observacoes || "—", w - 28);
    doc.text(obsLines, 14, y + 6);
    y += 6 + obsLines.length * 4 + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Responsável pela Integração", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(f.responsavel || "—", 14, y);
    y += 4;
    if (f.assinatura) {
      try {
        doc.addImage(f.assinatura, "PNG", 14, y, 70, 25);
      } catch { /* ignore */ }
      y += 26;
    }
    doc.line(14, y + 2, 90, y + 2);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Assinatura", 14, y + 6);

    // Footer
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(17, 17, 17);
    doc.rect(0, ph - 14, w, 14, "F");
    doc.setTextColor(192, 192, 192);
    doc.setFontSize(8);
    doc.text("Monfredini Transportes", 14, ph - 5);
    doc.text("Gestão de Agregados", w - 14, ph - 5, { align: "right" });

    doc.save(`checklist_integracao_${(f.nome_motorista || "motorista").replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl brand-gradient text-white">
            <ClipboardCheck className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl sm:text-3xl font-semibold">
              Checklist de Integração
            </h1>
            <p className="text-sm text-muted-foreground">
              Controle Interno de Integração de Motoristas
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          <div className="flex items-center gap-2 justify-end">
            <CalendarIcon className="size-3.5" />
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </div>
          {user?.email && (
            <div className="flex items-center gap-2 justify-end mt-1">
              <UserIcon className="size-3.5" /> {user.email}
            </div>
          )}
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="novo"><ClipboardCheck className="size-4 mr-1.5" /> Nova Integração</TabsTrigger>
          <TabsTrigger value="motoristas"><Users className="size-4 mr-1.5" /> Motoristas</TabsTrigger>
          <TabsTrigger value="historico"><History className="size-4 mr-1.5" /> Histórico</TabsTrigger>
          <TabsTrigger value="dashboard"><LayoutDashboard className="size-4 mr-1.5" /> Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="novo" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <section className="surface-card p-5 space-y-3">
              <h3 className="font-display font-semibold text-lg">Dados do Motorista</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nome do Motorista *</Label>
                  <Input value={form.nome_motorista} onChange={(e) => setForm((s) => ({ ...s, nome_motorista: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Contato</Label>
                  <Input value={form.contato} onChange={(e) => setForm((s) => ({ ...s, contato: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Data da Integração</Label>
                  <Input type="date" value={form.data} onChange={(e) => setForm((s) => ({ ...s, data: e.target.value }))} />
                </div>
              </div>
            </section>

            <section className="surface-card p-5 space-y-3">
              <h3 className="font-display font-semibold text-lg">Dados do Veículo</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Placa Cavalo</Label>
                  <Input value={form.placa_cavalo} onChange={(e) => setForm((s) => ({ ...s, placa_cavalo: e.target.value.toUpperCase() }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Placa Carreta</Label>
                  <Input value={form.placa_carreta} onChange={(e) => setForm((s) => ({ ...s, placa_carreta: e.target.value.toUpperCase() }))} />
                </div>
              </div>
            </section>
          </div>

          <section className="surface-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">Checklist</h3>
              <Badge variant={statusFromChecks(form.checks) === "concluido" ? "default" : "secondary"}>
                {statusFromChecks(form.checks) === "concluido" ? "Concluído" : "Pendente"}
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {CHECKLIST_ITEMS.map((it) => (
                <div key={it.key} className="rounded-lg border border-border bg-card/40 p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.checks[it.key]}
                      onCheckedChange={(v) => setForm((s) => ({ ...s, checks: { ...s.checks, [it.key]: !!v } }))}
                    />
                    <span className="text-sm font-medium">{it.label}</span>
                  </label>
                  <Input
                    placeholder="Observação..."
                    value={form.obs[it.key]}
                    onChange={(e) => setForm((s) => ({ ...s, obs: { ...s.obs, [it.key]: e.target.value } }))}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5 space-y-3">
            <h3 className="font-display font-semibold text-lg">Observações Gerais</h3>
            <Textarea
              rows={4}
              value={form.observacoes}
              onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
              placeholder="Anote informações adicionais sobre esta integração..."
            />
          </section>

          <section className="surface-card p-5 space-y-3">
            <h3 className="font-display font-semibold text-lg">Responsável</h3>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome do responsável pela integração</Label>
                <Input value={form.responsavel} onChange={(e) => setForm((s) => ({ ...s, responsavel: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Assinatura digital</Label>
                <SignaturePad
                  ref={signatureRef}
                  value={form.assinatura}
                  onChange={(v) => setForm((s) => ({ ...s, assinatura: v }))}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-2 sticky bottom-0 bg-background/80 backdrop-blur py-3 -mx-6 px-6 border-t border-border">
            <Button variant="outline" onClick={novoCadastro}><Plus className="size-4 mr-1" /> Novo Cadastro</Button>
            <Button variant="ghost" onClick={limparCampos}><Eraser className="size-4 mr-1" /> Limpar Campos</Button>
            <Button variant="secondary" onClick={() => gerarPDF()}><FileDown className="size-4 mr-1" /> Gerar PDF</Button>
            <Button onClick={salvar} disabled={saving}>
              <Save className="size-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 mt-4">
          <section className="surface-card p-4">
            <h3 className="font-display font-semibold mb-3">Filtros</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8" placeholder="Pesquisar por nome" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
              </div>
              <div className="relative">
                <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8" placeholder="Pesquisar por placa" value={filterPlate} onChange={(e) => setFilterPlate(e.target.value)} />
              </div>
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
          </section>

          <section className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Data</th>
                    <th className="text-left px-3 py-2">Motorista</th>
                    <th className="text-left px-3 py-2">Contato</th>
                    <th className="text-left px-3 py-2">Cavalo</th>
                    <th className="text-left px-3 py-2">Carreta</th>
                    <th className="text-left px-3 py-2">Responsável</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-right px-3 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma integração encontrada.</td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                        <td className="px-3 py-2">{new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                        <td className="px-3 py-2 font-medium">{r.nome_motorista}</td>
                        <td className="px-3 py-2">{r.contato ?? "—"}</td>
                        <td className="px-3 py-2">{r.placa_cavalo ?? "—"}</td>
                        <td className="px-3 py-2">{r.placa_carreta ?? "—"}</td>
                        <td className="px-3 py-2">{r.responsavel ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant={r.status === "concluido" ? "default" : "secondary"}>
                            {r.status === "concluido" ? "Concluído" : "Pendente"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => editar(r)}>Editar</Button>
                          <Button size="sm" variant="ghost" onClick={() => gerarPDF(rowToForm(r))}>
                            <FileDown className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={CalendarIcon} label="Hoje" value={kpis.hoje} hint="Integrações realizadas hoje" />
            <KpiCard icon={LayoutDashboard} label="Este mês" value={kpis.mes} hint="Integrações do mês atual" />
            <KpiCard icon={Clock} label="Pendentes" value={kpis.pend} hint="Aguardando conclusão" />
            <KpiCard icon={CheckCircle2} label="Concluídas" value={kpis.concl} hint="Checklist 100% OK" />
          </div>
          <section className="surface-card p-4">
            <h3 className="font-display font-semibold mb-3">Últimas integrações</h3>
            {list.slice(0, 8).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
            ) : (
              <ul className="divide-y divide-border">
                {list.slice(0, 8).map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.nome_motorista}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")} · {r.placa_cavalo ?? "—"} / {r.placa_carreta ?? "—"}
                      </p>
                    </div>
                    <Badge variant={r.status === "concluido" ? "default" : "secondary"}>
                      {r.status === "concluido" ? "Concluído" : "Pendente"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number; hint?: string }) {
  return (
    <div className="surface-card p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-semibold mt-1">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <div className="size-10 rounded-md brand-gradient grid place-items-center text-white shrink-0">
        <Icon className="size-5" />
      </div>
    </div>
  );
}
