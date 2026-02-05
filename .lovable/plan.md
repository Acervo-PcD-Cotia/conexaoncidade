
# Relatório de Auditoria Completa — Portal Conexão na Cidade
## Versão: Superadmin | Data: 05/02/2026

---

## Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Achados Detalhados](#achados-detalhados)
3. [Auditoria do Módulo Notícias AI / Importação JSON](#auditoria-noticias-ai)
4. [Segurança - RLS e Acesso](#seguranca-rls)
5. [Plano de Correção em 3 Fases](#plano-de-correcao)

---

## 1. Resumo Executivo

### Estado Atual do Sistema (Nota 0-10)

| Área | Nota | Justificativa |
|------|------|---------------|
| **Segurança** | 5/10 | 99 warnings no linter, 68+ políticas RLS permissivas (USING true/WITH CHECK true), perfis públicos expostos, leaked password protection desabilitada |
| **Importação/Notícias AI** | 8/10 | Regras de categoria, tags e SEO bem implementadas; falta sanitização HTML no conteúdo importado |
| **SEO** | 8/10 | Schema.org NewsArticle implementado, meta tags corretas, 90% das notícias com meta_title/description |
| **Performance** | 7/10 | Fallback timeout na homepage, lazy loading implementado, mas 271 tabelas pode impactar |
| **UX/UI** | 7/10 | Layout responsivo, estados de loading, mas muitos `dangerouslySetInnerHTML` sem sanitização |
| **Estabilidade** | 7/10 | 82 edge functions, arquitetura sólida, mas funções sem search_path fixo |

### Top 10 Riscos Críticos

| # | Risco | Severidade | Localização |
|---|-------|------------|-------------|
| 1 | **Perfis públicos expostos** - Tabela `profiles` com SELECT público (`qual:true`) | CRÍTICO | RLS `profiles` |
| 2 | **68+ políticas RLS permissivas** - INSERT/UPDATE/DELETE com `WITH CHECK (true)` | CRÍTICO | Múltiplas tabelas |
| 3 | **dangerouslySetInnerHTML sem sanitização** - 21 arquivos renderizam HTML não sanitizado | CRÍTICO | ArticleContent.tsx, RichTextEditor.tsx, etc |
| 4 | **Leaked password protection desabilitada** | ALTO | Auth config |
| 5 | **Extension pg_trgm em schema public** | ALTO | Database |
| 6 | **28 funções sem search_path fixo** | MÉDIO | Funções do banco |
| 7 | **Security Definer View detectada** | MÉDIO | View no banco |
| 8 | **Apenas 2 usuários com roles** (super_admin, collaborator) | BAIXO | user_roles |
| 9 | **10% das notícias sem imagem destacada** | BAIXO | Tabela news |
| 10 | **3-4 tags por notícia (média)** - algumas abaixo do mínimo recomendado de 3 | BAIXO | Tabela news_tags |

---

## 2. Achados Detalhados

### SEC-001: Perfis de Usuário Expostos Publicamente
- **Onde**: Política RLS `Perfis são visíveis publicamente` na tabela `profiles`
- **Evidência**: `qual:true` permite SELECT sem autenticação
- **Impacto**: Atacantes podem extrair nomes, avatares, bios e preferências de todos os usuários
- **Correção**:
```text
1. Alterar a política para exigir autenticação:
   CREATE POLICY "Perfis visíveis para autenticados" ON profiles
   FOR SELECT TO authenticated USING (true);
   
2. Ou limitar campos públicos com uma VIEW específica
```
- **Esforço**: P (1-2 horas)
- **Dependências**: Verificar se frontend depende de leitura pública

### SEC-002: 68+ Políticas RLS Permissivas
- **Onde**: Múltiplas tabelas (autopost_*, broadcast_*, community_*, etc)
- **Evidência**: Linter reporta 68 warnings de `USING (true)` ou `WITH CHECK (true)`
- **Impacto**: Qualquer usuário autenticado pode INSERT/UPDATE/DELETE dados sem restrição
- **Correção**:
```text
Para cada tabela afetada:
1. Auditar se a permissividade é intencional
2. Substituir WITH CHECK (true) por verificação de role:
   WITH CHECK (is_admin_or_editor(auth.uid()))
3. Priorizar tabelas sensíveis: user_roles, news, profiles
```
- **Esforço**: G (8-16 horas para todas)
- **Dependências**: Documentar quais tabelas devem ser públicas

### SEC-003: HTML Não Sanitizado em Renderização
- **Onde**: 21 arquivos usam `dangerouslySetInnerHTML`
- **Arquivos críticos**:
  - `src/components/article/ArticleContent.tsx` (linha 15)
  - `src/components/admin/RichTextEditor.tsx` (linha 226)
  - `src/pages/EventDetail.tsx` (linha 306)
  - `src/components/conexao-ai/AIContentPreview.tsx` (linha 138)
- **Evidência**: Conteúdo de notícias renderizado sem passar por DOMPurify
- **Impacto**: XSS armazenado se atacante injetar script via importação JSON ou editor
- **Correção**:
```text
1. Instalar DOMPurify: npm install dompurify @types/dompurify
2. Criar hook useSanitizedHtml:
   const cleanHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
3. Aplicar em todos os componentes que usam dangerouslySetInnerHTML
```
- **Esforço**: M (4-6 horas)
- **Dependências**: Nenhuma

### SEC-004: Leaked Password Protection Desabilitada
- **Onde**: Configuração de autenticação
- **Evidência**: Linter warning #99
- **Impacto**: Usuários podem usar senhas já vazadas em data breaches
- **Correção**: Habilitar via dashboard do backend ou API
- **Esforço**: P (15 minutos)

### SEC-005: Funções sem search_path Fixo
- **Onde**: 28 funções no schema public
- **Evidência**: Linter warnings #2-28
- **Impacto**: Potencial vulnerabilidade a ataques de schema poisoning
- **Correção**: Já corrigidas 9 funções na última migração; aplicar mesmo padrão nas restantes
- **Esforço**: M (2-3 horas)

---

## 3. Auditoria do Módulo Notícias AI / Importação JSON

### Conformidade com Regras Oficiais

| Regra | Status | Evidência |
|-------|--------|-----------|
| Não resumir conteúdo (95-105% do original) | PARCIAL | Edge function repassa conteúdo da IA sem validar tamanho |
| Data original ISO 8601 | NÃO VERIFICADO | Campo `data_original` não encontrado na estrutura JSON |
| Imagens: não inventar URLs | OK | `isValidImageUrl()` valida padrões de imagem |
| Imagem única: replicar para hero/og/card | OK | Fallback implementado em `NoticiasAI.tsx` linha 289 |
| Categoria inválida → usar "Geral" | OK | `isValidCategory()` com fallback em `constants/categories.ts` |
| Tags: 3-12, primeira = cidade, incluir "Cotia" | OK | Regra blindada em `ensureRequiredFields()` linhas 96-119 |
| Limites SEO: resumo ≤160, meta_titulo ≤60, meta_descricao ≤160 | PARCIAL | Validação no editor mas não no JSON import |
| Estrutura HTML: lide em `<strong>` | OK | `autoFixFirstParagraph()` corrige automaticamente |

### Achados Específicos da Importação

#### JSON-001: Validação de Limites SEO Ausente na Importação
- **Onde**: `supabase/functions/noticias-ai-generate/index.ts`
- **Evidência**: Não há validação de `meta_titulo.length <= 60` ou `meta_descricao.length <= 160` antes de retornar
- **Impacto**: Títulos/descrições longas passam sem truncamento
- **Correção**:
```text
Adicionar em ensureRequiredFields():
seo: {
  meta_titulo: article.seo?.meta_titulo?.substring(0, 60) || article.titulo.substring(0, 60),
  meta_descricao: article.seo?.meta_descricao?.substring(0, 160) || article.resumo.substring(0, 160)
}
```
- **Esforço**: P (30 minutos)

#### JSON-002: Campo data_original Não Implementado
- **Onde**: Interface NewsArticle
- **Evidência**: Não existe campo para data original da fonte
- **Impacto**: Todas as notícias importadas usam `now()` como data de publicação
- **Correção**:
```text
1. Adicionar campo opcional data_original: string (ISO 8601) na interface
2. Usar esse valor para published_at se fornecido
3. Adicionar validação de formato ISO 8601
```
- **Esforço**: M (2 horas)

#### JSON-003: Sanitização HTML do Conteúdo
- **Onde**: `sanitizeContent()` linhas 68-92
- **Evidência**: Remove `<img>` e URLs de imagem, mas não sanitiza tags perigosas (script, etc)
- **Impacto**: XSS potencial se fonte injetar HTML malicioso
- **Correção**: Usar biblioteca de sanitização HTML no edge function
- **Esforço**: M (2-3 horas)

### Dados Reais do Sistema (Amostra de 20 notícias)

| Métrica | Valor |
|---------|-------|
| Total de notícias | 106 |
| Com meta_title | 95 (90%) |
| Com meta_description | 95 (90%) |
| Com imagem destacada | 77 (73%) |
| Com fonte | 95 (90%) |
| Média de tags por notícia | 7 |
| Tags em conformidade (3-12) | OK |
| Meta títulos > 60 chars | 2 de 20 (10%) |

---

## 4. Segurança - RLS e Acesso

### Tabelas Sensíveis e Políticas Atuais

| Tabela | SELECT | INSERT | UPDATE | DELETE | Risco |
|--------|--------|--------|--------|--------|-------|
| `profiles` | PUBLIC | auth.uid() | auth.uid() | - | ALTO (leitura pública) |
| `user_roles` | admin OR owner | admin only | - | - | OK |
| `news` | published OR editor | editor | editor | editor | OK |
| `audit_logs` | - | true | - | - | MÉDIO (insert aberto) |
| `autopost_*` (múltiplas) | true | true | true | - | ALTO |
| `broadcast_autodj_settings` | true | auth | auth | - | MÉDIO |
| `community_*` (múltiplas) | auth | auth | owner | - | OK |

### Recomendações de Hardening

1. **Upload de arquivos**: Verificar buckets `ads` e `campaign-assets` possuem validação de tipo MIME
2. **Headers de segurança**: Adicionar CSP, X-Frame-Options via edge function ou CDN
3. **Rate limiting**: Implementar em endpoints críticos (login, importação JSON, edge functions de IA)
4. **Brute force protection**: Habilitar proteção nativa do Supabase Auth
5. **Sanitização HTML**: Obrigatória em todos os pontos de entrada de conteúdo

---

## 5. Plano de Correção em 3 Fases

### Fase 1: Correções Críticas (1-2 dias)
_Objetivo: Estabilizar segurança básica_

| Prioridade | Ação | Responsável | Estimativa |
|------------|------|-------------|------------|
| P1 | Restringir RLS da tabela `profiles` para autenticados | Backend | 1h |
| P1 | Habilitar leaked password protection | Config | 15min |
| P1 | Implementar DOMPurify em ArticleContent.tsx | Frontend | 2h |
| P2 | Adicionar validação de limites SEO na edge function | Backend | 1h |
| P2 | Corrigir 5 tabelas autopost mais críticas | Backend | 3h |

### Fase 2: Melhorias Estruturais (1 semana)
_Objetivo: Resolver débitos técnicos de segurança_

| Prioridade | Ação | Responsável | Estimativa |
|------------|------|-------------|------------|
| P2 | Corrigir todas as 28 funções sem search_path | Backend | 3h |
| P2 | Auditar e corrigir 68 políticas RLS permissivas | Backend | 8h |
| P2 | Adicionar sanitização HTML na edge function de importação | Backend | 3h |
| P2 | Implementar campo data_original no import JSON | Full-stack | 4h |
| P3 | Migrar extensão pg_trgm para schema extensions | Backend | 2h |
| P3 | Aplicar DOMPurify em todos os 21 arquivos com dangerouslySetInnerHTML | Frontend | 6h |

### Fase 3: Otimizações e Evolução (2-4 semanas)
_Objetivo: Robustez e observabilidade_

| Prioridade | Ação | Responsável | Estimativa |
|------------|------|-------------|------------|
| P3 | Implementar rate limiting em edge functions | Backend | 4h |
| P3 | Adicionar headers de segurança (CSP, HSTS) | DevOps | 2h |
| P3 | Criar testes automatizados para validação de importação | QA | 8h |
| P3 | Implementar auditoria de conteúdo (hash/fingerprint de duplicatas) | Backend | 4h |
| P3 | Dashboard de métricas de segurança (tentativas de login, erros RLS) | Full-stack | 8h |
| P4 | Documentar todas as políticas RLS e justificativas | Docs | 4h |

---

## Observações Técnicas Adicionais

### Arquitetura Atual
- **271 tabelas** no schema public (quantidade alta, considerar modularização)
- **82 edge functions** (boa separação de responsabilidades)
- **120+ rotas** no frontend (conforme auditoria anterior)
- **Whitelist de 26 categorias** funcionando corretamente

### Pontos Positivos Identificados
1. Sistema de roles via tabela separada (`user_roles`) - padrão correto de segurança
2. Hook `useRequireRole` com verificação server-side
3. Implementação de Schema.org NewsArticle para SEO
4. Sistema de duplicação de notícias com verificação de slug/source/título
5. Fallback timeout na homepage (5s) previne loading infinito
6. Sanitização de embeds via `sanitizeEmbedCode()` bem implementada
7. Categorias com whitelist e fallback para "Geral"
8. Geração automática de WebStory e Podcast após publicação

### Pontos de Atenção
1. Verificar implementação de CSP headers
2. Monitorar logs de edge functions para erros silenciosos
3. Considerar implementar WAF para proteção adicional
4. Validar configuração de CORS nas edge functions

---

_Relatório gerado em: 05/02/2026_
_Escopo: Varredura completa do projeto Portal Conexão na Cidade_
_Autenticação: Superadmin bs7freitas@gmail.com_
