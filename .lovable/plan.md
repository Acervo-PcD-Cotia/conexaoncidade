

# Motor de Circulacao + Tracking + Relatorios

## Mapeamento da Realidade do Projeto (PARTE 0)

Tabelas reais identificadas:
- **Noticias** = `news` (106 artigos publicados -- seed NAO necessario)
- **Cliques** = `click_events` (usada pelo sistema de Links/Bio -- NAO reutilizar)
- **Perfis** = `profiles` (id, full_name, avatar_url, bio)
- **Membros** = `community_members` (user_id, level, points, share_count, city, neighborhood)
- **Shares** = `community_shares` (user_id, content_type, content_id, platform)

Pagina de noticia: `/noticia/:slug` em `src/pages/NewsDetail.tsx`
Painel do membro: `/comunidade` em `src/pages/community/CommunityHub.tsx`
Botoes de share: `src/components/news/ShareButtons.tsx`

**Decisao critica**: `click_events` serve o sistema de Links/Bio e NAO tem `news_id` nem `ref_code`. Criar tabela nova `news_clicks` e a abordagem correta para nao quebrar o sistema existente.

---

## BUILD ORDER

### Etapa 1: Migration SQL (aditiva, sem alterar RLS existente)

```text
-- 1. Tabela news_clicks (tracking de circulacao de noticias)
CREATE TABLE public.news_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  ref_code TEXT NULL,
  src TEXT NOT NULL DEFAULT 'direct',
  referrer TEXT NULL,
  user_agent TEXT NULL,
  device_type TEXT NULL,
  browser TEXT NULL,
  ip_hash TEXT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_clicks_news_date ON public.news_clicks(news_id, clicked_at);
CREATE INDEX idx_news_clicks_ref ON public.news_clicks(ref_code, clicked_at);
CREATE INDEX idx_news_clicks_src ON public.news_clicks(src, clicked_at);

ALTER TABLE public.news_clicks ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (tracking publico)
CREATE POLICY "Tracking publico insere news_clicks"
  ON public.news_clicks FOR INSERT WITH CHECK (true);

-- Admins/editors podem ler
CREATE POLICY "Admin le news_clicks"
  ON public.news_clicks FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- Membros podem ler seus proprios cliques (por ref_code)
CREATE POLICY "Membro le proprios news_clicks"
  ON public.news_clicks FOR SELECT
  USING (
    ref_code IS NOT NULL AND
    ref_code = (
      SELECT ref_code FROM public.community_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );

-- 2. Adicionar ref_code aos membros da comunidade
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS ref_code TEXT UNIQUE;

-- Gerar ref_code automatico para membros existentes
UPDATE public.community_members
SET ref_code = LOWER(SUBSTR(MD5(user_id::text), 1, 8))
WHERE ref_code IS NULL;

-- Trigger para gerar ref_code em novos membros
CREATE OR REPLACE FUNCTION generate_member_ref_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_code IS NULL THEN
    NEW.ref_code := LOWER(SUBSTR(MD5(NEW.user_id::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_ref_code
  BEFORE INSERT ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION generate_member_ref_code();
```

### Etapa 2: Helper de normalizacao de `src`

Arquivo: `src/lib/circulationUtils.ts` (novo)

- Funcao `normalizeSrc(src: string): string` -- aceita apenas `wa`, `ig`, `fb`, `x`, `direct`. Qualquer outro valor vira `direct`.
- Funcao `buildShareUrl(slug: string, refCode: string, src: string): string` -- gera `/noticia/{slug}?ref={refCode}&src={src}`
- Funcao `buildShareText(titulo: string, resumo: string, link: string, cidade: string): string` -- template da mensagem pronta
- Funcao `parseUserAgentSimple(ua: string)` -- extrair device_type e browser

### Etapa 3: Tracking na pagina de noticia

Arquivo: `src/pages/NewsDetail.tsx`

- No `useEffect` de mount, ler query params `ref` e `src` da URL
- Normalizar `src` com o helper
- Inserir em `news_clicks`: news_id, ref_code (de `ref`), src normalizado, user_agent (navigator.userAgent), referrer (document.referrer)
- Manter o increment de `view_count` existente (linha 214-220)
- Inserir apenas 1x por sessao (usar sessionStorage com chave `nc_{newsId}`)

### Etapa 4: Botoes de compartilhamento no painel do membro

