/**
 * White Label Dashboard: Perfis e Módulos
 * Sistema de configuração por tenant para experiência personalizada
 */

// ============================================
// PERFIS DE USUÁRIO
// ============================================

export const USER_PROFILES = {
  JORNALISTA: 'JORNALISTA',
  INFLUENCER: 'INFLUENCER',
  IGREJA: 'IGREJA',
  RADIO_TV: 'RADIO_TV',
  EDUCADOR: 'EDUCADOR',
  GERACAO_COTIA: 'GERACAO_COTIA',
} as const;

export type UserProfile = typeof USER_PROFILES[keyof typeof USER_PROFILES];

export const ALL_PROFILES: UserProfile[] = Object.values(USER_PROFILES);

// Metadados de perfis para UI
export interface ProfileMetadata {
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export const PROFILE_METADATA: Record<UserProfile, ProfileMetadata> = {
  JORNALISTA: {
    label: 'Jornalista',
    description: 'Portal de notícias e conteúdo editorial',
    icon: 'Newspaper',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
  },
  INFLUENCER: {
    label: 'Influencer',
    description: 'Criador de conteúdo e redes sociais',
    icon: 'Sparkles',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
  },
  IGREJA: {
    label: 'Igreja',
    description: 'Comunidade religiosa e ministérios',
    icon: 'Church',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
  },
  RADIO_TV: {
    label: 'Rádio/TV',
    description: 'Emissora e transmissões ao vivo',
    icon: 'Radio',
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
  },
  EDUCADOR: {
    label: 'Educador',
    description: 'Plataforma educacional e cursos',
    icon: 'GraduationCap',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
  },
  GERACAO_COTIA: {
    label: 'Geração Cotia',
    description: 'Programa educacional com gamificação',
    icon: 'Medal',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
  },
};

// ============================================
// MÓDULOS DO SISTEMA
// ============================================

export const SYSTEM_MODULES = {
  NEWSROOM: 'NEWSROOM',
  SEO_TOOLS: 'SEO_TOOLS',
  WEBRADIO_TV: 'WEBRADIO_TV',
  STUDIO_LIVE: 'STUDIO_LIVE',
  VIP_COMMUNITY: 'VIP_COMMUNITY',
  GERACAO_COTIA: 'GERACAO_COTIA',
  MARKETPLACE_LOCAL: 'MARKETPLACE_LOCAL',
  CLASSIFIEDS: 'CLASSIFIEDS',
  JOBS: 'JOBS',
  DONATIONS: 'DONATIONS',
  AUTOPOST: 'AUTOPOST',
} as const;

export type SystemModule = typeof SYSTEM_MODULES[keyof typeof SYSTEM_MODULES];

export const ALL_MODULES: SystemModule[] = Object.values(SYSTEM_MODULES);

// Metadados de módulos para UI
export interface ModuleMetadata {
  label: string;
  description: string;
  icon: string;
  category: 'core' | 'content' | 'broadcast' | 'community' | 'commerce';
}

export const MODULE_METADATA: Record<SystemModule, ModuleMetadata> = {
  NEWSROOM: {
    label: 'Redação',
    description: 'Gerenciamento de notícias e conteúdo editorial',
    icon: 'FileText',
    category: 'core',
  },
  SEO_TOOLS: {
    label: 'Ferramentas SEO',
    description: 'Otimização para mecanismos de busca',
    icon: 'Search',
    category: 'content',
  },
  WEBRADIO_TV: {
    label: 'Web Rádio/TV',
    description: 'Streaming de áudio e vídeo ao vivo',
    icon: 'Radio',
    category: 'broadcast',
  },
  STUDIO_LIVE: {
    label: 'Estúdio ao Vivo',
    description: 'Transmissões ao vivo com múltiplos participantes',
    icon: 'Video',
    category: 'broadcast',
  },
  VIP_COMMUNITY: {
    label: 'Comunidade VIP',
    description: 'Hub exclusivo com ferramentas e trilhas',
    icon: 'Users',
    category: 'community',
  },
  GERACAO_COTIA: {
    label: 'Geração Cotia',
    description: 'Programa educacional com trilhas e gamificação',
    icon: 'Medal',
    category: 'community',
  },
  MARKETPLACE_LOCAL: {
    label: 'Marketplace Local',
    description: 'Guia comercial e parceiros locais',
    icon: 'Store',
    category: 'commerce',
  },
  CLASSIFIEDS: {
    label: 'Classificados',
    description: 'Anúncios de compra e venda',
    icon: 'Tag',
    category: 'commerce',
  },
  JOBS: {
    label: 'Empregos',
    description: 'Vagas de trabalho e oportunidades',
    icon: 'Briefcase',
    category: 'commerce',
  },
  DONATIONS: {
    label: 'Doações',
    description: 'Sistema de doações e contribuições',
    icon: 'Heart',
    category: 'commerce',
  },
  AUTOPOST: {
    label: 'AutoPost',
    description: 'Importação automática de conteúdo',
    icon: 'Wand2',
    category: 'content',
  },
};

// ============================================
// MAPEAMENTO PERFIL -> MÓDULOS PADRÃO
// ============================================

export const PROFILE_DEFAULT_MODULES: Record<UserProfile, SystemModule[]> = {
  JORNALISTA: ['NEWSROOM', 'SEO_TOOLS', 'AUTOPOST'],
  INFLUENCER: ['NEWSROOM', 'STUDIO_LIVE', 'VIP_COMMUNITY'],
  IGREJA: ['NEWSROOM', 'WEBRADIO_TV', 'VIP_COMMUNITY', 'DONATIONS'],
  RADIO_TV: ['NEWSROOM', 'WEBRADIO_TV', 'STUDIO_LIVE'],
  EDUCADOR: ['NEWSROOM', 'VIP_COMMUNITY', 'STUDIO_LIVE'],
  GERACAO_COTIA: ['GERACAO_COTIA', 'VIP_COMMUNITY', 'NEWSROOM'],
};

// ============================================
// MAPEAMENTO ROTA -> MÓDULO REQUERIDO
// ============================================

export const ROUTE_MODULE_MAP: Record<string, SystemModule> = {
  // Broadcast
  '/admin/broadcast': 'WEBRADIO_TV',
  '/admin/streaming': 'WEBRADIO_TV',
  '/admin/conexao-studio': 'STUDIO_LIVE',
  '/admin/illumina-studio': 'STUDIO_LIVE',
  
  // Community
  '/vip': 'VIP_COMMUNITY',
  '/geracao-cotia': 'GERACAO_COTIA',
  
  // Commerce
  '/admin/classifieds': 'CLASSIFIEDS',
  '/admin/jobs': 'JOBS',
  '/admin/donations': 'DONATIONS',
  
  // AutoPost
  '/admin/autopost': 'AUTOPOST',
};

// ============================================
// MAPEAMENTO MENU -> MÓDULO (para filtrar sidebar)
// ============================================

export const MENU_MODULE_MAP: Record<string, SystemModule> = {
  // URLs que requerem módulos específicos
  '/admin/broadcast': 'WEBRADIO_TV',
  '/admin/streaming/radio': 'WEBRADIO_TV',
  '/admin/streaming/tv': 'WEBRADIO_TV',
  '/admin/conexao-studio': 'STUDIO_LIVE',
  '/admin/illumina-studio': 'STUDIO_LIVE',
  '/admin/autopost': 'AUTOPOST',
  '/admin/classifieds': 'CLASSIFIEDS',
  '/admin/jobs': 'JOBS',
};

// ============================================
// CARDS DE PRÓXIMOS PASSOS POR PERFIL
// ============================================

export interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  requiredModule?: SystemModule;
}

