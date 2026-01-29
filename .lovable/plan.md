
# Plano de Implementacao: Fases 3 e 4 - Admin UI e Public UI

## Resumo

Este plano implementa as fases finais do modulo Brasileirao:
- **Fase 3**: Painel administrativo de controle e monitoramento
- **Fase 4**: UI publica com secoes de Noticias e Onde Assistir

---

## FASE 3: Painel Admin

### 3.1 Nova Pagina: BrasileiraoSync.tsx

**Rota:** `/admin/esportes/brasileirao/sync`

Dashboard de controle de sincronizacao com:

| Secao | Componentes |
|-------|-------------|
| Status das Fontes | Cards para CBF, GE, oGol com indicadores online/erro/offline |
| Metricas | KPI Cards: Noticias RSS hoje, Noticias IA, Jogos sync, Transmissoes |
| Acoes | Botoes: Sync CBF (Tabela), Sync CBF (Jogos), Sync RSS, Gerar IA, Sync Transmissoes |
| Logs | Lista das ultimas 20 sincronizacoes com filtro por fonte |

**Hooks utilizados:**
- `useBrSources()` - Status das fontes
- `useBrFetchLogs()` - Logs de sincronizacao
- `useSyncCbf()` - Mutation para sync CBF
- `useSyncRss()` - Mutation para sync RSS
- `useSyncBroadcasts()` - Mutation para transmissoes
- `useGenerateAiNews()` - Mutation para gerar noticias

---

### 3.2 Nova Pagina: BrasileiraoBroadcasts.tsx

**Rota:** `/admin/esportes/brasileirao/transmissoes`

Editor manual de "Onde Assistir" com:

| Secao | Funcionalidade |
|-------|----------------|
| Lista de Jogos | Proximos jogos da rodada atual |
| Editor | Campos para TV Aberta, TV Fechada, Streaming |
| Preview | Visualizacao de como aparece no site |
| Sync | Botao para sincronizar automaticamente |

**Hooks utilizados:**
- `useBrBroadcasts()` - Lista de transmissoes
- `useUpdateBroadcast()` - Mutation para salvar
- `useUpcomingMatches()` (do useFootball) - Jogos proximos

---

### 3.3 Nova Pagina: BrasileiraoNews.tsx

**Rota:** `/admin/esportes/brasileirao/noticias`

Gerenciador de noticias geradas por IA:

| Secao | Funcionalidade |
|-------|----------------|
| Lista | Noticias geradas com status (draft/published) |
| Filtros | Por tipo, status, data |
| Acoes | Publicar, Despublicar, Editar, Regenerar |
| Gerar | Botoes para gerar por tipo (recap, preview, etc) |

**Hooks utilizados:**
- `useBrGeneratedNews()` - Lista de noticias
- `useUpdateGeneratedNewsStatus()` - Mutation para status
- `useGenerateAiNews()` - Mutation para gerar

---

### 3.4 Atualizacao: EsportesDashboard.tsx

Adicionar links para as novas paginas:

```
- Sync & Monitoramento -> /admin/esportes/brasileirao/sync
- Transmissoes -> /admin/esportes/brasileirao/transmissoes
- Noticias IA -> /admin/esportes/brasileirao/noticias
```

---

## FASE 4: UI Publica

### 4.1 Novo Componente: WhereToWatchCard.tsx

Card compacto mostrando canais de transmissao:

```text
+----------------------------------------+
|  Onde Assistir                         |
|  [Globo] [SporTV] [Premiere]           |
|  [Globoplay] [Prime Video]             |
+----------------------------------------+
```

**Props:**
- `broadcast: BrBroadcast`
- `variant: 'compact' | 'full'`

---

### 4.2 Novo Componente: WhereToWatchSection.tsx

Secao completa para listagem por rodada:

| Elemento | Descricao |
|----------|-----------|
| Seletor de Rodada | Dropdown para escolher rodada |
| Lista de Jogos | Cards com time vs time + canais |
| Destaque | Proximo jogo em destaque |

---

### 4.3 Novo Componente: ExternalNewsCard.tsx

Card para noticias do GE/oGol:

```text
+----------------------------------------+
| [Imagem]                               |
| Titulo da Noticia                      |
| Trecho...                              |
| GE • 2 horas atras            [Ler ->] |
+----------------------------------------+
```

**Props:**
- `news: BrNewsItem`
- `compact?: boolean`

---

### 4.4 Novo Componente: GeneratedNewsCard.tsx

Card para noticias geradas pelo portal:

```text
+----------------------------------------+
| [Badge: Portal]                        |
| Titulo da Noticia Gerada               |
| Trecho do conteudo...                  |
| Conexao na Cidade • 1 hora             |
+----------------------------------------+
```

**Props:**
- `news: BrGeneratedNews`
- `showBadge?: boolean`

---

### 4.5 Novo Componente: BrasileiraoNewsSection.tsx

Secao de noticias com abas:

```text
+----------------------------------------+
| [Portal] [GE] [oGol]                   |
+----------------------------------------+
| Lista de noticias conforme aba ativa   |
+----------------------------------------+
```

---

### 4.6 Atualizacao: MatchDetailPage.tsx

Adicionar card "Onde Assistir" no topo da pagina:

**Mudancas:**
1. Importar `useBrBroadcastByMatch` e `WhereToWatchCard`
2. Buscar transmissao pelo `match.id`
3. Renderizar card antes das estatisticas

---

### 4.7 Atualizacao: BrasileiraoPage.tsx