Arquivo: `src/components/community/MemberSharePanel.tsx` (novo componente)

Para cada noticia recente (ultimas 10 publicadas), mostrar:
- Titulo da noticia
- **4 botoes**: WhatsApp, Facebook, Instagram, X
- **Botao principal**: "Copiar Link" (src=direct)
- Ao clicar em qualquer botao: copia para clipboard o link COM `?ref={refCode}&src={rede}` + texto pronto
- Textarea editavel com template: `{CIDADE} -- {TITULO}\n{RESUMO}\nConfira: {LINK}`
- Label "Alcance gerado" em vez de "Cliques recebidos" com microcopy

Arquivo: `src/hooks/useMemberCirculation.ts` (novo)
- Buscar `ref_code` do membro logado em `community_members`
- Buscar noticias recentes publicadas
- Buscar contagem de cliques por `ref_code` do membro em `news_clicks`

Integracao: Adicionar aba ou secao no `CommunityHub.tsx` com o `MemberSharePanel`

### Etapa 5: Tela Admin "Materia X"

Arquivo: `src/pages/admin/NewsAnalytics.tsx` (novo)
Rota: `/admin/noticias/:id` (registrar no App.tsx)

UI:
- Titulo da noticia
- Total de cliques (count de `news_clicks` para esse `news_id`)
- Distribuicao por rede (`src`): cards com wa, ig, fb, x, direct
- Refs unicos (count distinct `ref_code`)
- "Destaques de contribuicao" (Top 10 ref_codes com mais cliques)
  - JOIN com `community_members` + `profiles` para nome e bairro
  - Se RLS bloquear join: 2 queries separadas
- Botao "Voltar" para lista de noticias
- Filtro opcional de periodo (7/14/30 dias)

### Etapa 6: Relatorio Semanal Admin

Arquivo: `src/pages/admin/WeeklyReport.tsx` (novo)
Rota: `/admin/relatorio-semanal` (registrar no App.tsx + sidebar)

UI:
- Seletor de periodo: 7 / 14 / 30 dias
- Cards: Total de cliques, Refs ativos (distintos), Materias publicadas
- Top 5 materias por cliques
- Distribuicao por rede (grafico ou cards com wa/ig/fb/x/direct)
- "Destaques da semana" (Top 10 refs) com nome + bairro (nunca "ranking")
- Botao "Copiar resumo" -- gera texto formatado para WhatsApp:
  - Periodo, total cliques, rede que mais circulou, top 3 materias, 5 destaques

### Etapa 7: Seed -- NAO NECESSARIO

O banco ja tem 106 artigos publicados. Nenhuma acao necessaria.

### Etapa 8: Ajustes OG / fallback

- `NewsDetail.tsx` ja tem OG tags completos (linhas 299-327)
- Ja tem fallback de imagem (og_image_url || featured_image_url)
- Nenhuma acao adicional necessaria, pois a implementacao existente ja cobre o requisito

---

## Arquivos a Criar

1. `src/lib/circulationUtils.ts` -- helpers de normalizacao
2. `src/components/community/MemberSharePanel.tsx` -- botoes de share no painel
3. `src/hooks/useMemberCirculation.ts` -- dados de circulacao do membro
4. `src/pages/admin/NewsAnalytics.tsx` -- tela Materia X
5. `src/pages/admin/WeeklyReport.tsx` -- relatorio semanal

## Arquivos a Modificar

1. `src/pages/NewsDetail.tsx` -- adicionar tracking de ref+src
2. `src/pages/community/CommunityHub.tsx` -- integrar MemberSharePanel
3. `src/App.tsx` -- registrar rotas /admin/noticias/:id e /admin/relatorio-semanal
4. `src/components/admin/AdminSidebar.tsx` -- adicionar link para relatorio semanal

## Edge Function (OPCIONAL)

A edge function `click-tracker` ja existe e faz hash de IP. Podemos reutilizar o padrao para criar uma variante `news-click-tracker` se necessario, mas para o MVP o tracking client-side com ip_hash=null e suficiente e mais simples.

---

## O que NAO sera feito (conforme regras)

- Nenhuma alteracao de RLS existente
- Nenhuma refatoracao de arquitetura
- Nenhum uso da palavra "ranking" ou "controle"
- Nenhuma URL externa inventada para imagens
- Nenhuma coleta de dados pessoais de quem clicou
- Nenhum PDF no relatorio (apenas "Copiar resumo")

