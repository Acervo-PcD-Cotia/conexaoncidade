
# Plano de Correção: Módulo Publicidade e Monetização

## Diagnóstico Realizado

Após análise extensiva do código, identifiquei diversos problemas críticos que impedem o funcionamento adequado do módulo de Campanhas 360 e seus canais de exibição.

---

## Problemas Identificados

### 1. Canais de Exibição Não Funcionam ao Selecionar

**Problema**: Ao clicar nos canais (Ads, Publidoor, WebStories, Exit-Intent, Login Panel, Push, Newsletter), os formulários de configuração são exibidos, mas:

- **Os formulários de Exit-Intent e Login Panel não recebem callbacks de alteração** - no `CampaignForm.tsx`, os handlers são passados mas os formulários não disparam eventos corretamente
- **Falta de validação de campos obrigatórios** nos formulários de canal antes de salvar
- **O estado dos formulários não persiste corretamente** quando se alterna entre canais

**Arquivos afetados**:
- `src/components/admin/campaigns/ChannelSelector.tsx` (linhas 161-220)
- `src/components/admin/campaigns/CampaignForm.tsx` (linhas 64-88)

### 2. Upload de Assets Não Funciona Corretamente

**Problema**: O componente `BatchAssetUploader` e `AdImageUploader` podem falhar silenciosamente:

- **Bucket 'ads' pode não existir** - o código assume que o bucket existe
- **Bucket 'campaign-assets' pode não ter políticas RLS corretas**
- **Falta feedback visual quando o upload falha** por problemas de permissão

**Arquivos afetados**:
- `src/components/admin/AdImageUploader.tsx` (linhas 68-87)
- `src/components/admin/campaigns/BatchAssetUploader.tsx` (linhas 185-198)

### 3. Formulários de Canal Incompletos

**Problema**: Alguns formulários de canal não estão funcionais:

- **Exit-Intent**: Não há seleção de assets (hero e secundários)
- **Login Panel**: Não há seleção de assets
- **WebStories**: O tipo "native" está marcado como "em breve" mas deveria ter fallback

**Arquivos afetados**:
- `src/components/admin/campaigns/ExitIntentChannelForm.tsx`
- `src/components/admin/campaigns/LoginPanelChannelForm.tsx`
- `src/components/admin/campaigns/WebStoriesChannelForm.tsx`

### 4. Salvamento de Campanha Incompleto

**Problema**: O `useCampaignsUnified.ts` não salva corretamente todos os dados:

- **Assets não são vinculados aos canais corretos** quando há múltiplos canais habilitados
- **Configurações de Exit-Intent e Login Panel são salvas mas não carregadas** na edição
- **Falta tratamento de erro específico** para cada etapa do salvamento

**Arquivos afetados**:
- `src/hooks/useCampaignsUnified.ts` (linhas 102-163, 168-227)

### 5. Rota de Métricas Não Existe

**Problema**: O botão "Ver Métricas" no `CampaignCard.tsx` navega para `/admin/campaigns/metrics/:id` mas essa rota não existe.

**Arquivos afetados**:
- `src/pages/admin/campaigns/CampaignsUnified.tsx` (linha 59)
- `src/App.tsx` (falta rota)

### 6. Ciclos de Distribuição

**Problema**: O componente `CycleSelectorCard` está funcional mas:

- **Não é exibido na criação** de nova campanha (apenas na edição)
- **Depende de `enabledChannels` que pode estar vazio** inicialmente

---

## Plano de Correção

### Fase 1: Correção dos Formulários de Canal

**1.1 Adicionar seletores de assets aos formulários Exit-Intent e Login Panel**

- Adicionar `AdImageUploader` no `ExitIntentChannelForm.tsx` para selecionar Hero e Secundários
- Adicionar `AdImageUploader` no `LoginPanelChannelForm.tsx` para selecionar asset

**1.2 Corrigir passagem de callbacks no ChannelSelector**

- Garantir que todos os callbacks de configuração sejam sempre passados
- Adicionar valores padrão para prevenir undefined

**1.3 Adicionar validação de campos obrigatórios**

- Validar título/frase obrigatória em Publidoor
- Validar URL em WebStories quando tipo é "external"
- Validar título e body em Push
- Validar subject em Newsletter

### Fase 2: Correção do Sistema de Upload

**2.1 Verificar e criar buckets necessários**

- Verificar se bucket `ads` existe (usado pelo AdImageUploader)
- Verificar se bucket `campaign-assets` existe (usado pelo BatchAssetUploader)
- Adicionar políticas RLS adequadas

**2.2 Melhorar feedback de erro**

- Exibir mensagem específica quando bucket não existe
- Exibir mensagem quando usuário não tem permissão
- Adicionar retry automático para falhas temporárias

### Fase 3: Correção do Hook de Campanhas

**3.1 Melhorar mapeamento de assets para canais**

- Garantir que cada asset seja vinculado ao canal correto
- Preservar assets existentes na edição
- Adicionar validação de URLs de assets

**3.2 Corrigir carregamento de configurações na edição**

- Mapear corretamente configs de Exit-Intent e Login Panel
- Carregar URLs de assets existentes nos campos corretos

### Fase 4: Adicionar Rota de Métricas

**4.1 Criar página de métricas da campanha**

- Criar `CampaignMetrics.tsx` com visualização de impressões, cliques, CTR
- Integrar com tabela `campaign_events`
- Adicionar gráficos por canal e por período

**4.2 Registrar rota no App.tsx**

- Adicionar rota `/admin/campaigns/metrics/:id`

### Fase 5: Melhorias na UX

**5.1 Exibir prévia do criativo por canal**

- Mostrar thumbnail do asset selecionado em cada canal expandido
- Indicar quando um canal está incompleto (sem asset)

**5.2 Adicionar validação antes de salvar**

- Verificar se todos os canais habilitados têm configuração mínima
- Exibir alerta quando há canais incompletos
- Permitir salvar como rascunho mesmo incompleto

---

## Detalhamento Técnico

### Arquivos a Criar
1. `src/pages/admin/campaigns/CampaignMetrics.tsx` - Página de métricas

### Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `ExitIntentChannelForm.tsx` | Adicionar seletores de assets (hero, secondary1, secondary2) |
| `LoginPanelChannelForm.tsx` | Adicionar seletor de asset |
| `ChannelSelector.tsx` | Garantir passagem de todos os callbacks |
| `CampaignForm.tsx` | Adicionar validação antes do submit |
| `useCampaignsUnified.ts` | Corrigir mapeamento de assets e loading |
| `App.tsx` | Adicionar rota de métricas |
| `BatchAssetUploader.tsx` | Melhorar tratamento de erros |
| `AdImageUploader.tsx` | Melhorar tratamento de erros |

### Ordem de Execução

1. Corrigir formulários de canal (Exit-Intent, Login Panel)
2. Corrigir passagem de callbacks no ChannelSelector
3. Corrigir hook de salvamento/carregamento
4. Melhorar sistema de upload
5. Criar página de métricas
6. Adicionar validações

---

## Resultado Esperado

Após implementação:

- Todos os 7 canais de exibição funcionarão corretamente
- Upload de assets funcionará com feedback adequado
- Campanhas serão salvas e carregadas com todas as configurações
- Métricas poderão ser visualizadas por campanha
- Validações prevenirão campanhas incompletas

