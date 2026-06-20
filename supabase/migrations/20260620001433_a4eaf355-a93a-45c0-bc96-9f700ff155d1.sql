
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.integracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  nome_motorista TEXT NOT NULL,
  contato TEXT,
  placa_cavalo TEXT,
  placa_carreta TEXT,
  checklist_visual BOOLEAN NOT NULL DEFAULT false,
  checklist_visual_obs TEXT,
  checklist_rastreador BOOLEAN NOT NULL DEFAULT false,
  checklist_rastreador_obs TEXT,
  documentacao_carreta BOOLEAN NOT NULL DEFAULT false,
  documentacao_carreta_obs TEXT,
  kit BOOLEAN NOT NULL DEFAULT false,
  kit_obs TEXT,
  datapar BOOLEAN NOT NULL DEFAULT false,
  datapar_obs TEXT,
  email BOOLEAN NOT NULL DEFAULT false,
  email_obs TEXT,
  planilha_status BOOLEAN NOT NULL DEFAULT false,
  planilha_status_obs TEXT,
  motorista_programacao BOOLEAN NOT NULL DEFAULT false,
  motorista_programacao_obs TEXT,
  observacoes TEXT,
  responsavel TEXT,
  assinatura TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integracoes TO authenticated;
GRANT ALL ON public.integracoes TO service_role;

ALTER TABLE public.integracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view integracoes"
  ON public.integracoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert integracoes"
  ON public.integracoes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update integracoes"
  ON public.integracoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete integracoes"
  ON public.integracoes FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trg_integracoes_updated_at
  BEFORE UPDATE ON public.integracoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_integracoes_data ON public.integracoes(data DESC);
CREATE INDEX idx_integracoes_motorista ON public.integracoes(nome_motorista);
