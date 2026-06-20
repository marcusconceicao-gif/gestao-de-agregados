export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acidentes_sinistros: {
        Row: {
          boletim: string | null
          carreta_id: string | null
          cavalo_id: string | null
          created_at: string
          custo: number | null
          data: string
          descricao: string | null
          id: string
          local: string | null
          motorista_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          boletim?: string | null
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          local?: string | null
          motorista_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          boletim?: string | null
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          local?: string | null
          motorista_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acidentes_sinistros_carreta_id_fkey"
            columns: ["carreta_id"]
            isOneToOne: false
            referencedRelation: "carretas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acidentes_sinistros_cavalo_id_fkey"
            columns: ["cavalo_id"]
            isOneToOne: false
            referencedRelation: "cavalos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acidentes_sinistros_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      advertencias: {
        Row: {
          ativa: boolean
          created_at: string
          data: string
          gravidade: string
          id: string
          motivo: string
          motorista_id: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          data?: string
          gravidade?: string
          id?: string
          motivo: string
          motorista_id: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          data?: string
          gravidade?: string
          id?: string
          motivo?: string
          motorista_id?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertencias_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueios: {
        Row: {
          ativo: boolean
          created_at: string
          data_fim: string | null
          data_inicio: string
          entidade_id: string
          entidade_nome: string | null
          entidade_tipo: Database["public"]["Enums"]["entidade_tipo"]
          id: string
          motivo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          entidade_id: string
          entidade_nome?: string | null
          entidade_tipo: Database["public"]["Enums"]["entidade_tipo"]
          id?: string
          motivo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          entidade_id?: string
          entidade_nome?: string | null
          entidade_tipo?: Database["public"]["Enums"]["entidade_tipo"]
          id?: string
          motivo?: string
          updated_at?: string
        }
        Relationships: []
      }
      carretas: {
        Row: {
          ano: number | null
          chassi: string | null
          condicao: string
          created_at: string
          data_liberacao: string | null
          eixos: number | null
          empresa_id: string | null
          id: string
          marca: string | null
          modelo: string | null
          observacoes: string | null
          placa: string
          renavam: string | null
          status: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          chassi?: string | null
          condicao?: string
          created_at?: string
          data_liberacao?: string | null
          eixos?: number | null
          empresa_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa: string
          renavam?: string | null
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          chassi?: string | null
          condicao?: string
          created_at?: string
          data_liberacao?: string | null
          eixos?: number | null
          empresa_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string
          renavam?: string | null
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carretas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cavalos: {
        Row: {
          ano: number | null
          chassi: string | null
          cor: string | null
          created_at: string
          empresa_id: string | null
          id: string
          km_atual: number | null
          marca: string | null
          modelo: string | null
          observacoes: string | null
          placa: string
          renavam: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          chassi?: string | null
          cor?: string | null
          created_at?: string
          empresa_id?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa: string
          renavam?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          chassi?: string | null
          cor?: string | null
          created_at?: string
          empresa_id?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string
          renavam?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cavalos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      conjuntos: {
        Row: {
          ativo: boolean
          carreta_id: string | null
          carreta2_id: string | null
          cavalo_id: string | null
          created_at: string
          id: string
          motorista_id: string | null
          nome: string | null
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          carreta_id?: string | null
          carreta2_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          id?: string
          motorista_id?: string | null
          nome?: string | null
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          carreta_id?: string | null
          carreta2_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          id?: string
          motorista_id?: string | null
          nome?: string | null
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conjuntos_carreta_id_fkey"
            columns: ["carreta_id"]
            isOneToOne: false
            referencedRelation: "carretas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conjuntos_carreta2_id_fkey"
            columns: ["carreta2_id"]
            isOneToOne: false
            referencedRelation: "carretas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conjuntos_cavalo_id_fkey"
            columns: ["cavalo_id"]
            isOneToOne: false
            referencedRelation: "cavalos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conjuntos_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          created_at: string
          entidade_id: string | null
          entidade_tipo: Database["public"]["Enums"]["entidade_tipo"]
          id: string
          nome: string
          observacoes: string | null
          tipo: string | null
          updated_at: string
          url: string | null
          validade: string | null
        }
        Insert: {
          created_at?: string
          entidade_id?: string | null
          entidade_tipo: Database["public"]["Enums"]["entidade_tipo"]
          id?: string
          nome: string
          observacoes?: string | null
          tipo?: string | null
          updated_at?: string
          url?: string | null
          validade?: string | null
        }
        Update: {
          created_at?: string
          entidade_id?: string | null
          entidade_tipo?: Database["public"]["Enums"]["entidade_tipo"]
          id?: string
          nome?: string
          observacoes?: string | null
          tipo?: string | null
          updated_at?: string
          url?: string | null
          validade?: string | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          ativa: boolean
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          ie: string | null
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          telefone: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          ie?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          ie?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fila_agregados: {
        Row: {
          cidade: string | null
          created_at: string
          documento: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          posicao: number | null
          status: string
          telefone: string | null
          uf: string | null
          updated_at: string
          veiculo: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          posicao?: number | null
          status?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          posicao?: number | null
          status?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Relationships: []
      }
      integracoes: {
        Row: {
          assinatura: string | null
          checklist_rastreador: boolean
          checklist_rastreador_obs: string | null
          checklist_visual: boolean
          checklist_visual_obs: string | null
          contato: string | null
          created_at: string
          created_by: string | null
          data: string
          datapar: boolean
          datapar_obs: string | null
          documentacao_carreta: boolean
          documentacao_carreta_obs: string | null
          email: boolean
          email_obs: string | null
          id: string
          kit: boolean
          kit_obs: string | null
          motorista_programacao: boolean
          motorista_programacao_obs: string | null
          nome_motorista: string
          observacoes: string | null
          placa_carreta: string | null
          placa_cavalo: string | null
          planilha_status: boolean
          planilha_status_obs: string | null
          responsavel: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assinatura?: string | null
          checklist_rastreador?: boolean
          checklist_rastreador_obs?: string | null
          checklist_visual?: boolean
          checklist_visual_obs?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          datapar?: boolean
          datapar_obs?: string | null
          documentacao_carreta?: boolean
          documentacao_carreta_obs?: string | null
          email?: boolean
          email_obs?: string | null
          id?: string
          kit?: boolean
          kit_obs?: string | null
          motorista_programacao?: boolean
          motorista_programacao_obs?: string | null
          nome_motorista: string
          observacoes?: string | null
          placa_carreta?: string | null
          placa_cavalo?: string | null
          planilha_status?: boolean
          planilha_status_obs?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assinatura?: string | null
          checklist_rastreador?: boolean
          checklist_rastreador_obs?: string | null
          checklist_visual?: boolean
          checklist_visual_obs?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          datapar?: boolean
          datapar_obs?: string | null
          documentacao_carreta?: boolean
          documentacao_carreta_obs?: string | null
          email?: boolean
          email_obs?: string | null
          id?: string
          kit?: boolean
          kit_obs?: string | null
          motorista_programacao?: boolean
          motorista_programacao_obs?: string | null
          nome_motorista?: string
          observacoes?: string | null
          placa_carreta?: string | null
          placa_cavalo?: string | null
          planilha_status?: boolean
          planilha_status_obs?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      manutencoes: {
        Row: {
          carreta_id: string | null
          cavalo_id: string | null
          created_at: string
          custo: number | null
          data: string
          descricao: string | null
          id: string
          km: number | null
          oficina: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          km?: number | null
          oficina?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          km?: number | null
          oficina?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_carreta_id_fkey"
            columns: ["carreta_id"]
            isOneToOne: false
            referencedRelation: "carretas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manutencoes_cavalo_id_fkey"
            columns: ["cavalo_id"]
            isOneToOne: false
            referencedRelation: "cavalos"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          cidade: string | null
          cnh_categoria: string | null
          cnh_numero: string | null
          cnh_validade: string | null
          cpf: string | null
          created_at: string
          email: string | null
          empresa_id: string | null
          endereco: string | null
          id: string
          mopp_validade: string | null
          nome: string
          observacoes: string | null
          rg: string | null
          status: string
          telefone: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          mopp_validade?: string | null
          nome: string
          observacoes?: string | null
          rg?: string | null
          status?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          mopp_validade?: string | null
          nome?: string
          observacoes?: string | null
          rg?: string | null
          status?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motoristas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      seguros: {
        Row: {
          apolice: string | null
          carreta_id: string | null
          cavalo_id: string | null
          created_at: string
          empresa_id: string | null
          fim: string | null
          id: string
          inicio: string | null
          observacoes: string | null
          seguradora: string | null
          tipo: Database["public"]["Enums"]["seguro_tipo"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          apolice?: string | null
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          empresa_id?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          observacoes?: string | null
          seguradora?: string | null
          tipo: Database["public"]["Enums"]["seguro_tipo"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          apolice?: string | null
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          empresa_id?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          observacoes?: string | null
          seguradora?: string | null
          tipo?: Database["public"]["Enums"]["seguro_tipo"]
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seguros_carreta_id_fkey"
            columns: ["carreta_id"]
            isOneToOne: false
            referencedRelation: "carretas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguros_cavalo_id_fkey"
            columns: ["cavalo_id"]
            isOneToOne: false
            referencedRelation: "cavalos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      tacografos: {
        Row: {
          cavalo_id: string | null
          created_at: string
          data_afericao: string | null
          id: string
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          observacoes: string | null
          updated_at: string
          validade_afericao: string | null
        }
        Insert: {
          cavalo_id?: string | null
          created_at?: string
          data_afericao?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          updated_at?: string
          validade_afericao?: string | null
        }
        Update: {
          cavalo_id?: string | null
          created_at?: string
          data_afericao?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          updated_at?: string
          validade_afericao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tacografos_cavalo_id_fkey"
            columns: ["cavalo_id"]
            isOneToOne: false
            referencedRelation: "cavalos"
            referencedColumns: ["id"]
          },
        ]
      }
      tecnologias: {
        Row: {
          carreta_id: string | null
          cavalo_id: string | null
          created_at: string
          data_instalacao: string | null
          id: string
          numero_equipamento: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          status: string
          tipo: Database["public"]["Enums"]["tecnologia_tipo"]
          ultima_manutencao: string | null
          updated_at: string
        }
        Insert: {
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          data_instalacao?: string | null
          id?: string
          numero_equipamento?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string
          tipo: Database["public"]["Enums"]["tecnologia_tipo"]
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Update: {
          carreta_id?: string | null
          cavalo_id?: string | null
          created_at?: string
          data_instalacao?: string | null
          id?: string
          numero_equipamento?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string
          tipo?: Database["public"]["Enums"]["tecnologia_tipo"]
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tecnologias_carreta_id_fkey"
            columns: ["carreta_id"]
            isOneToOne: false
            referencedRelation: "carretas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tecnologias_cavalo_id_fkey"
            columns: ["cavalo_id"]
            isOneToOne: false
            referencedRelation: "cavalos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      alertas_v: {
        Row: {
          descricao: string | null
          entidade_id: string | null
          entidade_nome: string | null
          entidade_tipo: string | null
          id: string | null
          severidade: string | null
          tipo: string | null
          vence_em: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_write: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "operacional" | "consulta"
      entidade_tipo:
        | "empresa"
        | "motorista"
        | "cavalo"
        | "carreta"
        | "conjunto"
        | "tecnologia"
        | "tacografo"
        | "seguro"
        | "manutencao"
        | "advertencia"
        | "acidente"
        | "documento"
        | "bloqueio"
        | "agregado"
      seguro_tipo: "frota" | "rcfv" | "rctrc" | "casco" | "vida"
      severidade: "info" | "aviso" | "critico"
      tecnologia_tipo: "autotrac" | "sascar" | "omnilink" | "onixsat"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operacional", "consulta"],
      entidade_tipo: [
        "empresa",
        "motorista",
        "cavalo",
        "carreta",
        "conjunto",
        "tecnologia",
        "tacografo",
        "seguro",
        "manutencao",
        "advertencia",
        "acidente",
        "documento",
        "bloqueio",
        "agregado",
      ],
      seguro_tipo: ["frota", "rcfv", "rctrc", "casco", "vida"],
      severidade: ["info", "aviso", "critico"],
      tecnologia_tipo: ["autotrac", "sascar", "omnilink", "onixsat"],
    },
  },
} as const
