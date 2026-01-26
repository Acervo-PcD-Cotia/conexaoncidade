
# Plano de Implementação: White Label REAL no Dashboard

## Visão Geral da Arquitetura

Este plano implementa um sistema completo de perfis de uso (jornalista, influencer, igreja, etc.) e módulos ativáveis por tenant, transformando o dashboard genérico em uma experiência orientada à jornada do usuário.

---

## Fase 1: Schema do Banco de Dados

### 1.1 Tabela `tenant_profiles_config`
Configuração de perfis permitidos por tenant.

```sql
CREATE TABLE public.tenant_profiles_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  default_profile TEXT NOT NULL DEFAULT 'JORNALISTA',
  allowed_profiles TEXT[] NOT NULL DEFAULT ARRAY['JORNALISTA', 'INFLUENCER', 'RADIO_TV', 'IGREJA', 'EDUCADOR', 'GERACAO_COTIA'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);
```

### 1.2 Tabela `tenant_modules`
Feature flags por tenant (complementa `tenant_features` existente).

```sql
CREATE TABLE public.tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, module_key)
);
```

### 1.3 Tabela `user_tenant_preferences`
Preferências do usuário por tenant (perfil ativo, onboarding, etc.).

```sql
CREATE TABLE public.user_tenant_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_profile TEXT NOT NULL DEFAULT 'JORNALISTA',
  dismissed_onboarding BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
```

### 1.4 RLS Policies

```sql
-- tenant_profiles_config: leitura para usuários do tenant, escrita para admins
ALTER TABLE tenant_profiles_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their tenant config" ON tenant_profiles_config
  FOR SELECT USING (tenant_id IN (SELECT site_id FROM site_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage tenant config" ON tenant_profiles_config
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')));

-- tenant_modules: mesma lógica
ALTER TABLE tenant_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read modules" ON tenant_modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage modules" ON tenant_modules
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')));

-- user_tenant_preferences: usuário só acessa o próprio registro
ALTER TABLE user_tenant_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON user_tenant_preferences
  FOR ALL USING (user_id = auth.uid());
```

---

## Fase 2: Constantes e Tipos TypeScript

### 2.1 Arquivo: `src/types/profiles-modules.ts`

```typescript
// Perfis suportados (MVP)
export const USER_PROFILES = {
  JORNALISTA: 'JORNALISTA',
  INFLUENCER: 'INFLUENCER',
  IGREJA: 'IGREJA',
  RADIO_TV: 'RADIO_TV',
  EDUCADOR: 'EDUCADOR',
  GERACAO_COTIA: 'GERACAO_COTIA',
} as const;

export type UserProfile = typeof USER_PROFILES[keyof typeof USER_PROFILES];

// Metadados de perfis (para UI)
export const PROFILE_METADATA: Record<UserProfile, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  JORNALISTA: { label: 'Jornalista', description: 'Portal de notícias e conteúdo editorial', icon: 'Newspaper', color: 'blue' },
  INFLUENCER: { label: 'Influencer', description: 'Criador de conteúdo e redes sociais', icon: 'Sparkles', color: 'purple' },
  IGREJA: { label: 'Igreja', description: 'Comunidade religiosa e ministérios', icon: 'Church', color: 'amber' },
  RADIO_TV: { label: 'Rádio/TV', description: 'Emissora e transmissões ao vivo', icon: 'Radio', color: 'red' },
  EDUCADOR: { label: 'Educador', description: 'Plataforma educacional e cursos', icon: 'GraduationCap', color: 'green' },
  GERACAO_COTIA: { label: 'Geração Cotia', description: 'Programa educacional com gamificação', icon: 'Medal', color: 'teal' },
};

// Módulos do sistema (MVP)
export const SYSTEM_MODULES = {
  NEWSROOM: 'NEWSROOM',
  SEO_TOOLS: 'SEO_TOOLS',
  WEBRADIO_TV: 'WEBRADIO_TV',
  STUDIO_LIVE: 'STUDIO_LIVE',
  VIP_COMMUNITY: 'VIP_COMMUNITY',
  GERACAO_COTIA: 'GERACAO_COTIA',
  MARKETPLACE_LOCAL: 'MARKETPLACE_LOCAL',
} as const;

export type SystemModule = typeof SYSTEM_MODULES[keyof typeof SYSTEM_MODULES];

// Mapeamento perfil -> módulos padrão
export const PROFILE_DEFAULT_MODULES: Record<UserProfile, SystemModule[]> = {
  JORNALISTA: ['NEWSROOM', 'SEO_TOOLS'],
  INFLUENCER: ['NEWSROOM', 'STUDIO_LIVE'],
  IGREJA: ['NEWSROOM', 'WEBRADIO_TV', 'VIP_COMMUNITY'],
  RADIO_TV: ['NEWSROOM', 'WEBRADIO_TV', 'STUDIO_LIVE'],
  EDUCADOR: ['NEWSROOM', 'VIP_COMMUNITY'],
  GERACAO_COTIA: ['GERACAO_COTIA', 'VIP_COMMUNITY'],
};
```

