// Mapeia erros do banco/Supabase para mensagens amigáveis em PT-BR
// sem expor nomes de tabelas, colunas ou constraints.

type AnyError = { code?: string; message?: string; status?: number } | null | undefined;

const CODE_MAP: Record<string, string> = {
  "23505": "Registro duplicado: já existe um cadastro com esses dados.",
  "23502": "Campo obrigatório não preenchido.",
  "23503": "Operação inválida: existe(m) registro(s) vinculado(s).",
  "23514": "Valor informado não atende às regras de validação.",
  "22001": "Texto informado excede o tamanho máximo permitido.",
  "22P02": "Formato de dado inválido.",
  "42501": "Você não tem permissão para executar esta ação.",
  "PGRST301": "Sessão expirada. Faça login novamente.",
  "PGRST116": "Registro não encontrado.",
};

const AUTH_MAP: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail antes de entrar."],
  [/user already registered/i, "Este e-mail já está cadastrado."],
  [/password should be at least/i, "A senha não atende aos requisitos mínimos."],
  [/rate limit/i, "Muitas tentativas. Aguarde alguns instantes e tente novamente."],
  [/pwned|leaked|compromised/i, "Esta senha foi exposta em vazamentos. Escolha outra."],
];

export function friendlyDbError(err: AnyError, fallback = "Ocorreu um erro. Tente novamente."): string {
  if (!err) return fallback;
  // Log completo apenas no console do dev (não vai pro usuário final)
  if (typeof console !== "undefined") console.error("[db-error]", err);

  const code = err.code;
  if (code && CODE_MAP[code]) return CODE_MAP[code];

  const msg = err.message ?? "";
  for (const [re, friendly] of AUTH_MAP) if (re.test(msg)) return friendly;

  if (err.status === 401 || err.status === 403) {
    return "Você não tem permissão para executar esta ação.";
  }
  return fallback;
}
