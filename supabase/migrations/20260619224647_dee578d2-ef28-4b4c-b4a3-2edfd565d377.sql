
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
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.can_write(auth.uid()) OR public.has_role(auth.uid(), ''consulta''::app_role))',
      t || '_select_roles', t
    );
  END LOOP;
END $$;
