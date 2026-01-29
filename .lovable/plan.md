
# Plano Completo: Finalizar 100% do Auto Post Regional

## Resumo Executivo

Implementar os ~35 itens pendentes para o módulo Auto Post Regional, divididos em 5 sprints de trabalho.

---

## SPRINT 1: Edge Function `regional-process-item` (CRÍTICO)

### 1.1 Criar Edge Function `regional-process-item`

**Arquivo**: `supabase/functions/regional-process-item/index.ts`

**Funcionalidades**:
- Recebe `item_id` de um item na fila
- Busca conteúdo completo da URL original (fetch + parse HTML)
- Reescreve usando Lovable AI (Gemini 2.5 Flash)
- Gera metadados SEO (meta_title ≤60, meta_description ≤160)
- Gera imagem usando Gemini Image (sem texto)
- Cria as 12 tags obrigatórias
- Atualiza item com status `processed`
- Se `mode=auto_publish`: publica na tabela `news`

**Campos a preencher**:
- `rewritten_title`
- `rewritten_content` (HTML formatado)
- `seo_meta_title`
- `seo_meta_description`
- `generated_image_url`
- `processed_at`
- Se publicado: `news_id`, `published_at_portal`, status `published`

**Integração com IA**:
- Reutilizar lógica de `autopost-rewrite` e `autopost-image-generator`
- Usar endpoint `https://ai.gateway.lovable.dev/v1/chat/completions`
- Modelo texto: `google/gemini-2.5-flash`
- Modelo imagem: `google/gemini-3-pro-image-preview`

### 1.2 Adicionar action `process_item` em `regional-admin-tools`

```typescript
case 'process_item': {
  const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${supabaseKey}` },
    body: JSON.stringify({ item_id }),
  });
  return new Response(await response.text(), { headers: corsHeaders });
}

case 'process_all_new': {
  // Busca até 10 itens com status 'new' ou 'queued'
  // Processa em paralelo com Promise.allSettled
}

case 'publish_item': {
  // Publica item processado na tabela news
}
```

---

## SPRINT 2: Integração com Tabela `news`

### 2.1 Lógica de Publicação

Ao publicar um item processado, criar registro em `news` com:

| Campo news | Origem |
|------------|--------|
| title | rewritten_title |
| slug | gerado do título |
| content | rewritten_content |
| excerpt | primeiros 160 chars do conteúdo |
| featured_image_url | generated_image_url |
| og_image_url | generated_image_url |
| card_image_url | generated_image_url |
| image_alt | "Imagem ilustrativa: {cidade}" |
| image_credit | "IA | Conexão na Cidade" |
| meta_title | seo_meta_title |
| meta_description | seo_meta_description |
| source | canonical_url |
| status | 'published' |
| published_at | now() |
| origin | 'autopost' |
| category_id | categoria "Cidades" ou default |

### 2.2 Geração das 12 Tags Obrigatórias

Algoritmo para gerar tags:
1. Nome da cidade (ex: "Barueri")
2. "regional"
3. "grande cotia"
4. "prefeitura"
5. "governo municipal"
6. "serviço público"
7. "administração"
8. "região oeste"
9. "são paulo"
10. "interior paulista"
11. Categoria inferida (saúde, educação, obras, etc.)
12. Tema principal da notícia

### 2.3 Inserir Tags na Tabela `news_tags`

Após criar a notícia:
1. Verificar/criar tags na tabela `tags`
2. Criar relações em `news_tags`

---

## SPRINT 3: Melhorias no `regional-ingest`

### 3.1 Tratamento de Erros TLS/SSL

Adicionar ao fetch do RSS:
```typescript
try {
  // Tentar HTTPS
  const response = await fetch(url, { timeout: 15000 });
} catch (e) {
  if (e.message.includes('TLS') || e.message.includes('SSL')) {
    console.log('[Retry] Tentando HTTP...');
    const httpUrl = url.replace('https://', 'http://');
    response = await fetch(httpUrl, { timeout: 15000 });
  }
}
```

### 3.2 Backoff Exponencial

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status === 503) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      return res;
    } catch (e) {
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 3.3 Parser de Listing Otimizado

Melhorar extração HTML:
- Timeout mais curto (10s)
- Limitar tamanho do HTML (2MB max)
- Usar regex mais específicos por cidade
- Fallback para padrões genéricos

### 3.4 Campos Extras na Tabela

Adicionar via migration:
```sql
ALTER TABLE regional_ingest_items 
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_regional_items_status 
  ON regional_ingest_items(status);