export const PROFILE_QUICK_ACTIONS: Record<UserProfile, QuickActionCard[]> = {
  JORNALISTA: [
    { id: 'create-news', title: 'Criar Notícia', description: 'Publique uma nova matéria', icon: 'PenLine', href: '/admin/news/new', color: 'blue' },
    { id: 'autopost-regional', title: 'Auto Post Regional', description: 'Notícias da Grande Cotia', icon: 'MapPin', href: '/admin/autopost-regional', color: 'amber', requiredModule: 'AUTOPOST' },
    { id: 'schedule', title: 'Agendar Publicação', description: 'Programe posts para o futuro', icon: 'Calendar', href: '/admin/news?status=draft', color: 'green' },
    { id: 'seo', title: 'Revisar SEO', description: 'Otimize seu conteúdo', icon: 'Search', href: '/admin/seo', color: 'purple', requiredModule: 'SEO_TOOLS' },
  ],
  INFLUENCER: [
    { id: 'quick-post', title: 'Post Rápido', description: 'Crie conteúdo em segundos', icon: 'Zap', href: '/admin/news/new', color: 'purple' },
    { id: 'studio', title: 'Estúdio ao Vivo', description: 'Inicie uma live', icon: 'Video', href: '/admin/conexao-studio', color: 'pink', requiredModule: 'STUDIO_LIVE' },
    { id: 'clips', title: 'Meus Clipes', description: 'Gerencie seus vídeos', icon: 'Film', href: '/admin/media', color: 'blue' },
    { id: 'links', title: 'Links & CTA', description: 'Configure suas chamadas', icon: 'Link', href: '/admin/bio', color: 'green' },
  ],
  IGREJA: [
    { id: 'devotional', title: 'Devocional', description: 'Publique reflexões diárias', icon: 'BookOpen', href: '/admin/news/new', color: 'amber' },
    { id: 'radio', title: 'Web Rádio', description: 'Transmissões ao vivo', icon: 'Radio', href: '/admin/broadcast', color: 'red', requiredModule: 'WEBRADIO_TV' },
    { id: 'community', title: 'Comunidade', description: 'Engaje seus membros', icon: 'Users', href: '/vip', color: 'blue', requiredModule: 'VIP_COMMUNITY' },
    { id: 'donations', title: 'Doações', description: 'Gerencie contribuições', icon: 'Heart', href: '/admin/donations', color: 'rose', requiredModule: 'DONATIONS' },
  ],
  RADIO_TV: [
    { id: 'go-live', title: 'Iniciar Transmissão', description: 'Entre ao vivo agora', icon: 'Broadcast', href: '/admin/broadcast', color: 'red', requiredModule: 'WEBRADIO_TV' },
    { id: 'schedule', title: 'Programação', description: 'Configure a grade', icon: 'Calendar', href: '/admin/broadcast/schedule', color: 'blue' },
    { id: 'player', title: 'Player no Site', description: 'Configurar player', icon: 'Play', href: '/admin/streaming', color: 'green' },
    { id: 'studio', title: 'Estúdio Multi', description: 'Lives com convidados', icon: 'Users', href: '/admin/conexao-studio', color: 'purple', requiredModule: 'STUDIO_LIVE' },
  ],
  EDUCADOR: [
    { id: 'create-lesson', title: 'Nova Aula', description: 'Crie conteúdo educacional', icon: 'BookOpen', href: '/admin/news/new', color: 'green' },
    { id: 'studio', title: 'Aula ao Vivo', description: 'Transmita para alunos', icon: 'Video', href: '/admin/conexao-studio', color: 'blue', requiredModule: 'STUDIO_LIVE' },
    { id: 'community', title: 'Fórum de Dúvidas', description: 'Interaja com alunos', icon: 'MessageCircle', href: '/vip/comunidade', color: 'purple', requiredModule: 'VIP_COMMUNITY' },
    { id: 'tracks', title: 'Trilhas', description: 'Organize o aprendizado', icon: 'Map', href: '/vip/trilhas', color: 'amber', requiredModule: 'VIP_COMMUNITY' },
  ],
  GERACAO_COTIA: [
    { id: 'tracks', title: 'Minhas Trilhas', description: 'Continue aprendendo', icon: 'Map', href: '/geracao-cotia/trilhas', color: 'teal', requiredModule: 'GERACAO_COTIA' },
    { id: 'missions', title: 'Missões do Dia', description: 'Complete desafios', icon: 'Target', href: '/geracao-cotia/missoes', color: 'amber', requiredModule: 'GERACAO_COTIA' },
    { id: 'streak', title: 'Meu Progresso', description: 'Veja seu desempenho', icon: 'TrendingUp', href: '/geracao-cotia/ranking', color: 'green', requiredModule: 'GERACAO_COTIA' },
    { id: 'projects', title: 'Projetos', description: 'Aplique o aprendizado', icon: 'Briefcase', href: '/geracao-cotia/projetos', color: 'blue', requiredModule: 'GERACAO_COTIA' },
  ],
};

// ============================================
// TIPOS DE DATABASE
// ============================================

export interface TenantProfilesConfig {
  id: string;
  tenant_id: string;
  default_profile: UserProfile;
  allowed_profiles: UserProfile[];
  created_at: string;
  updated_at: string;
}

export interface TenantModule {
  id: string;
  tenant_id: string;
  module_key: SystemModule;
  enabled: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserTenantPreferences {
  id: string;
  tenant_id: string;
  user_id: string;
  active_profile: UserProfile;
  dismissed_onboarding: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}
