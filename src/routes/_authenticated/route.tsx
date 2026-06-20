import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

import symbolAsset from "@/assets/monfredini-symbol.png.asset.json";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="relative min-h-screen flex bg-background text-foreground overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-no-repeat bg-center opacity-[0.04]"
        style={{
          backgroundImage: `url(${symbolAsset.url})`,
          backgroundSize: "min(70vw, 900px) auto",
        }}
      />
      <Sidebar />
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
