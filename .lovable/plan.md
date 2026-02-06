
# Correção das Campanhas Unificadas 360

## Diagnóstico: 3 Problemas Raiz Identificados

### Problema 1: Coluna `session_id` ausente na tabela `campaign_events` (CRITICO)
A funcao `trackCampaignEvent` (usada por TODOS os canais) e o hook `useExitIntent` tentam inserir um campo `session_id` na tabela `campaign_events`, mas essa coluna NAO EXISTE na tabela. Resultado: todos os INSERTs de eventos falham silenciosamente, nenhuma metrica e gravada, e o hook do Exit-Intent pode lançar um erro nao capturado.

Canais afetados: TODOS (Ads, Publidoor, WebStories, Exit-Intent, Login Panel, Push, Newsletter)

### Problema 2: Editor de Campanha sem tratamento de erro (CRASH)
O componente `CampaignEditor` so trata o estado de `isLoading`. Se a query `useCampaignUnified` falhar (ex: erro de RLS, rede), o componente nao mostra mensagem de erro - ele tenta renderizar com dados indefinidos, causando o crash mostrado no Error Boundary ("Ops, algo deu errado").

### Problema 3: CORS incompleto nas Edge Functions
As funcoes `campaign-push` e `campaign-newsletter` nao incluem todos os headers obrigatorios no `Access-Control-Allow-Headers`, podendo causar falha nas chamadas do frontend.

---

## Plano de Correcao

### Etapa 1: Adicionar coluna `session_id` na tabela `campaign_events`
- Criar migracao SQL adicionando `session_id TEXT` (nullable) a `campaign_events`
- Isso desbloqueara o tracking de eventos para TODOS os 7 canais de uma vez

### Etapa 2: Corrigir crash do CampaignEditor
- Adicionar tratamento do estado `error` retornado por `useCampaignUnified`
- Exibir mensagem amigavel com botao de tentar novamente quando a query falhar
- Isso resolve o crash "Ops, algo deu errado"

### Etapa 3: Corrigir CORS das Edge Functions
- Atualizar `campaign-push/index.ts` e `campaign-newsletter/index.ts` com os headers corretos:
  - Adicionar `x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`

### Etapa 4: Corrigir erro nao capturado no useExitIntent
- O `recordEventMutation` no `useExitIntent.ts` nao captura erros - se o INSERT falhar (como esta acontecendo), o erro se propaga e pode causar crash
- Adicionar `onError` no mutation para capturar silenciosamente

---

## Detalhamento Tecnico

### Migracao SQL
```text
ALTER TABLE campaign_events ADD COLUMN IF NOT EXISTS session_id TEXT;
```

### CampaignEditor.tsx - Adicionar tratamento de erro
- Extrair `error` do hook: `const { data: campaign, isLoading, error } = useCampaignUnified(id);`
- Adicionar bloco de renderizacao de erro antes do form
- Mostrar Alert com botao de refresh

### Edge Functions - CORS Headers
Atualizar o objeto `corsHeaders` em ambas funcoes para incluir:
```text
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'
```

### useExitIntent.ts - Error handling
Adicionar `onError: (error) => console.error(...)` ao `recordEventMutation`

---

## Resultado Esperado
- Editor de campanhas abre sem crash, mesmo com erros de rede/RLS
- Todos os 7 canais gravam metricas (impressoes, cliques, CTAs) corretamente
- Push e Newsletter podem ser disparados sem erro de CORS
- Exit-Intent funciona sem erros silenciosos

## Nota Importante
Apos implementar essas correcoes, sera necessario **republicar o site** para que as mudancas reflitam na URL publica (conexaoncidade.lovable.app). O preview ja refletira as correcoes imediatamente.
