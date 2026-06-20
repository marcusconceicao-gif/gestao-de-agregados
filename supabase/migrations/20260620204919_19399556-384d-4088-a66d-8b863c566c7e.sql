ALTER TABLE public.carretas ADD COLUMN IF NOT EXISTS eixos smallint;
UPDATE public.carretas SET tipo = 'Bau' WHERE tipo IS DISTINCT FROM 'Bau';
ALTER TABLE public.carretas ALTER COLUMN tipo SET DEFAULT 'Bau';