Adicionar novas abas e secoes:

**Estrutura Nova:**

```text
+----------------------------------------+
| [Tabela] [Jogos] [Noticias] [TV]       |
+----------------------------------------+
|                                        |
|  Conteudo da aba ativa                 |
|                                        |
+----------------------------------------+
```

| Aba | Conteudo |
|-----|----------|
| Tabela | StandingsTable existente |
| Jogos | MatchCards existentes |
| Noticias | BrasileiraoNewsSection (novo) |
| TV | WhereToWatchSection (novo) |

---

### 4.8 Nova Pagina: GeneratedNewsDetail.tsx

Pagina para exibir noticia gerada:

**Rota:** `/esportes/brasileirao/noticia/:slug`

| Secao | Conteudo |
|-------|----------|
| Header | Titulo, data, tipo |
| Conteudo | HTML renderizado |
| SEO | Meta tags otimizadas |
| Relacionados | Link para jogo/rodada |

---

## Arquivos a Criar

### Admin (3 paginas):
```text
src/pages/admin/esportes/BrasileiraoSync.tsx
src/pages/admin/esportes/BrasileiraoBroadcasts.tsx
src/pages/admin/esportes/BrasileiraoNews.tsx
```

### Componentes Publicos (5 arquivos):
```text
src/components/esportes/WhereToWatchCard.tsx
src/components/esportes/WhereToWatchSection.tsx
src/components/esportes/ExternalNewsCard.tsx
src/components/esportes/GeneratedNewsCard.tsx
src/components/esportes/BrasileiraoNewsSection.tsx
```

### Pagina Publica (1 arquivo):
```text
src/pages/public/esportes/GeneratedNewsDetail.tsx
```

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Adicionar rotas admin e publica |
| `src/pages/admin/esportes/EsportesDashboard.tsx` | Links para novas paginas |
| `src/pages/public/esportes/BrasileiraoPage.tsx` | Adicionar abas e novas secoes |
| `src/pages/public/esportes/MatchDetailPage.tsx` | Card onde assistir |

---

## Rotas a Adicionar no App.tsx

### Admin:
```text
/admin/esportes/brasileirao/sync       -> BrasileiraoSync
/admin/esportes/brasileirao/transmissoes -> BrasileiraoBroadcasts
/admin/esportes/brasileirao/noticias   -> BrasileiraoNews
```

### Publica:
```text
/esportes/brasileirao/noticia/:slug    -> GeneratedNewsDetail
```

---

## Secao Tecnica

### Componente WhereToWatchCard - Estrutura

```tsx
interface WhereToWatchCardProps {
  broadcast: BrBroadcast;
  variant?: 'compact' | 'full';
}

// Badges de canais com cores distintas:
// TV Aberta (verde): Globo, Band, Record
// TV Fechada (azul): SporTV, Premiere, ESPN
// Streaming (roxo): Globoplay, Prime Video, Star+
```

### BrasileiraoPage - Nova Estrutura com Tabs

```tsx
<Tabs defaultValue="tabela">
  <TabsList>
    <TabsTrigger value="tabela">Tabela</TabsTrigger>
    <TabsTrigger value="jogos">Jogos</TabsTrigger>
    <TabsTrigger value="noticias">Noticias</TabsTrigger>
    <TabsTrigger value="tv">Onde Assistir</TabsTrigger>
  </TabsList>
  
  <TabsContent value="tabela">
    {/* StandingsTable existente */}
  </TabsContent>
  
  <TabsContent value="noticias">
    <BrasileiraoNewsSection />
  </TabsContent>
  
  <TabsContent value="tv">
    <WhereToWatchSection />
  </TabsContent>
</Tabs>
```

### SEO para Noticias Geradas

```tsx
// Schema.org para artigos
const schema = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": news.title,
  "description": news.seo_description,
  "datePublished": news.published_at,
  "publisher": {
    "@type": "Organization",
    "name": "Portal Conexao na Cidade"
  }
};
```

---

## Ordem de Implementacao

### Passo 1: Componentes Base (UI)
1. WhereToWatchCard.tsx
2. ExternalNewsCard.tsx
3. GeneratedNewsCard.tsx

### Passo 2: Secoes Compostas
4. WhereToWatchSection.tsx
5. BrasileiraoNewsSection.tsx

### Passo 3: Paginas Admin
6. BrasileiraoSync.tsx
7. BrasileiraoBroadcasts.tsx
8. BrasileiraoNews.tsx

### Passo 4: Atualizacoes
9. Atualizar EsportesDashboard.tsx
10. Atualizar BrasileiraoPage.tsx com abas
11. Atualizar MatchDetailPage.tsx

### Passo 5: Nova Pagina Publica
12. GeneratedNewsDetail.tsx

### Passo 6: Rotas
13. Atualizar App.tsx com todas as rotas

---

## Criterios de Aceite

| # | Criterio |
|---|----------|
| 1 | Admin pode ver status de todas as fontes |
| 2 | Admin pode disparar sync manual de cada fonte |
| 3 | Admin pode editar transmissoes manualmente |
| 4 | Admin pode ver e gerenciar noticias geradas |
| 5 | Usuario ve abas na pagina do Brasileirao |
| 6 | Usuario ve noticias do GE/oGol |
| 7 | Usuario ve noticias geradas pelo portal |
| 8 | Usuario ve onde assistir por jogo |
| 9 | Pagina de jogo mostra card onde assistir |
| 10 | Noticias geradas tem SEO otimizado |
