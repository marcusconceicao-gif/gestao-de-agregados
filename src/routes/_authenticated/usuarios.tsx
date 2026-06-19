import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { friendlyDbError } from "@/lib/db-errors";

export const Route = createFileRoute("/_authenticated/usuarios")({
  component: UsuariosPage,
});

type Row = { id: string; nome: string; email: string | null; roles: string[] };

function UsuariosPage() {
  const { isAdmin, user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, nome, email"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const map = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      map.set(r.user_id, [...(map.get(r.user_id) ?? []), r.role]);
    });
    setRows((profiles ?? []).map((p: any) => ({
      id: p.id, nome: p.nome, email: p.email, roles: map.get(p.id) ?? [],
    })));
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const setRole = async (userId: string, role: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    if (error) toast.error(friendlyDbError(error, "Não foi possível atualizar a permissão."));
    else { toast.success("Permissão atualizada"); load(); }
  };

  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <h2 className="font-display text-xl">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Usuários e Permissões</h1>
        <p className="text-sm text-muted-foreground">Administrador, Operacional ou Consulta.</p>
      </div>
      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-secondary">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">E-mail</th>
              <th className="text-left px-4 py-3">Permissão Atual</th>
              <th className="text-left px-4 py-3">Alterar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2.5">{r.nome}{r.id === user?.id && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}</td>
                <td className="px-4 py-2.5">{r.email}</td>
                <td className="px-4 py-2.5">
                  {r.roles.map((rr) => (
                    <Badge key={rr} variant={rr === "admin" ? "default" : "outline"} className="mr-1">{rr}</Badge>
                  ))}
                </td>
                <td className="px-4 py-2.5">
                  <Select onValueChange={(v) => setRole(r.id, v)} disabled={r.id === user?.id}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
