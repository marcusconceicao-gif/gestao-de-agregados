
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'operacional', 'consulta');
CREATE TYPE public.tecnologia_tipo AS ENUM ('autotrac', 'sascar', 'omnilink', 'onixsat');
CREATE TYPE public.seguro_tipo AS ENUM ('frota', 'rcfv', 'rctrc', 'casco', 'vida');
CREATE TYPE public.entidade_tipo AS ENUM ('empresa', 'motorista', 'cavalo', 'carreta', 'conjunto', 'tecnologia', 'tacografo', 'seguro', 'manutencao', 'advertencia', 'acidente', 'documento', 'bloqueio', 'agregado');
CREATE TYPE public.severidade AS ENUM ('info', 'aviso', 'critico');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.can_write(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role) OR public.has_role(_user_id, 'operacional'::app_role)
$$;

CREATE POLICY "roles_select_self_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  assigned_role app_role;
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), NEW.email);
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count <= 1 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'consulta';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic RLS policy helper macros applied per table:
--  SELECT: any authenticated user
--  INSERT/UPDATE: admin or operacional
--  DELETE: admin only

-- Empresas
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  ie TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  uf TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT ALL ON public.empresas TO service_role;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "empresas_sel" ON public.empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "empresas_ins" ON public.empresas FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "empresas_upd" ON public.empresas FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "empresas_del" ON public.empresas FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER empresas_updated BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Motoristas
CREATE TABLE public.motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  rg TEXT,
  telefone TEXT,
  email TEXT,
  cnh_numero TEXT,
  cnh_categoria TEXT,
  cnh_validade DATE,
  mopp_validade DATE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  endereco TEXT,
  cidade TEXT,
  uf TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motoristas TO authenticated;
GRANT ALL ON public.motoristas TO service_role;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mot_sel" ON public.motoristas FOR SELECT TO authenticated USING (true);
CREATE POLICY "mot_ins" ON public.motoristas FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "mot_upd" ON public.motoristas FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "mot_del" ON public.motoristas FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER mot_updated BEFORE UPDATE ON public.motoristas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Cavalos
CREATE TABLE public.cavalos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  marca TEXT,
  modelo TEXT,
  ano INT,
  cor TEXT,
  chassi TEXT,
  renavam TEXT,
  km_atual INT DEFAULT 0,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cavalos TO authenticated;
GRANT ALL ON public.cavalos TO service_role;
ALTER TABLE public.cavalos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cav_sel" ON public.cavalos FOR SELECT TO authenticated USING (true);
CREATE POLICY "cav_ins" ON public.cavalos FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "cav_upd" ON public.cavalos FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "cav_del" ON public.cavalos FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER cav_updated BEFORE UPDATE ON public.cavalos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Carretas
CREATE TABLE public.carretas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  tipo TEXT,
  marca TEXT,
  modelo TEXT,
  ano INT,
  chassi TEXT,
  renavam TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ativa',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carretas TO authenticated;
GRANT ALL ON public.carretas TO service_role;
ALTER TABLE public.carretas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "car_sel" ON public.carretas FOR SELECT TO authenticated USING (true);
CREATE POLICY "car_ins" ON public.carretas FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "car_upd" ON public.carretas FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "car_del" ON public.carretas FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER car_updated BEFORE UPDATE ON public.carretas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Conjuntos
CREATE TABLE public.conjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  cavalo_id UUID REFERENCES public.cavalos(id) ON DELETE SET NULL,
  carreta_id UUID REFERENCES public.carretas(id) ON DELETE SET NULL,
  carreta2_id UUID REFERENCES public.carretas(id) ON DELETE SET NULL,
  motorista_id UUID REFERENCES public.motoristas(id) ON DELETE SET NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conjuntos TO authenticated;
GRANT ALL ON public.conjuntos TO service_role;
ALTER TABLE public.conjuntos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conj_sel" ON public.conjuntos FOR SELECT TO authenticated USING (true);
CREATE POLICY "conj_ins" ON public.conjuntos FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "conj_upd" ON public.conjuntos FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "conj_del" ON public.conjuntos FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER conj_updated BEFORE UPDATE ON public.conjuntos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tecnologias
CREATE TABLE public.tecnologias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo tecnologia_tipo NOT NULL,
  numero_equipamento TEXT,
  cavalo_id UUID REFERENCES public.cavalos(id) ON DELETE SET NULL,
  carreta_id UUID REFERENCES public.carretas(id) ON DELETE SET NULL,
  data_instalacao DATE,
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tecnologias TO authenticated;
GRANT ALL ON public.tecnologias TO service_role;
ALTER TABLE public.tecnologias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tec_sel" ON public.tecnologias FOR SELECT TO authenticated USING (true);
CREATE POLICY "tec_ins" ON public.tecnologias FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "tec_upd" ON public.tecnologias FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "tec_del" ON public.tecnologias FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER tec_updated BEFORE UPDATE ON public.tecnologias FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tacógrafos
CREATE TABLE public.tacografos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cavalo_id UUID REFERENCES public.cavalos(id) ON DELETE SET NULL,
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  data_afericao DATE,
  validade_afericao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tacografos TO authenticated;
