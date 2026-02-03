// Tipos do Módulo Imobiliário

export type AnuncianteTipo = 'corretor' | 'imobiliaria';
export type AnunciantePlano = 'free' | 'pro' | 'partner';
export type ImovelFinalidade = 'venda' | 'aluguel' | 'venda_aluguel';
export type ImovelTipo = 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'chacara' | 'cobertura' | 'studio' | 'kitnet' | 'galpao' | 'sala_comercial';
export type ImovelStatus = 'rascunho' | 'pendente' | 'ativo' | 'vendido' | 'alugado' | 'inativo';
export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'visita_agendada' | 'proposta' | 'fechado' | 'perdido';
export type LeadIntencao = 'comprar' | 'alugar' | 'investir' | 'avaliar';

export interface Anunciante {
  id: string;
  user_id?: string;
  tenant_id?: string;
  tipo: AnuncianteTipo;
  nome: string;
  creci?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  logo_url?: string;
  capa_url?: string;
  cidade_base?: string;
  bairros_atuacao?: string[];
  plano: AnunciantePlano;
  sobre_html?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  is_verified: boolean;
  is_active: boolean;
  total_imoveis: number;
  total_leads: number;
  rating_avg: number;
  rating_count: number;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface BairroGuia {
  id: string;
  tenant_id?: string;
  cidade: string;
  nome: string;
  slug: string;
  descricao_html?: string;
  perfil_publico?: string;
  infraestrutura?: string;
  mobilidade?: string;
  seguranca?: string;
  escolas?: string;
  lazer?: string;
  comercio?: string;
  faixa_preco_venda_min?: number;
  faixa_preco_venda_max?: number;
  faixa_preco_aluguel_min?: number;
  faixa_preco_aluguel_max?: number;
  imagem_capa?: string;
  galeria?: string[];
  lat?: number;
  lng?: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Imovel {
  id: string;
  tenant_id?: string;
  anunciante_id?: string;
  codigo?: string;
  titulo: string;
  slug: string;
  finalidade: ImovelFinalidade;
  tipo: ImovelTipo;
  cidade: string;
  bairro: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  lat?: number;
  lng?: number;
  mostrar_endereco_exato: boolean;
  preco?: number;
  preco_anterior?: number;
  preco_m2?: number;
  condominio_valor?: number;
  iptu_valor?: number;
  area_construida?: number;
  area_terreno?: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  features: string[];
  proximidades: string[];
  video_url?: string;
  tour_360_url?: string;
  descricao_html?: string;
  status: ImovelStatus;
  destaque: boolean;
  lancamento: boolean;
  aceita_financiamento: boolean;
  aceita_permuta: boolean;
  is_condominio: boolean;
  seo_title?: string;
  seo_description?: string;
  views_count: number;
  leads_count: number;
  favoritos_count: number;
  external_id?: string;
  external_source?: string;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  anunciante?: Anunciante;
  imagens?: ImagemImovel[];
}

export interface ImagemImovel {
  id: string;
  imovel_id: string;
  url: string;
  alt?: string;
  ordem: number;
  is_capa: boolean;
  created_at: string;
}

export interface LeadImovel {
  id: string;
  tenant_id?: string;
  imovel_id?: string;
  anunciante_id?: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  mensagem?: string;
  intencao: LeadIntencao;
  prazo?: string;
  orcamento?: number;
  origem?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  pagina_origem?: string;
  ip_hash?: string;
  status: LeadStatus;
  notas?: string;
  contatado_at?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  imovel?: Imovel;
  anunciante?: Anunciante;
}

export interface FavoritoImovel {
  id: string;
  user_id: string;
  imovel_id: string;
  created_at: string;
}

export interface BuscaSalva {
  id: string;
  user_id: string;
  tenant_id?: string;
  nome: string;
  filtros: ImovelFilters;
  notificar: boolean;
  created_at: string;
}

// Filtros de busca
export interface ImovelFilters {
  finalidade?: ImovelFinalidade;
  tipo?: ImovelTipo[];
  cidade?: string;
  bairro?: string[];
  preco_min?: number;
  preco_max?: number;
  quartos_min?: number;
  quartos_max?: number;
  banheiros_min?: number;
  vagas_min?: number;
  area_min?: number;
  area_max?: number;
  is_condominio?: boolean;
  aceita_financiamento?: boolean;
  destaque?: boolean;
  lancamento?: boolean;
  ordenar?: 'recentes' | 'menor_preco' | 'maior_preco' | 'maior_area' | 'destaque';
  busca?: string;
}

// Labels para exibição
export const TIPO_LABELS: Record<ImovelTipo, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  comercial: 'Comercial',
  chacara: 'Chácara',
  cobertura: 'Cobertura',
  studio: 'Studio',
  kitnet: 'Kitnet',
  galpao: 'Galpão',
  sala_comercial: 'Sala Comercial',
};

export const FINALIDADE_LABELS: Record<ImovelFinalidade, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  venda_aluguel: 'Venda ou Aluguel',
};

export const STATUS_LABELS: Record<ImovelStatus, string> = {
  rascunho: 'Rascunho',
  pendente: 'Pendente',
  ativo: 'Ativo',
  vendido: 'Vendido',
  alugado: 'Alugado',
  inativo: 'Inativo',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  visita_agendada: 'Visita Agendada',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export const PLANO_LABELS: Record<AnunciantePlano, string> = {
  free: 'Gratuito',
  pro: 'Profissional',
  partner: 'Parceiro',
};

// Features comuns de imóveis
export const FEATURES_COMUNS = [
  'Piscina',
  'Churrasqueira',
  'Área de Lazer',
  'Academia',
  'Salão de Festas',
  'Playground',
  'Portaria 24h',
  'Segurança',
  'Elevador',
  'Varanda',
  'Área de Serviço',
  'Cozinha Americana',
  'Armários Embutidos',
  'Ar Condicionado',
  'Aquecedor Solar',
  'Quintal',
  'Jardim',
  'Escritório',
  'Home Office',
  'Pet Friendly',
];

export const PROXIMIDADES_COMUNS = [
  'Escolas',
  'Supermercados',
  'Farmácias',
  'Hospitais',
  'Transporte Público',
  'Parques',
  'Shopping',
  'Restaurantes',
  'Bancos',
  'Academia',
];
