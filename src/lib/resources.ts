import { z } from "zod";

export type FieldType =
  | "text"
  | "password"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "boolean"
  | "money"
  | "ref";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  refTable?: string; // tabela para select por id
  refLabel?: string; // coluna a exibir
  required?: boolean;
  showInTable?: boolean;
  width?: string;
}

export interface ResourceDef {
  key: string;            // chave estável (rota / FAB)
  table: string;          // tabela supabase
  title: string;          // título da tela
  singular: string;       // "Empresa"
  icon?: string;
  fields: FieldDef[];
  defaultOrder?: string;  // coluna ordenação
}

export const RESOURCES: Record<string, ResourceDef> = {
  empresas: {
    key: "empresas",
    table: "empresas",
    title: "Cadastro de Empresas",
    singular: "Empresa",
    defaultOrder: "razao_social",
    fields: [
      { name: "razao_social", label: "Razão Social", type: "text", required: true, showInTable: true },
      { name: "nome_fantasia", label: "Nome Fantasia", type: "text", showInTable: true },
      { name: "cnpj", label: "CNPJ", type: "text", showInTable: true },
      { name: "ie", label: "Inscrição Estadual", type: "text" },
      { name: "telefone", label: "Telefone", type: "text", showInTable: true },
      { name: "email", label: "E-mail", type: "text" },
      { name: "endereco", label: "Endereço", type: "text" },
      { name: "cidade", label: "Cidade", type: "text", showInTable: true },
      { name: "uf", label: "UF", type: "text" },
      { name: "ativa", label: "Ativa", type: "boolean", showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  motoristas: {
    key: "motoristas",
    table: "motoristas",
    title: "Cadastro de Motoristas",
    singular: "Motorista",
    defaultOrder: "nome",
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true, showInTable: true },
      { name: "cpf", label: "CPF", type: "text", showInTable: true },
      { name: "rg", label: "RG", type: "text" },
      { name: "telefone", label: "Telefone", type: "text", showInTable: true },
      { name: "email", label: "E-mail", type: "text" },
      { name: "cnh_numero", label: "CNH", type: "text" },
      { name: "cnh_categoria", label: "Categoria CNH", type: "select", options: ["A","B","C","D","E"].map(v=>({value:v,label:v})) },
      { name: "cnh_validade", label: "Validade CNH", type: "date", showInTable: true },
      { name: "mopp_validade", label: "Validade MOPP", type: "date", showInTable: true },
      { name: "empresa_id", label: "Empresa", type: "ref", refTable: "empresas", refLabel: "razao_social" },
      { name: "status", label: "Status", type: "select", options: ["ativo","inativo","afastado"].map(v=>({value:v,label:v})), showInTable: true },
      { name: "cidade", label: "Cidade", type: "text" },
      { name: "uf", label: "UF", type: "text" },
      { name: "endereco", label: "Endereço", type: "text" },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  cavalos: {
    key: "cavalos",
    table: "cavalos",
    title: "Cadastro de Cavalos",
    singular: "Cavalo",
    defaultOrder: "placa",
    fields: [
      { name: "placa", label: "Placa", type: "text", required: true, showInTable: true },
      { name: "marca", label: "Marca", type: "text", showInTable: true },
      { name: "modelo", label: "Modelo", type: "text", showInTable: true },
      { name: "ano", label: "Ano", type: "number", showInTable: true },
      { name: "cor", label: "Cor", type: "text" },
      { name: "chassi", label: "Chassi", type: "text" },
      { name: "renavam", label: "Renavam", type: "text" },
      { name: "km_atual", label: "KM Atual", type: "number" },
      { name: "empresa_id", label: "Empresa", type: "ref", refTable: "empresas", refLabel: "razao_social", showInTable: true },
      { name: "status", label: "Status", type: "select", options: ["ativo","inativo","manutencao"].map(v=>({value:v,label:v})), showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  carretas: {
    key: "carretas",
    table: "carretas",
    title: "Cadastro de Carretas",
    singular: "Carreta",
    defaultOrder: "placa",
    fields: [
      { name: "placa", label: "Placa", type: "text", required: true, showInTable: true },
      { name: "tipo", label: "Tipo", type: "select", options: [{ value: "Bau", label: "Baú" }] },
      { name: "eixos", label: "Eixos", type: "select", options: [{ value: "2", label: "2 eixos" }, { value: "3", label: "3 eixos" }], showInTable: true },
      { name: "marca", label: "Marca", type: "text", showInTable: true },
      { name: "modelo", label: "Modelo", type: "text" },
      { name: "ano", label: "Ano", type: "number", showInTable: true },
      { name: "condicao", label: "Condição", type: "select", options: [{value:"nova",label:"Nova"},{value:"semi-nova",label:"Semi-nova"}], required: true, showInTable: true },
      { name: "data_liberacao", label: "Data de Liberação", type: "date", showInTable: true },
      { name: "chassi", label: "Chassi", type: "text" },
      { name: "renavam", label: "Renavam", type: "text" },
      { name: "empresa_id", label: "Empresa", type: "ref", refTable: "empresas", refLabel: "razao_social", showInTable: true },
      { name: "status", label: "Status", type: "select", options: ["ativa","inativa","manutencao"].map(v=>({value:v,label:v})), showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  conjuntos: {
    key: "conjuntos",
    table: "conjuntos",
    title: "Gestão de Conjuntos",
    singular: "Conjunto",
    defaultOrder: "created_at",
    fields: [
      { name: "cavalo_id", label: "Cavalo", type: "ref", refTable: "cavalos", refLabel: "placa", required: true, showInTable: true },
      { name: "carreta_id", label: "Carreta", type: "ref", refTable: "carretas", refLabel: "placa", required: true, showInTable: true },
      { name: "motorista_id", label: "Motorista", type: "ref", refTable: "motoristas", refLabel: "nome", required: true, showInTable: true },
    ],
  },
  tecnologias: {
    key: "tecnologias",
    table: "tecnologias",
    title: "Tecnologias Embarcadas",
    singular: "Tecnologia",
    defaultOrder: "tipo",
    fields: [
      { name: "tipo", label: "Tipo", type: "select", required: true,
        options: [
          { value: "autotrac", label: "Autotrac" },
          { value: "sascar", label: "Sascar" },
          { value: "omnilink", label: "Omnilink" },
          { value: "onixsat", label: "Onixsat" },
        ], showInTable: true },
      { name: "numero_equipamento", label: "Nº do Equipamento", type: "text", showInTable: true },
      { name: "cavalo_id", label: "Cavalo", type: "ref", refTable: "cavalos", refLabel: "placa", showInTable: true },
      { name: "usuario", label: "Usuário", type: "text" },
      { name: "senha", label: "Senha", type: "password" },
      { name: "segunda_tecnologia", label: "Segunda Tecnologia", type: "select",
        options: [{ value: "3S", label: "3S" }, { value: "T4S", label: "T4S" }], showInTable: true },
      { name: "usuario2", label: "Usuário (2ª Tec.)", type: "text" },
      { name: "senha2", label: "Senha (2ª Tec.)", type: "password" },
      { name: "trava_5a_roda", label: "Trava 5ª Roda", type: "boolean", showInTable: true },
      { name: "camera", label: "Câmera", type: "boolean", showInTable: true },
      { name: "data_instalacao", label: "Instalação", type: "date", showInTable: true },
      { name: "status", label: "Status", type: "select",
        options: ["ativo","inativo","retirado"].map(v=>({value:v,label:v})), showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  tacografos: {
    key: "tacografos",
    table: "tacografos",
    title: "Controle de Tacógrafo",
    singular: "Tacógrafo",
    defaultOrder: "validade_afericao",
    fields: [
      { name: "cavalo_id", label: "Cavalo", type: "ref", refTable: "cavalos", refLabel: "placa", required: true, showInTable: true },
      { name: "marca", label: "Marca", type: "text", showInTable: true },
      { name: "modelo", label: "Modelo", type: "text" },
      { name: "numero_serie", label: "Nº de Série", type: "text", showInTable: true },
      { name: "data_afericao", label: "Data Aferição", type: "date" },
      { name: "validade_afericao", label: "Validade Aferição", type: "date", showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  seguros: {
    key: "seguros",
    table: "seguros",
    title: "Controle de Seguros",
    singular: "Seguro",
    defaultOrder: "fim",
    fields: [
      { name: "tipo", label: "Tipo", type: "select", required: true,
        options: ["frota","rcfv","rctrc","casco","vida"].map(v=>({value:v,label:v.toUpperCase()})), showInTable: true },
      { name: "apolice", label: "Apólice", type: "text", showInTable: true },
      { name: "seguradora", label: "Seguradora", type: "text", showInTable: true },
      { name: "inicio", label: "Início", type: "date" },
      { name: "fim", label: "Vencimento", type: "date", showInTable: true },
      { name: "valor", label: "Valor", type: "money", showInTable: true },
      { name: "empresa_id", label: "Empresa", type: "ref", refTable: "empresas", refLabel: "razao_social" },
      { name: "cavalo_id", label: "Cavalo", type: "ref", refTable: "cavalos", refLabel: "placa" },
      { name: "carreta_id", label: "Carreta", type: "ref", refTable: "carretas", refLabel: "placa" },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  manutencoes: {
    key: "manutencoes",
    table: "manutencoes",
    title: "Gestão de Manutenções",
    singular: "Manutenção",
    defaultOrder: "data",
    fields: [
      { name: "data", label: "Data", type: "date", required: true, showInTable: true },
      { name: "tipo", label: "Tipo", type: "select",
        options: ["Preventiva","Corretiva","Revisão","Pneus","Elétrica","Mecânica"].map(v=>({value:v,label:v})), showInTable: true },
      { name: "carreta_id", label: "Carreta", type: "ref", refTable: "carretas", refLabel: "placa", required: true, showInTable: true },
      { name: "km", label: "KM", type: "number" },
      { name: "custo", label: "Custo", type: "money", showInTable: true },
      { name: "oficina", label: "Oficina", type: "text", showInTable: true },
      { name: "descricao", label: "Descrição", type: "textarea" },
    ],
  },
  advertencias: {
    key: "advertencias",
    table: "advertencias",
    title: "Advertências",
    singular: "Advertência",
    defaultOrder: "data",
    fields: [
      { name: "motorista_id", label: "Motorista", type: "ref", refTable: "motoristas", refLabel: "nome", required: true, showInTable: true },
      { name: "data", label: "Data", type: "date", required: true, showInTable: true },
      { name: "motivo", label: "Motivo", type: "text", required: true, showInTable: true },
      { name: "gravidade", label: "Gravidade", type: "select",
        options: ["leve","media","grave"].map(v=>({value:v,label:v[0].toUpperCase()+v.slice(1)})), showInTable: true },
      { name: "ativa", label: "Ativa", type: "boolean", showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  acidentes_sinistros: {
    key: "acidentes_sinistros",
    table: "acidentes_sinistros",
    title: "Acidentes e Sinistros",
    singular: "Acidente / Sinistro",
    defaultOrder: "data",
    fields: [
      { name: "data", label: "Data", type: "date", required: true, showInTable: true },
      { name: "motorista_id", label: "Motorista", type: "ref", refTable: "motoristas", refLabel: "nome", showInTable: true },
      { name: "cavalo_id", label: "Cavalo", type: "ref", refTable: "cavalos", refLabel: "placa", showInTable: true },
      { name: "carreta_id", label: "Carreta", type: "ref", refTable: "carretas", refLabel: "placa" },
      { name: "local", label: "Local", type: "text", showInTable: true },
      { name: "descricao", label: "Descrição", type: "textarea" },
      { name: "custo", label: "Custo", type: "money", showInTable: true },
      { name: "boletim", label: "Boletim", type: "text" },
      { name: "status", label: "Status", type: "select",
        options: ["aberto","em_analise","concluido"].map(v=>({value:v,label:v.replace("_"," ")})), showInTable: true },
    ],
  },
  bloqueios: {
    key: "bloqueios",
    table: "bloqueios",
    title: "Bloqueios",
    singular: "Bloqueio",
    defaultOrder: "data_inicio",
    fields: [
      { name: "entidade_tipo", label: "Tipo de Entidade", type: "select", required: true,
        options: ["empresa","motorista","cavalo","carreta","conjunto","agregado"].map(v=>({value:v,label:v[0].toUpperCase()+v.slice(1)})), showInTable: true },
      { name: "entidade_nome", label: "Identificação", type: "text", required: true, showInTable: true },
      { name: "entidade_id", label: "ID da Entidade", type: "text", required: true },
      { name: "motivo", label: "Motivo", type: "text", required: true, showInTable: true },
      { name: "data_inicio", label: "Início", type: "date", showInTable: true },
      { name: "data_fim", label: "Fim", type: "date", showInTable: true },
      { name: "ativo", label: "Ativo", type: "boolean", showInTable: true },
    ],
  },
  fila_agregados: {
    key: "fila_agregados",
    table: "fila_agregados",
    title: "Fila de Agregados",
    singular: "Agregado",
    defaultOrder: "posicao",
    fields: [
      { name: "posicao", label: "Posição", type: "number", showInTable: true },
      { name: "nome", label: "Nome", type: "text", required: true, showInTable: true },
      { name: "documento", label: "CPF/CNPJ", type: "text", showInTable: true },
      { name: "telefone", label: "Telefone", type: "text", showInTable: true },
      { name: "email", label: "E-mail", type: "text" },
      { name: "cidade", label: "Cidade", type: "text", showInTable: true },
      { name: "uf", label: "UF", type: "text" },
      { name: "veiculo", label: "Veículo", type: "text", showInTable: true },
      { name: "status", label: "Status", type: "select",
        options: ["aguardando","em_analise","aprovado","reprovado"].map(v=>({value:v,label:v.replace("_"," ")})), showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  documentos: {
    key: "documentos",
    table: "documentos",
    title: "Central de Documentos",
    singular: "Documento",
    defaultOrder: "validade",
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true, showInTable: true },
      { name: "tipo", label: "Tipo", type: "text", showInTable: true },
      { name: "entidade_tipo", label: "Relacionado a", type: "select", required: true,
        options: ["empresa","motorista","cavalo","carreta","conjunto","tecnologia","tacografo","seguro","agregado"].map(v=>({value:v,label:v[0].toUpperCase()+v.slice(1)})), showInTable: true },
      { name: "entidade_id", label: "ID da Entidade", type: "text" },
      { name: "url", label: "URL do Arquivo", type: "text" },
      { name: "validade", label: "Validade", type: "date", showInTable: true },
      { name: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
};

export const FAB_QUICK_ITEMS: { key: string; label: string }[] = [
  { key: "empresas", label: "Empresa" },
  { key: "motoristas", label: "Motorista" },
  { key: "cavalos", label: "Cavalo" },
  { key: "carretas", label: "Carreta" },
  { key: "conjuntos", label: "Conjunto" },
  { key: "tecnologias", label: "Tecnologia" },
  { key: "tacografos", label: "Tacógrafo" },
  { key: "seguros", label: "Seguro" },
  { key: "manutencoes", label: "Manutenção" },
  { key: "advertencias", label: "Advertência" },
  { key: "acidentes_sinistros", label: "Acidente" },
  { key: "documentos", label: "Documento" },
];

export function buildSchema(def: ResourceDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of def.fields) {
    let s: z.ZodTypeAny;
    switch (f.type) {
      case "number":
      case "money":
        s = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().nullable());
        break;
      case "boolean":
        s = z.boolean().nullable();
        break;
      default:
        s = z.preprocess((v) => (v === "" ? null : v), z.string().nullable());
    }
    if (f.required) {
      s = s.refine((v) => v !== null && v !== undefined && v !== "", { message: "Obrigatório" });
    }
    shape[f.name] = s;
  }
  return z.object(shape);
}
