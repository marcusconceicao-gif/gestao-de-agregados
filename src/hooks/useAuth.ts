import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "operacional" | "consulta";

export interface AuthState {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
}

export function useAuth(): AuthState & {
  isAdmin: boolean;
  canWrite: boolean;
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    roles: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    const loadRoles = async (userId: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      return (data ?? []).map((r) => r.role as AppRole);
    };

    const sub = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setState((s) => ({ ...s, session, user: session.user, loading: true }));
        const roles = await loadRoles(session.user.id);
        if (!mounted) return;
        setState({ session, user: session.user, roles, loading: false });
      } else {
        setState({ session: null, user: null, roles: [], loading: false });
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        const roles = await loadRoles(data.session.user.id);
        if (!mounted) return;
        setState({ session: data.session, user: data.session.user, roles, loading: false });
      } else {
        setState({ session: null, user: null, roles: [], loading: false });
      }
    });

    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = state.roles.includes("admin");
  const canWrite = isAdmin || state.roles.includes("operacional");

  return {
    ...state,
    isAdmin,
    canWrite,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
