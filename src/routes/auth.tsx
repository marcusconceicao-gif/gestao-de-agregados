import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Bem-vindo ao MONFREDINI HUB");
      navigate({ to: "/" });
    }
  };

  const signup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Conta criada. Você já pode entrar.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-sidebar border-r border-sidebar-border overflow-hidden">
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
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-6"><Logo /></div>
          <h2 className="font-display text-2xl font-semibold">Acesse o sistema</h2>
          <p className="text-sm text-muted-foreground mb-6">Use suas credenciais corporativas.</p>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-3 mt-4">
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Senha</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button onClick={login} disabled={loading} className="w-full brand-gradient text-white">
                Entrar
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3 mt-4">
              <div>
                <Label>Nome completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Senha</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button onClick={signup} disabled={loading} className="w-full brand-gradient text-white">
                Criar conta
              </Button>
              <p className="text-xs text-muted-foreground">
                O primeiro usuário criado se torna Administrador automaticamente.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