CREATE INDEX IF NOT EXISTS idx_regional_items_source 
  ON regional_ingest_items(source_id);
```

---

## SPRINT 4: UI - Páginas e Componentes

### 4.1 Botão "Processar" na Fila (`RegionalQueue.tsx`)

Adicionar na coluna de ações:
```tsx
{item.status === 'new' && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => processItem.mutate(item.id)}
    disabled={processItem.isPending}
    title="Processar com IA"
  >
    <Sparkles className="h-4 w-4 text-purple-500" />
  </Button>
)}
```

### 4.2 Botão "Publicar" na Fila

Após processado, mostrar botão para publicar:
```tsx
{item.status === 'processed' && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => publishItem.mutate(item.id)}
    disabled={publishItem.isPending}
    title="Publicar agora"
  >
    <Send className="h-4 w-4 text-green-500" />
  </Button>
)}
```

### 4.3 Preview do Conteúdo Reescrito

No Dialog de detalhes, adicionar abas:
- Original
- Reescrito
- SEO
- Imagem

### 4.4 Página `RegionalSourceEdit.tsx`

Nova página para edição de fonte:
- Formulário com todos os campos
- Editor de CSS selectors (para listing)
- Botão "Testar Selectors"
- Preview dos 5 primeiros itens

Rota: `/admin/autopost-regional/fontes/:id/edit`

### 4.5 Editor Visual de Selectors

Componente com campos:
```tsx
<div className="space-y-4">
  <div>
    <Label>Container do Item</Label>
    <Input 
      placeholder="article, .news-item" 
      value={selectors.item_container}
      onChange={(e) => updateSelector('item_container', e.target.value)}
    />
  </div>
  <div>
    <Label>Link da Notícia</Label>
    <Input 
      placeholder="a[href*='noticia']" 
      value={selectors.item_link}
      onChange={(e) => updateSelector('item_link', e.target.value)}
    />
  </div>
  <div>
    <Label>Título</Label>
    <Input placeholder="h2, h3, .title" />
  </div>
  <div>
    <Label>Data (opcional)</Label>
    <Input placeholder="time, .date" />
  </div>
  <Button onClick={testSelectors}>
    Testar Selectors
  </Button>
</div>
```

---

## SPRINT 5: Hooks e Automação

### 5.1 Novos Hooks em `useRegionalAutoPost.ts`

```typescript
// Processar item individual
export function useProcessRegionalItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'process_item', item_id: itemId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      toast.success('Item processado com sucesso');
    },
  });
}

// Publicar item processado
export function usePublishRegionalItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'publish_item', item_id: itemId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      toast.success(`Publicado: ${data.slug}`);
    },
  });
}

// Processar todos os novos
export function useProcessAllNew() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'process_all_new' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      toast.success(`${data.processed} itens processados`);
    },
  });
}

// Testar selectors
export function useTestSelectors() {
  return useMutation({
    mutationFn: async ({ sourceId, selectors }: { sourceId: string; selectors: Record<string, string> }) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'test_selectors', source_id: sourceId, selectors },
      });
      if (error) throw error;
      return data;
    },
  });
}

// Atualizar fonte
export function useCreateRegionalSource() {
  // Para adicionar novas fontes manualmente
}
```

### 5.2 Cron de Ingestão Automática

Adicionar em `supabase/config.toml`:
```toml
[functions.regional-ingest]
verify_jwt = false
schedule = "0 */2 * * *"  # A cada 2 horas
```

Ou criar via pg_cron (se disponível):
```sql
SELECT cron.schedule(
  'regional-ingest-cron',
  '0 */2 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/regional-ingest',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  )$$
);
```

### 5.3 Cron de Processamento Automático

Para fontes com `mode=auto_publish`:
```sql
SELECT cron.schedule(
  'regional-process-cron',
  '*/30 * * * *',  # A cada 30 minutos
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/regional-admin-tools',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := '{"action": "process_all_new"}'::jsonb
  )$$
);
```

---

## SPRINT 6: Segurança e Validações

### 6.1 Validação SSRF

Em `regional-ingest`, validar URLs antes de fetch:
```typescript
function isValidSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Bloquear IPs privados
    if (parsed.hostname.match(/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)) {
      return false;
    }
    // Permitir apenas HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