---

## Fase 3: Hooks React

### 3.1 `useTenantModules.ts`
```typescript
// Busca módulos habilitados para o tenant atual
// Retorna: { modules, isLoading, error, isModuleEnabled(key) }
```

### 3.2 `useTenantProfileConfig.ts`
```typescript
// Busca config de perfis do tenant (default_profile, allowed_profiles)
// Retorna: { config, isLoading }
```

### 3.3 `useUserTenantPreferences.ts`
```typescript
// Busca/cria preferências do usuário no tenant (active_profile, dismissed_onboarding)
// Retorna: { preferences, updateProfile, dismissOnboarding, isLoading }
```

### 3.4 `useAccessControl.ts`
```typescript
// Combina modules + profile + permissions
// Retorna: { canAccess(moduleKey), filterMenuItems(items), isLoading }
```

---

## Fase 4: Provider Central

### 4.1 `src/contexts/ProfileModulesContext.tsx`

```typescript
interface ProfileModulesContextType {
  // Profile
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  allowedProfiles: UserProfile[];
  
  // Modules
  enabledModules: SystemModule[];
  isModuleEnabled: (module: SystemModule) => boolean;
  
  // Onboarding
  showOnboarding: boolean;
  dismissOnboarding: () => void;
  
  // State
  isLoading: boolean;
}
```

Este provider:
1. Carrega config do tenant (perfis permitidos)
2. Carrega preferências do usuário (perfil ativo, onboarding)
3. Carrega módulos habilitados
4. Fornece via context para toda a aplicação

---

## Fase 5: Componente de Onboarding

### 5.1 `src/components/admin/ProfileOnboardingModal.tsx`

Modal em 2 passos:

**Passo 1: Escolha de Perfil**
- Título: "Como você vai usar o Conexão?"
- Cards com cada perfil permitido pelo tenant
- Seleção única

**Passo 2: Prévia dos Módulos**
- Mostra quais módulos serão ativados com esse perfil
- CTA: "Ativar meu painel"

Ao concluir:
- Salva `active_profile` em `user_tenant_preferences`
- Marca `dismissed_onboarding = true`

---

## Fase 6: Dashboard Dinâmico por Perfil

### 6.1 `src/components/admin/DashboardHomeByProfile.tsx`

Componente que renderiza cards de "Próximos Passos" baseado no perfil ativo:

```text
┌────────────────────────────────────────────────┐
│ JORNALISTA                                     │
├────────────────────────────────────────────────┤
│ [Criar notícia] [Agendar] [SEO] [Web Rádio/TV] │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ INFLUENCER                                     │
├────────────────────────────────────────────────┤
│ [Post rápido] [Estúdio] [Clipes] [Links/CTA]   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ RADIO_TV                                       │
├────────────────────────────────────────────────┤
│ [Iniciar transmissão] [Grade] [Player] [Apps]  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ GERACAO_COTIA                                  │
├────────────────────────────────────────────────┤
│ [Trilhas] [Missões do dia] [Streak] [Projetos] │
└────────────────────────────────────────────────┘
```

### 6.2 Integração com Dashboard.tsx
Substituir os `quickActions` estáticos por cards dinâmicos do `DashboardHomeByProfile`.

---

## Fase 7: Menu Sidebar Config-Driven

### 7.1 Refatorar `AdminSidebar.tsx`

Adicionar filtro de itens baseado em módulos e perfil:

```typescript
const filteredGroups = useMemo(() => {
  return sidebarGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        const moduleRequired = MENU_MODULE_MAP[item.url];
        if (!moduleRequired) return true;
        return isModuleEnabled(moduleRequired);
      })
    }))
    .filter(group => group.items.length > 0);
}, [enabledModules, activeProfile]);
```

### 7.2 Mapeamento Menu -> Módulo

```typescript
const MENU_MODULE_MAP: Record<string, SystemModule> = {
  '/admin/broadcast': 'WEBRADIO_TV',
  '/admin/conexao-studio': 'STUDIO_LIVE',
  '/vip': 'VIP_COMMUNITY',
  '/geracao-cotia': 'GERACAO_COTIA',
};
```

---

## Fase 8: Route Guards para Módulos

### 8.1 `src/components/guards/ModuleRouteGuard.tsx`

Wrapper que verifica se o módulo está habilitado antes de renderizar:

```typescript
export function ModuleRouteGuard({ module, children }: { module: SystemModule; children: ReactNode }) {
  const { isModuleEnabled, isLoading } = useProfileModules();
  
  if (isLoading) return <Skeleton />;
  
  if (!isModuleEnabled(module)) {
    return <ModuleUnavailablePage module={module} />;
  }
  
  return <>{children}</>;
}
```

### 8.2 Página "Módulo Indisponível"

`src/pages/admin/ModuleUnavailable.tsx`

- Mensagem amigável: "Este módulo não está disponível no seu plano"
- CTA: "Solicitar acesso" ou "Falar com suporte"
- Link para voltar ao dashboard

---

## Fase 9: Módulos VIP Community e Geração Cotia

