import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard, Building2, Users, Truck, Container, Layers, Satellite, Gauge, ShieldCheck,
  Wrench, AlertTriangle, ShieldAlert, Ban, ListOrdered, FolderOpen, BarChart3, Bell, UserCog,
  ClipboardCheck, ChevronsLeft, ChevronsRight, LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/motoristas", label: "Motoristas", icon: Users },
  { to: "/cavalos", label: "Cavalos", icon: Truck },
  { to: "/carretas", label: "Carretas", icon: Container },
  { to: "/conjuntos", label: "Conjuntos", icon: Layers },
  { to: "/tecnologias", label: "Tecnologias", icon: Satellite },
  { to: "/tacografos", label: "Tacógrafo", icon: Gauge },
  { to: "/seguros", label: "Seguros", icon: ShieldCheck },
  { to: "/manutencoes", label: "Manutenções", icon: Wrench },
  { to: "/advertencias", label: "Advertências", icon: AlertTriangle },
  { to: "/acidentes_sinistros", label: "Acidentes e Sinistros", icon: ShieldAlert },
  { to: "/bloqueios", label: "Bloqueios", icon: Ban },
  { to: "/fila_agregados", label: "Fila de Agregados", icon: ListOrdered },
  { to: "/integracoes", label: "Checklist de Integração", icon: ClipboardCheck },
  { to: "/documentos", label: "Central de Documentos", icon: FolderOpen },
  { to: "/relatorios", label: "Relatórios Gerenciais", icon: BarChart3 },
  { to: "/alertas", label: "Alertas", icon: Bell },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { roles, isAdmin, user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={`relative shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 ${collapsed ? "w-[68px]" : "w-[248px]"}`}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Logo collapsed={collapsed} />
      </div>
      <nav className="py-3 px-2 space-y-0.5 overflow-y-auto h-[calc(100vh-8rem)]">
        {NAV.map((item) => {
          const active = path === item.to || (item.to !== "/" && path.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition group ${
                active
                  ? "bg-primary/15 text-foreground border-l-2 border-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/usuarios"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
              path.startsWith("/usuarios")
                ? "bg-primary/15 text-foreground border-l-2 border-primary"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
            }`}
          >
            <UserCog className="size-[18px] shrink-0" />
            {!collapsed && <span>Usuários</span>}
          </Link>
        )}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-2">
        {!collapsed && user && (
          <div className="px-2 pb-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {roles.map((r) => (
                <Badge key={r} variant="outline" className="text-[10px] py-0 h-4">{r}</Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-1">
          <Button variant="ghost" size="sm" className="flex-1" onClick={signOut} title="Sair">
            <LogOut className="size-4" />{!collapsed && "Sair"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
