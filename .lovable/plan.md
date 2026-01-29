
# Plano de Correções e Melhorias: Módulo Brasileirão

## Resumo da Análise

Após testes extensivos das Edge Functions, identifiquei os seguintes problemas e status:

### Status Atual por Funcionalidade

| Funcionalidade | Status | Problema |
|----------------|--------|----------|
| **Geração IA** | ✅ FUNCIONANDO | Artigo criado com sucesso (Gemini 2.5 Flash) |
| **Sync CBF** | ❌ FALHA | URL incorreta - retorna 404 |
| **Sync RSS GE** | ❌ FALHA | URL incorreta + filtro de fonte não funciona |
| **Sync RSS oGol** | ❌ FALHA | Site não permite scraping |
| **Sync Transmissões** | ⚠️ NÃO TESTADO | Depende de jogos existentes |
| **CRON Jobs** | ❌ NÃO IMPLEMENTADO | Falta criar |

---

## Problemas Identificados

### 1. URL da CBF Incorreta

**Problema:** A URL `https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a/2026` retorna 404.

**URL Correta:** `https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a`

**Complicação:** O site da CBF usa JavaScript para renderizar a tabela (React/Next.js), impossibilitando scraping simples com fetch.

**Solução:** Usar API alternativa ou scraping de páginas HTML estáticas da CBF (como notícias com resultados).

### 2. URL do GE RSS Incorreta

**Problema:** A URL `https://ge.globo.com/rss/futebol/brasileirao-serie-a/` retorna 400 Bad Request.

**URL Correta Encontrada:** `https://globoesporte.globo.com/ESP/Noticia/Rss/0,,AS0-4274,00.xml` (Futebol geral)

**Nota:** Este feed está desatualizado (dados de 2008). O GE pode ter descontinuado RSS públicos.

### 3. oGol Inacessível

**Problema:** `https://www.ogol.com.br/rss.php` não permite scraping (bloqueado).

### 4. Filtro de Source no RSS não Funciona

**Problema:** A Edge Function filtra por `source_key` mas as fontes não são encontradas corretamente.

---

## Plano de Correções

### Fase 1: Atualizar Fontes de Dados

1. **Atualizar URLs no banco:**
   - CBF: usar nova URL ou fallback para API não-oficial
   - GE: usar URL de futebol geral ou scraping de página HTML
   - oGol: desabilitar ou substituir

2. **Criar fonte alternativa: SofaScore/FlashScore**
   - Adicionar `sofascore_api` como nova fonte
   - API gratuita com dados de classificação e jogos

### Fase 2: Melhorar Parser CBF

Como a CBF usa JavaScript, temos duas opções:

**Opção A: Scraping de Notícias CBF (Recomendada)**
- URL: `https://www.cbf.com.br/futebol-brasileiro/noticias/campeonato-brasileiro-serie-a`
- Extrair resultados de jogos das notícias
- Mais estável pois não depende de JavaScript

**Opção B: API Não-Oficial**
- Usar endpoint interno da CBF se disponível
- Exemplo: APIs usadas pelo app mobile

### Fase 3: Implementar CRON

Criar job de sincronização automática usando pg_cron:

```sql
-- A cada 2 horas: sync tabela
-- A cada 15 minutos: sync RSS
-- A cada hora: sync transmissões
-- Diário às 06:00: gerar notícias IA
```

### Fase 4: Fallback com Dados Mock

Enquanto as fontes reais não funcionam:
- Manter dados mock dos 20 times do Brasileirão 2026
- Permitir entrada manual via admin

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/br-sync-cbf/index.ts` | Nova estratégia de scraping |
| `supabase/functions/br-sync-news-rss/index.ts` | URLs corretas + fallback |
| Banco (br_sources) | Atualizar URLs |
| Novo: migration para pg_cron | Jobs de sincronização |

---

## Ação Imediata Recomendada

Como as fontes externas têm limitações, recomendo:

1. **Atualizar br_sources** com URLs corretas
2. **Implementar parser alternativo** usando notícias da CBF (HTML estático)
3. **Criar CRON jobs** para sincronização automática
4. **Usar GE como scraping de página** em vez de RSS

---

## Seção Técnica

### Nova Estratégia CBF

Em vez de tentar parsear a tabela dinâmica, usar:

```typescript
// Fonte: Notícias da CBF com resultados
const CBF_NEWS_URL = 'https://www.cbf.com.br/futebol-brasileiro/noticias/campeonato-brasileiro-serie-a';

// Extrair títulos de notícias com resultados
// Ex: "Análise do VAR: São Paulo (SP) X Flamengo (RJ) - 1ª Rodada"
// Parsear times e rodada do título
```

### Nova Estratégia GE

Scraping direto da página do Brasileirão:

```typescript
const GE_BRASILEIRAO_URL = 'https://ge.globo.com/futebol/brasileirao-serie-a/';

// Parsear títulos de notícias da página
// Extrair links e datas das matérias
// Salvar como br_news_items
```

### CRON Jobs

```sql
-- Sync CBF a cada 2 horas
SELECT cron.schedule('sync-cbf-standings', '0 */2 * * *', $$
  SELECT net.http_post(
    url := 'https://qfavfwvsficnqaznincz.supabase.co/functions/v1/br-sync-cbf',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer anon_key"}'::jsonb,
    body := '{"action": "standings"}'::jsonb
  );
$$);

-- Sync GE a cada 30 minutos
SELECT cron.schedule('sync-ge-news', '*/30 * * * *', $$
  SELECT net.http_post(
    url := 'https://qfavfwvsficnqaznincz.supabase.co/functions/v1/br-sync-news-rss',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer anon_key"}'::jsonb,
    body := '{}'::jsonb
  );
$$);
```

---

## O Que Já Funciona

1. **✅ Geração de Notícias IA** - Testado e criou artigo com sucesso
2. **✅ Hooks React** - Todos os 14 hooks funcionando
3. **✅ Admin UI** - 3 páginas de gestão criadas
4. **✅ Public UI** - Abas e componentes implementados
5. **✅ Sistema de Logs** - Registrando erros corretamente
6. **✅ Rate Limiting** - Token bucket funcionando
7. **✅ Circuit Breaker** - Proteção ativando após falhas

---

## Próximos Passos

1. Corrigir URLs e estratégia de scraping
2. Implementar CRON para automação
3. Adicionar fonte alternativa (API de futebol gratuita)
4. Testar fluxo completo end-to-end
