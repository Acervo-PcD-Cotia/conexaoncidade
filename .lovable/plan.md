
# Refatoracao Completa: CampaignForm + ChannelSelector + CampaignEditor

## Visao Geral

4 refatoracoes de engenharia para eliminar divida tecnica no modulo de Campanhas 360, mais publicacao e teste.

---

## 1. Publicar e Testar Error #185

**Acao do usuario**: Clicar "Publicar" e verificar em aba anonima que `/admin/campaigns/new` carrega sem crash com `Build: 2026-02-12-v9`.

Nenhuma alteracao de codigo necessaria — apenas deploy do que ja foi implementado.

---

## 2. Refatorar CampaignForm: 20+ useState para useReducer

**Problema**: 22 chamadas `useState` separadas tornam o estado dificil de rastrear e causam re-renders granulares excessivos.

**Solucao**: Criar um `useReducer` unificado com um tipo de estado e actions tipadas.

### Novo tipo de estado

```ts
interface CampaignFormState {
  status: CampaignStatus;
  selectedChannels: ChannelType[];
  channelConfigs: {
    ads: Partial<AdsChannelConfig>;
    publidoor: Partial<PublidoorChannelConfig>;
    webstories: Partial<WebStoriesChannelConfig>;
    push: Partial<PushChannelConfig>;
    newsletter: Partial<NewsletterChannelConfig>;
    exit_intent: Partial<ExitIntentChannelConfig>;
    login_panel: Partial<LoginPanelChannelConfig>;
  };
  assets: {
    ads: { url: string; alt: string };
    publidoor: { url: string; alt: string };
    webstories: { url: string; alt: string };
    exitIntentHero: { url: string };
    exitIntentSecondary1: { url: string };
    exitIntentSecondary2: { url: string };
    loginPanel: { url: string };
  };
  validationErrors: string[];
}
```

### Actions tipadas

```ts
type CampaignFormAction =
  | { type: 'SET_STATUS'; payload: CampaignStatus }
  | { type: 'TOGGLE_CHANNEL'; payload: ChannelType }
  | { type: 'SET_CHANNEL_CONFIG'; payload: { channel: ChannelType; config: Partial<ChannelConfig> } }
  | { type: 'SET_ASSET'; payload: { key: string; url: string; alt?: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: string[] };
```

### Arquivo novo: `src/components/admin/campaigns/useCampaignFormReducer.ts`

Contera:
- `CampaignFormState` e `CampaignFormAction` types
- `createInitialState(initialData)` factory
- `campaignFormReducer(state, action)` reducer puro
- Export do hook `useCampaignFormReducer(initialData)`

### Alteracao em `CampaignForm.tsx`

- Remover os 22 `useState`
- Importar e usar `useCampaignFormReducer`
- Todas as callbacks de onChange passam a fazer `dispatch({ type: ..., payload: ... })`
- `react-hook-form` continua gerenciando apenas os campos de texto (name, advertiser, etc.)

---

## 3. Reduzir props do ChannelSelector: 38 props para objeto unico

**Problema**: `ChannelSelectorProps` tem 38 propriedades individuais — cada config, cada asset, cada onChange separados.

**Solucao**: Agrupar em um unico objeto de configuracao + um unico dispatch.

### Nova interface

```ts
interface ChannelSelectorProps {
  selectedChannels: ChannelType[];
  onToggleChannel: (channel: ChannelType) => void;
  channelConfigs: CampaignFormState['channelConfigs'];
  onConfigChange: (channel: ChannelType, config: Partial<ChannelConfig>) => void;
  channelAssets: CampaignFormState['assets'];
  onAssetChange: (key: string, url: string, alt?: string) => void;
}
```

De 38 props para 6.

### Alteracoes nos channel forms filhos

Os channel forms (AdsChannelForm, PublidoorChannelForm, etc.) mantem suas interfaces atuais — o ChannelSelector adapta internamente, passando `channelConfigs.ads` como `config` e criando callbacks inline `(config) => onConfigChange('ads', config)`.

### React.memo

Envolver `ChannelSelector` em `React.memo` ja que agora recebe objetos estaveis do reducer (mesma referencia entre renders quando nao mudam).

---

## 4. Eliminar `as any` no CampaignEditor.tsx

**Problema**: 4 casts `as any` nas linhas 71-74 para configs de Push, Newsletter, ExitIntent e LoginPanel.

**Solucao**: Usar as interfaces corretas ja definidas em `campaigns-unified.ts`.

```ts
// ANTES:
pushConfig: pushChannel?.config as any,
newsletterConfig: newsletterChannel?.config as any,
exitIntentConfig: exitIntentChannel?.config as any,
loginPanelConfig: loginPanelChannel?.config as any,

// DEPOIS:
pushConfig: pushChannel?.config as PushChannelConfig | undefined,
newsletterConfig: newsletterChannel?.config as NewsletterChannelConfig | undefined,
exitIntentConfig: exitIntentChannel?.config as ExitIntentChannelConfig | undefined,
loginPanelConfig: loginPanelChannel?.config as LoginPanelChannelConfig | undefined,
```

Adicionar os imports que faltam na linha 12:

```ts
import type { 
  CampaignFormData, ChannelType, 
  AdsChannelConfig, PublidoorChannelConfig, WebStoriesChannelConfig,
  PushChannelConfig, NewsletterChannelConfig, ExitIntentChannelConfig, LoginPanelChannelConfig
} from '@/types/campaigns-unified';
```

---

## 5. useMemo no getInitialData

**Problema**: `getInitialData()` e chamado inline no JSX (linha 149), criando um novo objeto a cada render do CampaignEditor. Isso forca o CampaignForm a reinicializar desnecessariamente.

**Solucao**: Memoizar com `useMemo` dependendo de `campaign`.

```ts
const initialData = useMemo(() => {
  if (!campaign) return undefined;
  // ... mesma logica do getInitialData atual
}, [campaign]);
```

E passar `initialData` diretamente:

```tsx
<CampaignForm initialData={initialData} ... />
```

---

## Resumo de arquivos

| Arquivo | Tipo | Alteracao |
|---|---|---|
| `src/components/admin/campaigns/useCampaignFormReducer.ts` | NOVO | Reducer, types, estado inicial |
| `src/components/admin/campaigns/CampaignForm.tsx` | EDIT | Substituir 22 useState por useReducer, nova interface com ChannelSelector |
| `src/components/admin/campaigns/ChannelSelector.tsx` | EDIT | Reduzir de 38 para 6 props, envolver em React.memo |
| `src/pages/admin/campaigns/CampaignEditor.tsx` | EDIT | useMemo no initialData, tipos corretos nos casts |
| `src/config/buildInfo.ts` | EDIT | BUILD_ID -> v10 |

## Ordem de implementacao

1. Criar `useCampaignFormReducer.ts` (novo, sem dependencias)
2. Editar `ChannelSelector.tsx` (nova interface + React.memo)
3. Editar `CampaignForm.tsx` (useReducer + nova interface do ChannelSelector)
4. Editar `CampaignEditor.tsx` (useMemo + tipos corretos)
5. Atualizar BUILD_ID

## Riscos e mitigacoes

- **Risco**: Channel forms filhos quebrarem por mudanca de props. **Mitigacao**: ChannelSelector adapta internamente, channel forms nao mudam.
- **Risco**: useReducer criar novo objeto de state a cada dispatch. **Mitigacao**: Spread operators sao shallow e rapidos; React.memo no ChannelSelector compara props por referencia.
- **Risco**: useMemo no initialData causar stale data. **Mitigacao**: Depende de `campaign` que vem do React Query — quando muda, recalcula.
