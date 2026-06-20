ALTER TABLE public.tecnologias
  ADD COLUMN IF NOT EXISTS usuario text,
  ADD COLUMN IF NOT EXISTS senha text,
  ADD COLUMN IF NOT EXISTS trava_5a_roda boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS camera boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS segunda_tecnologia text;