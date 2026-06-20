
DROP POLICY IF EXISTS "Authenticated can insert integracoes" ON public.integracoes;
DROP POLICY IF EXISTS "Authenticated can update integracoes" ON public.integracoes;
DROP POLICY IF EXISTS "Authenticated can delete integracoes" ON public.integracoes;

CREATE POLICY "Writers can insert integracoes" ON public.integracoes
  FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "Writers can update integracoes" ON public.integracoes
  FOR UPDATE TO authenticated USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "Admins can delete integracoes" ON public.integracoes
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
