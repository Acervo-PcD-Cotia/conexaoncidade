

# Plano de Correcoes Completas - Modulo Publicidade e Monetizacao

Este e um plano abrangente dividido em fases, priorizando os erros criticos primeiro.

---

## Fase 1: Correcao Critica - React Error #185 (Campanhas 360)

O `ChannelSelector.tsx` ja foi corrigido (Collapsible removido, usando renderizacao condicional). Porem, o erro pode persistir no site publicado se o codigo nao foi publicado. Alem disso, ha um problema no `MaintenanceGuard` que gera warnings de refs no console.

**Arquivos a alterar:**

- `src/components/maintenance/MaintenanceGuard.tsx` - Envolver com `React.forwardRef` para eliminar o warning "Function components cannot be given refs"
- Verificar se o `ChannelSelector.tsx` esta correto (ja esta com renderizacao condicional - confirmar que funciona)

---

## Fase 2: Validacoes e Estados Globais

**2.1 - CampaignForm.tsx** - Adicionar guards de seguranca:
- Adicionar `if (!selectedChannels) return null` antes de renderizar ChannelSelector
- Garantir que `initialData?.enabledChannels` nunca seja `undefined`

**2.2 - CampaignEditor.tsx** - Adicionar fallback seguro:
- Usar optional chaining consistente: `campaign?.channels?.filter(...)` 
- Adicionar estado de loading padronizado

**2.3 - NewsletterChannelForm.tsx** - Ja corrigido (valores default `'all'` e `'default'`)

---

## Fase 3: Super Banners - Metricas, Heatmap, Alertas

**3.1 - BannerMetrics.tsx:**
- Corrigir calculo CTR: garantir `CTR = (cliques / impressoes) * 100` com divisao segura (evitar divisao por zero)
- Adicionar loading state com Skeleton

**3.2 - BannerHeatmap.tsx:**
- Adicionar guard `if (!selectedBannerId) return` com mensagem "Selecione um banner"
- Corrigir renderizacao condicional do grid

**3.3 - BannerAlerts.tsx:**
- Alertas ja usam tabelas `banner_alerts_config` e `banner_alerts_log` - confirmar persistencia
- Adicionar tratamento de erro nos mutations

---

## Fase 4: Comprovantes - Persistencia e Validacao

**4.1 - ProofDataForm.tsx:**
- Validacao Zod ja existe e e solida (client_name, campaign_name, insertion_order, site_name, site_domain, start_date, end_date obrigatorios)
- `internal_code` ja e opcional (salva como `undefined`/`null`)
- Adicionar autosave draft com debounce

**4.2 - CampaignProofEditor.tsx:**
- Adicionar tratamento de erro quando `proof` nao carrega
- Garantir navegacao correta entre abas

---

## Fase 5: Anuncios (Ads.tsx) - Upload e Validacao

**5.1 - Ads.tsx:**
- Adicionar validacao de tipo de arquivo (JPG, PNG, WEBP)
- Adicionar limite de 2MB com mensagem
- Adicionar validacao de URL com regex `^https?:\/\/.+`
- Garantir vinculo com `campaign_id` via FK

---

## Fase 6: Publidoor - Metricas e Preview

**6.1 - Corrigir contadores** nos dashboards de metricas
**6.2 - Corrigir preview em tempo real** com `useEffect` sincronizado
**6.3 - Garantir persistencia de agendamentos** na tabela `publidoor_schedules`

---

## Fase 7: Padronizacao UX/UI

- Botoes primarios em laranja (ja configurado no tema)
- Estados visuais: Verde (Ativo), Cinza (Rascunho), Vermelho (Erro) - ja parcialmente implementado
- Skeleton loading em todos os modulos
- Toast notifications (ja usa `sonner`)
- Dialogo de confirmacao antes de deletar (adicionar `AlertDialog` nos botoes de delete)

---

## Fase 8: Logs e Error Boundary

**8.1 - AdminErrorBoundary.tsx** - Ja existe e funciona bem
**8.2 - Criar servico de logging:**
- `src/lib/logService.ts` - Centralizar logs com `console.error` -> tabela `system_logs`
- Criar tabela `system_logs` com colunas: `modulo`, `erro`, `usuario_id`, `timestamp`, `metadata`

---

## Detalhes Tecnicos

### Arquivos que serao criados:
| Arquivo | Descricao |
|---|---|
| `src/lib/logService.ts` | Servico centralizado de logging |

### Arquivos que serao modificados:
| Arquivo | Alteracao |
|---|---|
| `MaintenanceGuard.tsx` | Adicionar forwardRef |
| `CampaignForm.tsx` | Guards de seguranca nos estados |
| `CampaignEditor.tsx` | Optional chaining + loading state |
| `BannerMetrics.tsx` | CTR seguro + skeleton loading |
| `BannerHeatmap.tsx` | Guard de banner selecionado |
| `BannerAlerts.tsx` | Tratamento de erro nos mutations |
| `ProofDataForm.tsx` | Autosave draft |
| `CampaignProofEditor.tsx` | Tratamento de erro |
| `Ads.tsx` | Validacoes de upload e URL |
| Publidoor pages | Correcoes de metricas e preview |

### Migracao de banco necessaria:
- Criar tabela `system_logs` para logging centralizado

### Ordem de execucao:
1. Fase 1 (MaintenanceGuard + confirmar ChannelSelector)
2. Fase 2 (Guards e validacoes)
3. Fase 3 (Super Banners)
4. Fase 4 (Comprovantes)
5. Fase 5 (Anuncios)
6. Fase 6 (Publidoor)
7. Fase 7 (UX/UI)
8. Fase 8 (Logs)

**Nota:** Devido ao tamanho deste trabalho, a implementacao sera feita em etapas. Cada fase sera implementada e testada antes de avancar para a proxima.