### 9.1 Estrutura de Rotas VIP Community

```text
/vip                 → VipHub.tsx (home do hub)
/vip/tools           → VipTools.tsx (ferramentas)
/vip/trilhas         → VipTrilhas.tsx (trilhas de aprendizado)
/vip/comunidade      → VipComunidade.tsx (fórum/perguntas)
/vip/missoes         → VipMissoes.tsx (tarefas)
```

### 9.2 Estrutura de Rotas Geração Cotia

```text
/geracao-cotia              → GcotiaHome.tsx
/geracao-cotia/trilhas      → GcotiaTrilhas.tsx
/geracao-cotia/missoes      → GcotiaMissoes.tsx
/geracao-cotia/ranking      → GcotiaRanking.tsx
/geracao-cotia/projetos     → GcotiaProjetos.tsx
```

### 9.3 Lazy Loading

```typescript
// Em App.tsx
const VipHub = lazy(() => import('./pages/vip/VipHub'));
const GcotiaHome = lazy(() => import('./pages/geracao-cotia/GcotiaHome'));
```

---

## Fase 10: Tela Admin de Gerenciamento de Módulos

### 10.1 Página: `/admin/settings/profile-modules`

Interface para admin do tenant:
1. Definir perfil padrão do tenant
2. Escolher perfis permitidos
3. Ligar/desligar módulos individuais

---

## Arquivos a Criar/Modificar

| Tipo | Caminho | Descrição |
|------|---------|-----------|
| Migration | `supabase/migrations/xxx_profiles_modules.sql` | Tabelas + RLS |
| Types | `src/types/profiles-modules.ts` | Constantes e tipos |
| Hook | `src/hooks/useTenantModulesNew.ts` | Busca módulos |
| Hook | `src/hooks/useTenantProfileConfig.ts` | Config de perfis |
| Hook | `src/hooks/useUserTenantPreferences.ts` | Preferências do usuário |
| Hook | `src/hooks/useAccessControl.ts` | Controle de acesso |
| Context | `src/contexts/ProfileModulesContext.tsx` | Provider central |
| Component | `src/components/admin/ProfileOnboardingModal.tsx` | Modal de onboarding |
| Component | `src/components/admin/DashboardHomeByProfile.tsx` | Dashboard dinâmico |
| Component | `src/components/guards/ModuleRouteGuard.tsx` | Guard de rotas |
| Page | `src/pages/admin/ModuleUnavailable.tsx` | Página de módulo indisponível |
| Page | `src/pages/vip/VipHub.tsx` | Hub VIP |
| Page | `src/pages/geracao-cotia/GcotiaHome.tsx` | Home Geração Cotia |
| Modify | `src/components/admin/AdminSidebar.tsx` | Filtro de menu |
| Modify | `src/pages/admin/Dashboard.tsx` | Integrar dashboard dinâmico |
| Modify | `src/App.tsx` | Novas rotas + lazy loading |

---

## Ordem de Implementação

1. **Banco de Dados** - Criar tabelas e RLS
2. **Types/Constantes** - Definir perfis e módulos
3. **Hooks** - Implementar lógica de dados
4. **Context** - Provider central
5. **Onboarding Modal** - UX de primeiro acesso
6. **Dashboard Dinâmico** - Cards por perfil
7. **Sidebar** - Filtro de menu
8. **Route Guards** - Proteção de rotas
9. **Página Módulo Indisponível** - Fallback
10. **Módulos VIP + Geração Cotia** - Páginas básicas
11. **Tela Admin** - Gerenciamento de módulos

---

## Seção Técnica: Fluxo de Dados

```text
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                ProfileModulesProvider                      │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌───────────┐ │  │
│  │  │ tenant_profiles │  │ user_preferences │  │ modules   │ │  │
│  │  │     _config     │  │                  │  │           │ │  │
│  │  └────────┬────────┘  └────────┬─────────┘  └─────┬─────┘ │  │
│  │           │                    │                  │       │  │
│  │           └────────────────────┼──────────────────┘       │  │
│  │                                ▼                          │  │
│  │                    ProfileModulesContext                  │  │
│  │                                │                          │  │
│  └────────────────────────────────┼──────────────────────────┘  │
│                                   ▼                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ AdminSidebar    │  │ Dashboard        │  │ Route Guards   │  │
│  │ (filtro menu)   │  │ (cards perfil)   │  │ (bloqueia)     │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critérios de Aceite

- [ ] Usuário novo vê modal de onboarding e escolhe perfil
- [ ] Dashboard exibe cards específicos do perfil selecionado
- [ ] Menus aparecem/desaparecem conforme módulo + perfil
- [ ] Rotas bloqueadas mostram página "Módulo Indisponível"
- [ ] Admin consegue ligar/desligar módulos na tela de configurações
- [ ] Dropdown no header permite trocar perfil a qualquer momento
- [ ] VIP hub e Geração Cotia acessíveis apenas se módulo enabled
- [ ] Nenhuma rota existente quebra
- [ ] Performance mantida ou melhorada (lazy loading)
