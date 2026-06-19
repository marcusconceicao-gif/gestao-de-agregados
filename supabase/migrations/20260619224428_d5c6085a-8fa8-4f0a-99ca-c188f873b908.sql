
-- 1) Recriar view alertas_v como SECURITY INVOKER
ALTER VIEW public.alertas_v SET (security_invoker = true);

-- 2) Revogar EXECUTE público das funções SECURITY DEFINER (mantém authenticated para uso nas policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_write(uuid)          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid)           FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_write(uuid)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid)           TO authenticated, service_role;

-- 3) profiles: cada usuário lê apenas o próprio; admin lê todos
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- 4) Restringir SELECT em tabelas com dados sensíveis para admin/operacional (can_write)
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'motoristas','empresas','fila_agregados','acidentes_sinistros',
    'advertencias','bloqueios','cavalos','carretas','documentos','seguros',
    'tacografos','tecnologias','manutencoes','conjuntos'
  ];
  pol record;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
       WHERE schemaname='public' AND tablename=t AND cmd='SELECT'
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.can_write(auth.uid()))',
      t || '_select_operacional', t
    );
  END LOOP;
END $$;
