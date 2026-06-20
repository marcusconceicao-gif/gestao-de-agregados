import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRefOptions } from "@/hooks/useRefOptions";
import { type FieldDef, type ResourceDef } from "@/lib/resources";
import { exportToExcel, exportToPDF, formatDate, formatMoney } from "@/lib/export";
import { friendlyDbError } from "@/lib/db-errors";
import { applyMask, detectMask, validateMasked } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Search, MoreHorizontal, Pencil, Copy, History, Trash2, FileSpreadsheet, FileText, Upload, Download,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Eye, EyeOff,
} from "lucide-react";

type Row = Record<string, any>;

function FieldInput({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  const refOpts = useRefOptions(field);
  const [showPwd, setShowPwd] = useState(false);
  if (field.type === "textarea") {
    return <Textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "password") {
    return (
      <div className="relative">
        <Input
          type={showPwd ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  }
  if (field.type === "boolean") {
    return (
      <div className="flex items-center h-10">
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
        <SelectContent>
          {field.options?.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "ref") {
    return (
      <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
        <SelectContent>
          {refOpts.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "date") {
    return <Input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} />;
  }
  if (field.type === "number" || field.type === "money") {
    return <Input type="number" step={field.type === "money" ? "0.01" : "1"} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
  }
  const mask = detectMask(field.name);
  if (mask) {
    return (
      <Input
        value={applyMask(mask, value ?? "")}
        onChange={(e) => onChange(applyMask(mask, e.target.value))}
        inputMode={mask === "placa" || mask === "rg" ? "text" : "numeric"}
        autoComplete="off"
      />
    );
  }
  return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function formatCell(field: FieldDef, value: any, refMap?: Record<string, Record<string, string>>) {
  if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
  if (field.type === "boolean") {
    return <Badge variant={value ? "default" : "secondary"}>{value ? "Sim" : "Não"}</Badge>;
  }
  if (field.type === "date") return formatDate(value);
  if (field.type === "money") return formatMoney(Number(value));
  if (field.type === "ref" && refMap && field.refTable) {
    return refMap[field.refTable]?.[value] ?? value;
  }
  if (field.type === "select") {
    return field.options?.find((o) => o.value === value)?.label ?? value;
  }
  return String(value);
}

export interface ResourcePageProps {
  def: ResourceDef;
  openCreate?: boolean;
  onCreateClosed?: () => void;
}

export function ResourcePage({ def, openCreate, onCreateClosed }: ResourcePageProps) {
  const { canWrite, isAdmin } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [historyOf, setHistoryOf] = useState<Row | null>(null);
  const [refMap, setRefMap] = useState<Record<string, Record<string, string>>>({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const downloadTemplate = () => {
    const headers = def.fields.map((f) => f.label);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, def.singular.slice(0, 31));
    XLSX.writeFile(wb, `modelo_${def.key}.xlsx`);
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: false });
      if (json.length === 0) {
        toast.error("Planilha vazia");
        return;
      }
      // Build lookup maps for ref fields (label -> id)
      const refLookup: Record<string, Record<string, string>> = {};
      for (const f of def.fields.filter((x) => x.type === "ref" && x.refTable)) {
        const inv: Record<string, string> = {};
        const m = refMap[f.refTable!] ?? {};
        Object.entries(m).forEach(([id, label]) => { inv[String(label).toLowerCase().trim()] = id; });
        refLookup[f.name] = inv;
      }
      const rowsToInsert: Row[] = [];
      const errors: string[] = [];
      json.forEach((raw, idx) => {
        const obj: Row = {};
        for (const f of def.fields) {
          const v = raw[f.label] ?? raw[f.name];
          if (v === null || v === undefined || v === "") { obj[f.name] = null; continue; }
          if (f.type === "boolean") {
            const s = String(v).toLowerCase().trim();
            obj[f.name] = ["sim","true","1","yes","x"].includes(s);
          } else if (f.type === "number" || f.type === "money") {
            const n = Number(String(v).replace(",", "."));
            obj[f.name] = Number.isFinite(n) ? n : null;
          } else if (f.type === "date") {
            if (v instanceof Date) obj[f.name] = v.toISOString().slice(0, 10);
            else {
              const s = String(v).trim();
              const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
              obj[f.name] = br ? `${br[3]}-${br[2]}-${br[1]}` : s.slice(0, 10);
            }
          } else if (f.type === "ref") {
            const key = String(v).toLowerCase().trim();
            const id = refLookup[f.name]?.[key];
            obj[f.name] = id ?? (key.length === 36 ? String(v) : null);
            if (!obj[f.name]) errors.push(`Linha ${idx + 2}: "${f.label}" não encontrado (${v})`);
          } else {
            obj[f.name] = String(v);
          }
        }
        for (const f of def.fields) {
          if (f.required && (obj[f.name] === null || obj[f.name] === "")) {
            errors.push(`Linha ${idx + 2}: campo obrigatório "${f.label}" vazio`);
          }
        }
        rowsToInsert.push(obj);
      });
      if (errors.length > 0) {
        toast.error(errors.slice(0, 5).join(" • ") + (errors.length > 5 ? ` (+${errors.length - 5})` : ""));
        return;
      }
      const { error } = await (supabase.from(def.table as never) as any).insert(rowsToInsert);
      if (error) toast.error(friendlyDbError(error));
      else toast.success(`${rowsToInsert.length} registro(s) importado(s)`);
    } catch (e) {
      toast.error("Não foi possível ler o arquivo. Verifique o formato e tente novamente.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Load refs labels for table render
  useEffect(() => {
    const refFields = def.fields.filter((f) => f.type === "ref" && f.refTable);
    if (refFields.length === 0) return;
    (async () => {
      const map: Record<string, Record<string, string>> = {};
      for (const f of refFields) {
        const { data } = await supabase.from(f.refTable as never).select(`id, ${f.refLabel}`).limit(1000);
        const m: Record<string, string> = {};
        (data ?? []).forEach((r: Record<string, unknown>) => {
          m[String(r.id)] = String((r as Record<string, unknown>)[f.refLabel as string] ?? r.id);
        });
        map[f.refTable!] = m;
      }
      setRefMap(map);
    })();
  }, [def]);

  const load = async () => {
    setLoading(true);
    const order = def.defaultOrder ?? "created_at";
    const { data, error } = await supabase
      .from(def.table as never)
      .select("*")
      .order(order as never, { ascending: true })
      .limit(2000);
    if (error) toast.error(friendlyDbError(error));
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`rt-${def.table}`)
      .on("postgres_changes", { event: "*", schema: "public", table: def.table }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.table]);

  useEffect(() => {
    if (openCreate) {
      setEditing({});
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate]);

  const tableFields = useMemo(
    () => def.fields.filter((f) => f.showInTable).slice(0, 7),
    [def],
  );

  const filtered = useMemo(() => {
    const base = !search.trim()
      ? rows
      : rows.filter((r) => {
          const s = search.toLowerCase();
          return def.fields.some((f) => String(r[f.name] ?? "").toLowerCase().includes(s));
        });
    if (!sortKey) return base;
    const field = def.fields.find((f) => f.name === sortKey);
    const sorted = [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (field?.type === "number" || field?.type === "money") return Number(av) - Number(bv);
      return String(av).localeCompare(String(bv), "pt-BR", { numeric: true });
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, search, def, sortKey, sortDir]);

  useEffect(() => { setPage(1); }, [search, sortKey, sortDir, def.table]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );
  const toggleSort = (name: string) => {
    if (sortKey === name) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(name); setSortDir("asc"); }
  };

  const openNew = () => {
    setEditing({});
    setOpen(true);
  };
  const openEdit = (row: Row) => {
    setEditing(row);
    setOpen(true);
  };
  const openDuplicate = (row: Row) => {
    const { id, created_at, updated_at, ...rest } = row;
    void id; void created_at; void updated_at;
    setEditing(rest);
    setOpen(true);
  };
  const remove = async (row: Row) => {
    if (!confirm(`Excluir este ${def.singular.toLowerCase()}?`)) return;
    const { error } = await supabase.from(def.table as never).delete().eq("id", row.id);
    if (error) toast.error(friendlyDbError(error));
    else toast.success("Excluído com sucesso");
  };
  const save = async () => {
    if (!editing) return;
    const payload: Row = {};
    for (const f of def.fields) {
      const v = editing[f.name];
      if (f.type === "boolean") payload[f.name] = !!v;
      else if (v === "" || v === undefined) payload[f.name] = null;
      else payload[f.name] = v;
      if (f.required && (payload[f.name] === null || payload[f.name] === "")) {
        toast.error(`Campo obrigatório: ${f.label}`);
        return;
      }
      if (typeof payload[f.name] === "string") {
        const mErr = validateMasked(detectMask(f.name), payload[f.name]);
        if (mErr) { toast.error(`${f.label}: ${mErr}`); return; }
      }
    }
    let error;
    const tbl: any = supabase.from(def.table as never);
    if (editing.id) {
      ({ error } = await tbl.update(payload).eq("id", editing.id));
    } else {
      ({ error } = await tbl.insert(payload));
    }
    if (error) toast.error(friendlyDbError(error));
    else {
      toast.success(editing.id ? "Atualizado" : "Cadastrado");
      setOpen(false);
      setEditing(null);
      onCreateClosed?.();
    }
  };

  const exportRows = () => filtered.map((r) => {
    const out: Record<string, unknown> = {};
    for (const f of def.fields) {
      const v = r[f.name];
      if (f.type === "ref" && f.refTable) out[f.label] = refMap[f.refTable]?.[v] ?? v ?? "";
      else if (f.type === "date") out[f.label] = formatDate(v);
      else if (f.type === "boolean") out[f.label] = v ? "Sim" : "Não";
      else out[f.label] = v ?? "";
    }
    return out;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{def.title}</h1>
          <p className="text-sm text-muted-foreground">{rows.length} registro(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 w-64 bg-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(def.key, exportRows())}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToPDF(
            def.title,
            def.fields.filter(f=>f.showInTable).map(f=>({header:f.label,dataKey:f.label})),
            exportRows(),
          )}>
            <FileText className="size-4" /> PDF
          </Button>
          {canWrite && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImportFile(f); }}
              />
              <Button variant="outline" size="sm" onClick={downloadTemplate} title="Baixar modelo .xlsx">
                <Download className="size-4" /> Modelo
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                <Upload className="size-4" /> {importing ? "Importando..." : "Importar"}
              </Button>
            </>
          )}
          {canWrite && (
            <Button onClick={openNew} className="brand-gradient text-white shadow-[var(--shadow-elegant)]">
              <Plus className="size-4" /> Novo Cadastro
            </Button>
          )}
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-secondary">
              <tr>
                {tableFields.map((f) => {
                  const active = sortKey === f.name;
                  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
                  return (
                    <th key={f.name} className="text-left px-4 py-3 font-medium whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort(f.name)}
                        className={`inline-flex items-center gap-1.5 hover:text-primary transition ${active ? "text-primary" : ""}`}
                      >
                        {f.label}
                        <Icon className="size-3.5 opacity-70" />
                      </button>
                    </th>
                  );
                })}
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={tableFields.length+1} className="px-4 py-10 text-center text-muted-foreground">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={tableFields.length+1} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </td></tr>
              ) : pageRows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-surface-2/50 transition">
                  {tableFields.map((f) => (
                    <td key={f.name} className="px-4 py-2.5 whitespace-nowrap">{formatCell(f, row[f.name], refMap)}</td>
                  ))}
                  <td className="px-2 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="size-8"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row)} disabled={!canWrite}><Pencil className="size-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDuplicate(row)} disabled={!canWrite}><Copy className="size-4" /> Duplicar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoryOf(row)}><History className="size-4" /> Histórico</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => remove(row)} disabled={!isAdmin} className="text-destructive">
                          <Trash2 className="size-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Linhas por página:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="size-8" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2">{page} / {totalPages}</span>
                <Button size="icon" variant="ghost" className="size-8" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); onCreateClosed?.(); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing?.id ? `Editar ${def.singular}` : `Novo Cadastro — ${def.singular}`}
            </DialogTitle>
            <DialogDescription>Preencha as informações abaixo. Os dados são salvos automaticamente no banco.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {def.fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {f.label}{f.required && <span className="text-primary"> *</span>}
                </Label>
                <FieldInput
                  field={f}
                  value={editing?.[f.name] ?? (f.type === "boolean" ? false : "")}
                  onChange={(v) => setEditing((e) => ({ ...(e ?? {}), [f.name]: v }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="brand-gradient text-white">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History modal */}
      <Dialog open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico</DialogTitle>
            <DialogDescription>Movimentações do registro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span>{formatDate(historyOf?.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Atualizado em</span><span>{formatDate(historyOf?.updated_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{historyOf?.id}</span></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
