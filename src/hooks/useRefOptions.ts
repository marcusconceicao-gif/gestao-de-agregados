import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FieldDef } from "@/lib/resources";

const cache = new Map<string, { value: string; label: string }[]>();

export function useRefOptions(field: FieldDef) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    if (field.type !== "ref" || !field.refTable) return;
    const key = `${field.refTable}:${field.refLabel}`;
    if (cache.has(key)) {
      setOpts(cache.get(key)!);
      return;
    }
    supabase
      .from(field.refTable as never)
      .select(`id, ${field.refLabel}`)
      .limit(500)
      .then(({ data }) => {
        const list = (data ?? []).map((r: Record<string, unknown>) => ({
          value: String(r.id),
          label: String((r as Record<string, unknown>)[field.refLabel as string] ?? r.id),
        }));
        cache.set(key, list);
        setOpts(list);
      });
  }, [field]);
  return opts;
}

export function invalidateRefCache(table?: string) {
  if (!table) cache.clear();
  else for (const k of Array.from(cache.keys())) if (k.startsWith(`${table}:`)) cache.delete(k);
}
