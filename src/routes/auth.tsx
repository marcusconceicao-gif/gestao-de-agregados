import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import symbolAsset from "@/assets/monfredini-symbol.png.asset.json";

import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Bem-vindo ao MONFREDINI — Gestão de Agregados");
      navigate({ to: "/" });
    }
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-no-repeat bg-center opacity-[0.05]"
        style={{ backgroundImage: `url(${symbolAsset.url})`, backgroundSize: "min(80vw, 1000px) auto" }}
      />
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12 bg-sidebar/80 backdrop-blur-sm border-r border-sidebar-border overflow-hidden">
        <div className="absolute inset-0 opacity-30 brand-gradient blur-3xl" style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 100%)" }} />
        <div className="relative z-10">
          <Logo />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Inteligência operacional<br />para a frota <span className="text-primary">Monfredini</span>.
          </h1>
          <p className="mt-4 text-secondary/80 max-w-md">
            Cadastros, manutenções, seguros, tecnologia embarcada e alertas em tempo real,
            unificados em um único painel corporativo.
          </p>
        </div>
        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Monfredini Transportes
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="lg:hidden mb-6"><Logo /></div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Acesse o sistema</h2>
            <p className="text-sm text-muted-foreground">Use suas credenciais corporativas.</p>
          </div>
          <div className="space-y-3">
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
            <Button onClick={login} disabled={loading} className="w-full brand-gradient text-white">
              Entrar
            </Button>
            <p className="text-xs text-muted-foreground">
              Acesso restrito. Solicite credenciais ao administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
