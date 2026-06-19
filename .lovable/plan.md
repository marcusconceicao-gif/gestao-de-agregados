
# MONFREDINI HUB — Plano de Construção (v1 enxuta)

Sistema interno tipo TMS/ERP em tema dark premium, com login por e-mail/senha, banco relacional no Lovable Cloud, 3 níveis de permissão e alertas automáticos.

## Identidade visual

- Tema dark premium. Tokens em `src/styles.css` (oklch):
  - Preto base `#0B0B0B`, superfícies elevadas em #111/#161616
  - Prata `#C0C0C0` (texto secundário, bordas finas)
  - Vermelho `#D90429` (primário / CTA / alertas críticos)
  - Branco `#FFFFFF` (texto principal)
- Tipografia: Space Grotesk (display) + Inter (body), via `@fontsource`
- Logo provisório: wordmark "MONFREDINI" prata + "HUB" vermelho, com filete vermelho
- Layout corporativo: sidebar fixa colapsável, topbar com busca global + perfil, conteúdo em cards com cabeçalho padronizado (título + ações)

## Arquitetura

- Stack: TanStack Start + Tailwind v4 + shadcn + Lovable Cloud (Postgres + Auth)
- Rotas protegidas sob `_authenticated/`, login em `/auth`
- Padrão por tela (DataTablePage reutilizável):
  - Botão **+ Novo Cadastro** (modal centralizado, `Dialog`)
  - Ações por linha: Editar, Duplicar, Histórico, Excluir
  - Toolbar: Pesquisar, Exportar Excel (xlsx), Exportar PDF (jspdf+autotable)
- **FAB global** `+ Novo Cadastro` no canto inferior direito com menu rápido para os 13 tipos listados
- Realtime via Supabase channels para refletir mudanças em todas as telas

## Permissões

Tabela `user_roles` + enum `app_role` (`admin`, `operacional`, `consulta`) + função `has_role` (SECURITY DEFINER). RLS:
- `admin`: tudo
- `operacional`: insert/update em operacionais; sem delete em cadastros mestres
- `consulta`: somente SELECT

## Banco de dados (resumo)

Tabelas principais (todas com RLS + GRANTs):

```text
profiles, user_roles
empresas
motoristas (cnh_validade, mopp_validade, status)
cavalos (placa, marca, modelo, ano, chassi, renavam, empresa_id)
carretas (placa, tipo, ano, empresa_id)
conjuntos (cavalo_id, carreta_id, motorista_id, ativo)
tecnologias (tipo: autotrac|sascar|omnilink|onixsat, equipamento_id,
             cavalo_id, ultima_manutencao, proxima_manutencao)
tacografos (cavalo_id, modelo, aferição_validade)
seguros (tipo, apolice, seguradora, inicio, fim, valor, cavalo_id|carreta_id|empresa_id)
manutencoes (cavalo_id|carreta_id, tipo, data, km, custo, descricao)
advertencias (motorista_id, data, motivo, gravidade)
acidentes_sinistros (data, motorista_id, cavalo_id, descricao, custo, boletim)
bloqueios (entidade_tipo, entidade_id, motivo, ativo)
fila_agregados (nome, telefone, documento, status, observacoes)
documentos (entidade_tipo, entidade_id, nome, url, validade)
historico_eventos (entidade_tipo, entidade_id, acao, payload, user_id, created_at)
alertas (tipo, entidade_tipo, entidade_id, vence_em, severidade, lido)
```

Trigger genérico para gravar `historico_eventos` em INSERT/UPDATE/DELETE.

## Alertas automáticos

Função SQL `gerar_alertas()` chamada por server function `refreshAlerts()` (executada no carregamento do dashboard e após mutações relevantes). Regras:
- Seguro vencendo em ≤30 dias
- Tacógrafo aferição em ≤30 dias
- CNH vencendo em ≤60 dias
- MOPP vencendo em ≤60 dias
- Tecnologia sem manutenção há >180 dias
- Motorista com ≥3 advertências ativas

Alertas aparecem no Dashboard, no sino da topbar e na tela "Alertas".

## Dashboard Executivo

KPIs (frota total, cavalos ativos, motoristas ativos, conjuntos formados, alertas críticos, manutenções no mês) + gráficos `recharts`:
- Manutenções por mês (barras)
- Custo de manutenção por veículo (top 10)
- Distribuição de tecnologias (pizza)
- Advertências por motorista (barras)
- Sinistros últimos 12 meses (linha)

Exportação Excel/PDF da visão executiva.

## Módulos (v1 enxuta — CRUD + ações padronizadas)

Dashboard, Empresas, Motoristas, Cavalos, Carretas, Conjuntos, Tecnologias, Tacógrafo, Seguros, Manutenções, Advertências, Acidentes e Sinistros, Bloqueios, Fila de Agregados, Central de Documentos, Relatórios Gerenciais, Alertas, Usuários (admin).

## Implementação (ordem)

1. Ativar Lovable Cloud e criar migration completa (enums, tabelas, RLS, GRANTs, trigger de histórico, função de alertas)
2. Design system (`styles.css`), fontes, layout `_authenticated` com sidebar + topbar + FAB
3. Auth (e-mail/senha) + bootstrap do primeiro admin
4. Componente reutilizável `ResourcePage` (toolbar + tabela + modal + ações + export)
5. Geração das 16 telas a partir de schemas declarativos
6. Dashboard com KPIs e gráficos
7. Alertas + sino na topbar
8. Exportação Excel (xlsx) e PDF (jspdf + jspdf-autotable)
9. QA: navegação, RLS, alertas, exportações

## Observações

- v1 entrega CRUD completo, alertas e dashboard. Refinamentos por módulo (workflows específicos, anexos avançados, integrações com Autotrac/Sascar/Omnilink/Onixsat) ficam para próximas iterações.
- Upload de documentos usa Storage do Lovable Cloud.