GRANT ALL ON public.tacografos TO service_role;
ALTER TABLE public.tacografos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tac_sel" ON public.tacografos FOR SELECT TO authenticated USING (true);
CREATE POLICY "tac_ins" ON public.tacografos FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "tac_upd" ON public.tacografos FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "tac_del" ON public.tacografos FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER tac_updated BEFORE UPDATE ON public.tacografos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seguros
CREATE TABLE public.seguros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo seguro_tipo NOT NULL,
  apolice TEXT,
  seguradora TEXT,
  inicio DATE,
  fim DATE,
  valor NUMERIC(14,2),
  cavalo_id UUID REFERENCES public.cavalos(id) ON DELETE SET NULL,
  carreta_id UUID REFERENCES public.carretas(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seguros TO authenticated;
GRANT ALL ON public.seguros TO service_role;
ALTER TABLE public.seguros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seg_sel" ON public.seguros FOR SELECT TO authenticated USING (true);
CREATE POLICY "seg_ins" ON public.seguros FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "seg_upd" ON public.seguros FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "seg_del" ON public.seguros FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER seg_updated BEFORE UPDATE ON public.seguros FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Manutenções
CREATE TABLE public.manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cavalo_id UUID REFERENCES public.cavalos(id) ON DELETE SET NULL,
  carreta_id UUID REFERENCES public.carretas(id) ON DELETE SET NULL,
  tipo TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  km INT,
  custo NUMERIC(14,2),
  oficina TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manutencoes TO authenticated;
GRANT ALL ON public.manutencoes TO service_role;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "man_sel" ON public.manutencoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "man_ins" ON public.manutencoes FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "man_upd" ON public.manutencoes FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "man_del" ON public.manutencoes FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER man_updated BEFORE UPDATE ON public.manutencoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Advertências
CREATE TABLE public.advertencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID NOT NULL REFERENCES public.motoristas(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  motivo TEXT NOT NULL,
  gravidade TEXT NOT NULL DEFAULT 'leve',
  ativa BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advertencias TO authenticated;
GRANT ALL ON public.advertencias TO service_role;
ALTER TABLE public.advertencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "adv_sel" ON public.advertencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "adv_ins" ON public.advertencias FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "adv_upd" ON public.advertencias FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "adv_del" ON public.advertencias FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER adv_updated BEFORE UPDATE ON public.advertencias FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Acidentes e sinistros
CREATE TABLE public.acidentes_sinistros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  motorista_id UUID REFERENCES public.motoristas(id) ON DELETE SET NULL,
  cavalo_id UUID REFERENCES public.cavalos(id) ON DELETE SET NULL,
  carreta_id UUID REFERENCES public.carretas(id) ON DELETE SET NULL,
  descricao TEXT,
  local TEXT,
  custo NUMERIC(14,2),
  boletim TEXT,
  status TEXT DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acidentes_sinistros TO authenticated;
GRANT ALL ON public.acidentes_sinistros TO service_role;
ALTER TABLE public.acidentes_sinistros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aci_sel" ON public.acidentes_sinistros FOR SELECT TO authenticated USING (true);
CREATE POLICY "aci_ins" ON public.acidentes_sinistros FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "aci_upd" ON public.acidentes_sinistros FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "aci_del" ON public.acidentes_sinistros FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER aci_updated BEFORE UPDATE ON public.acidentes_sinistros FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bloqueios
CREATE TABLE public.bloqueios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo entidade_tipo NOT NULL,
  entidade_id UUID NOT NULL,
  entidade_nome TEXT,
  motivo TEXT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bloqueios TO authenticated;
GRANT ALL ON public.bloqueios TO service_role;
ALTER TABLE public.bloqueios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blo_sel" ON public.bloqueios FOR SELECT TO authenticated USING (true);
CREATE POLICY "blo_ins" ON public.bloqueios FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "blo_upd" ON public.bloqueios FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "blo_del" ON public.bloqueios FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER blo_updated BEFORE UPDATE ON public.bloqueios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Fila de Agregados
CREATE TABLE public.fila_agregados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  documento TEXT,
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  uf TEXT,
  veiculo TEXT,
  posicao INT,
  status TEXT NOT NULL DEFAULT 'aguardando',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fila_agregados TO authenticated;
GRANT ALL ON public.fila_agregados TO service_role;
ALTER TABLE public.fila_agregados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fil_sel" ON public.fila_agregados FOR SELECT TO authenticated USING (true);
CREATE POLICY "fil_ins" ON public.fila_agregados FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "fil_upd" ON public.fila_agregados FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "fil_del" ON public.fila_agregados FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER fil_updated BEFORE UPDATE ON public.fila_agregados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Documentos
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo entidade_tipo NOT NULL,
  entidade_id UUID,
  nome TEXT NOT NULL,
  tipo TEXT,
  url TEXT,
  validade DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;
GRANT ALL ON public.documentos TO service_role;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc_sel" ON public.documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_ins" ON public.documentos FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "doc_upd" ON public.documentos FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "doc_del" ON public.documentos FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER doc_updated BEFORE UPDATE ON public.documentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- View de alertas calculados em tempo real
CREATE OR REPLACE VIEW public.alertas_v AS
SELECT * FROM (
  SELECT
    'cnh_'||m.id::text AS id,
    'cnh'::text AS tipo,
    'motorista'::text AS entidade_tipo,
    m.id AS entidade_id,
    m.nome AS entidade_nome,
    m.cnh_validade AS vence_em,
    CASE
      WHEN m.cnh_validade < CURRENT_DATE THEN 'critico'
      WHEN m.cnh_validade <= CURRENT_DATE + 30 THEN 'critico'
      ELSE 'aviso' END AS severidade,
    'CNH de '||m.nome||' vence em '||to_char(m.cnh_validade,'DD/MM/YYYY') AS descricao
  FROM public.motoristas m
  WHERE m.cnh_validade IS NOT NULL AND m.cnh_validade <= CURRENT_DATE + 60

  UNION ALL

  SELECT
    'mopp_'||m.id::text,
    'mopp', 'motorista', m.id, m.nome, m.mopp_validade,
    CASE WHEN m.mopp_validade <= CURRENT_DATE + 30 THEN 'critico' ELSE 'aviso' END,
    'MOPP de '||m.nome||' vence em '||to_char(m.mopp_validade,'DD/MM/YYYY')
  FROM public.motoristas m
  WHERE m.mopp_validade IS NOT NULL AND m.mopp_validade <= CURRENT_DATE + 60

  UNION ALL

  SELECT
    'seg_'||s.id::text, 'seguro', 'seguro', s.id,
    COALESCE(s.apolice, s.seguradora, 'Seguro'),
    s.fim,
    CASE WHEN s.fim <= CURRENT_DATE + 15 THEN 'critico' ELSE 'aviso' END,
    'Seguro '||COALESCE(s.apolice,'')||' vence em '||to_char(s.fim,'DD/MM/YYYY')
  FROM public.seguros s
  WHERE s.fim IS NOT NULL AND s.fim <= CURRENT_DATE + 30

  UNION ALL

  SELECT
    'tac_'||t.id::text, 'tacografo', 'tacografo', t.id,
    COALESCE(t.numero_serie,'Tacógrafo'),
    t.validade_afericao,
    CASE WHEN t.validade_afericao <= CURRENT_DATE + 15 THEN 'critico' ELSE 'aviso' END,
    'Aferição do tacógrafo vence em '||to_char(t.validade_afericao,'DD/MM/YYYY')
  FROM public.tacografos t
  WHERE t.validade_afericao IS NOT NULL AND t.validade_afericao <= CURRENT_DATE + 30

  UNION ALL

  SELECT
    'tec_'||te.id::text, 'tecnologia', 'tecnologia', te.id,
    te.tipo::text||' '||COALESCE(te.numero_equipamento,''),
    te.ultima_manutencao,
    'aviso',
    'Tecnologia '||te.tipo::text||' sem manutenção há mais de 180 dias'
  FROM public.tecnologias te
  WHERE te.ultima_manutencao IS NOT NULL AND te.ultima_manutencao < CURRENT_DATE - 180

  UNION ALL

  SELECT
    'adv_'||m.id::text, 'advertencia', 'motorista', m.id, m.nome,
    CURRENT_DATE, 'critico',
    'Motorista '||m.nome||' possui '||cnt::text||' advertências ativas'
  FROM (
    SELECT motorista_id, COUNT(*) AS cnt FROM public.advertencias
    WHERE ativa = true GROUP BY motorista_id HAVING COUNT(*) >= 3
  ) a
  JOIN public.motoristas m ON m.id = a.motorista_id
) sub;

GRANT SELECT ON public.alertas_v TO authenticated;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.empresas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.motoristas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cavalos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carretas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conjuntos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tecnologias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tacografos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seguros;
ALTER PUBLICATION supabase_realtime ADD TABLE public.manutencoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advertencias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.acidentes_sinistros;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bloqueios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fila_agregados;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documentos;