```

### 6.2 Sanitização HTML

Limpar conteúdo antes de salvar:
```typescript
function sanitizeHtml(html: string): string {
  // Remover scripts, iframes, event handlers
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}
```

### 6.3 Rate Limiting por Fonte

Em `regional-ingest`:
```typescript
// Verificar rate limit
if (source.rate_limit_per_hour) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const { count } = await supabase
    .from('regional_ingest_runs')
    .select('*', { count: 'exact', head: true })
    .eq('source_id', source.id)
    .gte('started_at', oneHourAgo.toISOString());
  
  if (count >= source.rate_limit_per_hour) {
    console.log(`[Skip] Rate limit reached for ${source.name}`);
    continue;
  }
}
```

---

## Resumo de Arquivos

### Novos Arquivos
1. `supabase/functions/regional-process-item/index.ts`
2. `src/pages/admin/autopost-regional/RegionalSourceEdit.tsx`
3. `src/components/admin/regional/SelectorEditor.tsx`

### Arquivos Modificados
1. `supabase/functions/regional-admin-tools/index.ts` - adicionar actions
2. `supabase/functions/regional-ingest/index.ts` - melhorar error handling
3. `src/hooks/useRegionalAutoPost.ts` - adicionar hooks
4. `src/pages/admin/autopost-regional/RegionalQueue.tsx` - botões processar/publicar
5. `src/pages/admin/autopost-regional/RegionalSources.tsx` - link para edit
6. `src/App.tsx` - rota de edição
7. `supabase/config.toml` - nova edge function

### Migrations
1. Adicionar colunas `error_message`, `retry_count`, `processing_started_at`
2. Criar índices para performance
3. Configurar pg_cron (se disponível)

---

## Ordem de Implementação

| Prioridade | Item | Impacto |
|------------|------|---------|
| 1 | Edge Function `regional-process-item` | Crítico - habilita processamento |
| 2 | Actions em `regional-admin-tools` | Crítico - conecta UI ao backend |
| 3 | Hooks de processamento | Alto - permite UI funcionar |
| 4 | Botões processar/publicar na fila | Alto - UX principal |
| 5 | Integração com tabela `news` | Alto - publicação final |
| 6 | Tratamento erros TLS | Médio - aumenta cobertura fontes |
| 7 | Página de edição de fonte | Médio - configuração avançada |
| 8 | Editor de selectors | Médio - listing sources |
| 9 | Cron automático | Médio - automação |
| 10 | Validações segurança | Médio - produção |

---

## Checklist Final (35 itens)

### Edge Functions (8 itens)
- [ ] Criar `regional-process-item`
- [ ] Implementar fetch de conteúdo completo
- [ ] Integrar Lovable AI para reescrita
- [ ] Integrar Gemini Image para imagens
- [ ] Adicionar action `process_item`
- [ ] Adicionar action `process_all_new`
- [ ] Adicionar action `publish_item`
- [ ] Adicionar action `test_selectors`

### Ingestão (6 itens)
- [ ] Tratamento TLS/SSL com fallback
- [ ] Backoff exponencial
- [ ] Parser listing otimizado
- [ ] Validação SSRF
- [ ] Rate limiting por fonte
- [ ] Timeout configurável

### Banco de Dados (4 itens)
- [ ] Coluna `error_message`
- [ ] Coluna `retry_count`
- [ ] Coluna `processing_started_at`
- [ ] Índices de performance

### Integração News (5 itens)
- [ ] Criar registro em `news`
- [ ] Gerar slug único
- [ ] Inserir 12 tags
- [ ] Linkar `news_tags`
- [ ] Atualizar status para `published`

### UI/Hooks (9 itens)
- [ ] Hook `useProcessRegionalItem`
- [ ] Hook `usePublishRegionalItem`
- [ ] Hook `useProcessAllNew`
- [ ] Hook `useTestSelectors`
- [ ] Botão Processar na fila
- [ ] Botão Publicar na fila
- [ ] Preview conteúdo reescrito
- [ ] Página `RegionalSourceEdit`
- [ ] Editor visual de selectors

### Automação (3 itens)
- [ ] Cron ingestão (2h)
- [ ] Cron processamento (30min)
- [ ] Auto-publish para fontes configuradas
