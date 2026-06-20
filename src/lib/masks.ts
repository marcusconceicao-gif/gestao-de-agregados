// Máscaras BR para inputs de cadastro.
export type MaskKind = "cpf" | "cnpj" | "cpf_cnpj" | "telefone" | "cep" | "placa" | "rg" | null;

export function detectMask(fieldName: string): MaskKind {
  const n = fieldName.toLowerCase();
  if (n === "cpf") return "cpf";
  if (n === "cnpj") return "cnpj";
  if (n === "documento") return "cpf_cnpj";
  if (n === "telefone" || n === "celular" || n === "fone") return "telefone";
  if (n === "cep") return "cep";
  if (n === "placa") return "placa";
  if (n === "rg") return "rg";
  return null;
}

const onlyDigits = (s: string) => s.replace(/\D/g, "");
const alnum = (s: string) => s.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

export function applyMask(kind: MaskKind, raw: string): string {
  if (!kind || !raw) return raw ?? "";
  switch (kind) {
    case "cpf": {
      const v = onlyDigits(raw).slice(0, 11);
      return v
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
    }
    case "cnpj": {
      const v = onlyDigits(raw).slice(0, 14);
      return v
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    case "cpf_cnpj": {
      const v = onlyDigits(raw);
      return applyMask(v.length <= 11 ? "cpf" : "cnpj", v);
    }
    case "telefone": {
      const v = onlyDigits(raw).slice(0, 11);
      if (v.length <= 10) {
        return v
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2");
      }
      return v
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    case "cep": {
      const v = onlyDigits(raw).slice(0, 8);
      return v.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    case "placa": {
      const v = alnum(raw).slice(0, 7);
      if (v.length <= 3) return v;
      return `${v.slice(0, 3)}-${v.slice(3)}`;
    }
    case "rg":
      return raw.toUpperCase().slice(0, 20);
    default:
      return raw;
  }
}

export function validateMasked(kind: MaskKind, raw: string): string | null {
  if (!kind || !raw) return null;
  const d = onlyDigits(raw);
  if (kind === "cpf" && d.length > 0 && d.length !== 11) return "CPF deve ter 11 dígitos";
  if (kind === "cnpj" && d.length > 0 && d.length !== 14) return "CNPJ deve ter 14 dígitos";
  if (kind === "cpf_cnpj" && d.length > 0 && d.length !== 11 && d.length !== 14) return "CPF ou CNPJ inválido";
  if (kind === "telefone" && d.length > 0 && d.length < 10) return "Telefone incompleto";
  if (kind === "cep" && d.length > 0 && d.length !== 8) return "CEP deve ter 8 dígitos";
  if (kind === "placa") {
    const v = alnum(raw);
    if (v.length > 0 && v.length !== 7) return "Placa deve ter 7 caracteres";
  }
  return null;
}
