
# Plano: Modulo Esportes Completo - Campeonato Brasileiro

## Visao Geral

Implementar o modulo de esportes profissional focado no Campeonato Brasileiro (Serie A e B), com:
- Edge Function para integracao com API-Football (RapidAPI)
- Paginas publicas SEO-first com meta tags dinamicas
- Sistema de cache inteligente (15s ao vivo, 5min jogos do dia, 30min tabela)
- Componentes reutilizaveis (MatchCard, StandingsTable, TeamSearch)
- Hook useFootball para gerenciamento de dados
- Estrutura preparada para monetizacao Publidoor

---

## 1. Arquitetura Geral

```text
+---------------------------+       +------------------+       +------------------+
|   Paginas Publicas SEO    |  -->  |   useFootball    |  -->  | Edge Functions   |
|   /esportes/brasileirao/* |       |   (React Query)  |       | football-api     |
+---------------------------+       +------------------+       +------------------+
                                            |                           |
                                            v                           v
                                    +------------------+       +------------------+
                                    |   Componentes    |       |  football_*      |
                                    |   Reutilizaveis  |       |  tables + cache  |
                                    +------------------+       +------------------+
```

---

## 2. Edge Function: football-api

### 2.1 Estrutura

**Arquivo:** `supabase/functions/football-api/index.ts`

Endpoints:
- `GET /fixtures` - Jogos por data/competicao/status
- `GET /standings` - Tabela de classificacao
- `GET /teams/:id` - Dados do time
- `GET /players/top` - Artilharia/assistencias
- `GET /h2h/:teamA/:teamB` - Historico de confrontos
- `POST /sync` - Sincronizacao manual (admin)

### 2.2 Cache Inteligente

```typescript
// Estrategia de cache por tipo de dado
const CACHE_TTL = {
  LIVE_MATCHES: 15,        // 15 segundos
  TODAY_MATCHES: 300,      // 5 minutos
  SCHEDULED_MATCHES: 600,  // 10 minutos
  STANDINGS: 1800,         // 30 minutos
  TEAM_INFO: 86400,        // 24 horas
  PLAYER_STATS: 3600,      // 1 hora
};
```

### 2.3 Integracao API-Football

Requer secret: `RAPIDAPI_KEY`

```typescript
// Headers para API-Football (RapidAPI)
const headers = {
  'X-RapidAPI-Key': Deno.env.get('RAPIDAPI_KEY'),
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
};

// Endpoints principais
// GET /fixtures?league=71&season=2026 (Serie A = 71, Serie B = 72)
// GET /standings?league=71&season=2026
// GET /players/topscorers?league=71&season=2026
```

### 2.4 Logica de Cache

```typescript
async function getCachedOrFetch(cacheKey: string, ttlSeconds: number, fetchFn: () => Promise<any>) {
  // 1. Verificar cache no Supabase (football_api_cache)
  const cached = await supabase
    .from('football_api_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .single();
  
  if (cached.data && new Date(cached.data.expires_at) > new Date()) {
    return cached.data.data;
  }
  
  // 2. Buscar da API externa
  const freshData = await fetchFn();
  
  // 3. Salvar no cache
  await supabase.from('football_api_cache').upsert({
    cache_key: cacheKey,
    data: freshData,
    expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString()
  });
  
  return freshData;
}
```

---

## 3. Hook useFootball

**Arquivo:** `src/hooks/useFootball.ts`

### 3.1 Estrutura

```typescript
// Tipos
interface FootballMatch {
  id: string;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  matchDate: string;
  round: number;
  venue?: string;
  elapsedTime?: number;
}

interface FootballTeam {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
}

interface StandingsEntry {
  position: number;
  team: FootballTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
}
```

### 3.2 Hooks Exportados

```typescript
export function useMatches(options: { 
  competitionSlug: string; 
  date?: string; 
  round?: number;
  status?: 'live' | 'today' | 'scheduled' | 'finished';
}) {
  // React Query com refetch interval baseado no status
  // Live: 15s, Today: 60s, Others: 5min
}

export function useStandings(competitionSlug: string) {
  // Tabela com refetch a cada 30min
}

export function useTeam(teamSlug: string) {
  // Dados do time + ultimos jogos + posicao
}

export function useMatchDetail(matchSlug: string) {
  // Partida + stats + eventos + H2H
}

export function useTopScorers(competitionSlug: string) {
  // Artilharia com refetch a cada 1h
}

export function useTeamSearch(query: string) {
  // Busca de times com debounce
}

export function useFavoriteTeam(userId: string, teamId: string) {
  // Gerenciamento de time favorito
}
```

---

## 4. Componentes Visuais

### 4.1 Novos Componentes

| Componente | Descricao |
|------------|-----------|
| `MatchCard.tsx` | Card de partida com placar, status, times |
| `LiveMatchCard.tsx` | Variante com animacao de ao vivo |
| `StandingsTable.tsx` | Tabela com destaque G4/rebaixamento |
| `TeamBadge.tsx` | Escudo + nome do time |
| `TeamSearch.tsx` | Input com autocomplete |
| `MatchStats.tsx` | Estatisticas da partida (posse, chutes, etc) |
| `H2HHistory.tsx` | Historico de confrontos |
| `PlayerStatsRow.tsx` | Linha de artilharia/assistencias |
| `FormBadge.tsx` | Ultimos 5 jogos (VVVED) |
| `RoundSelector.tsx` | Navegacao entre rodadas |
| `CompetitionTabs.tsx` | Tabs Serie A/Serie B |

### 4.2 MatchCard

```tsx
interface MatchCardProps {
  match: FootballMatch;
  variant?: 'compact' | 'full';
  showRound?: boolean;
  showVenue?: boolean;
  onClick?: () => void;
}

// Layout compact:
// [Logo] COR 2-1 PAL [Logo]  |  45' [Badge AO VIVO]

// Layout full:
// Rodada 15 • Arena Corinthians
// [Logo Grande] Corinthians   2
// [Logo Grande] Palmeiras     1
// [Badge AO VIVO - 2o Tempo - 45']
```

### 4.3 StandingsTable

```tsx
interface StandingsTableProps {
  standings: StandingsEntry[];
  highlightTeamId?: string;
  showForm?: boolean;
  filter?: 'all' | 'home' | 'away' | 'last5';
}

// Visual:
// - G4 (Libertadores): fundo verde sutil
// - 5-6 (Pre-Libertadores): fundo azul sutil
// - 7-12 (Sul-Americana): fundo laranja sutil
// - Ultimos 4 (Rebaixamento): fundo vermelho sutil
// - Time favorito/selecionado: borda primaria
```

### 4.4 TeamSearch

```tsx
interface TeamSearchProps {
  onSelect: (team: FootballTeam) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// Comportamento:
// - Debounce de 300ms
// - Autocomplete com escudo + nome
// - Destaca times do Brasileirao
// - Ao selecionar, navega para /esportes/brasileirao/serie-a/time/[slug]
```

---

## 5. Paginas Publicas SEO-First

### 5.1 Estrutura de Rotas

```text
/esportes/brasileirao                     → Home do Brasileirao
/esportes/brasileirao/serie-a             → Serie A (tabela + jogos)
/esportes/brasileirao/serie-b             → Serie B
/esportes/brasileirao/serie-a/rodada/:n   → Jogos da rodada N
/esportes/brasileirao/serie-a/jogo/:slug  → Pagina da partida
/esportes/brasileirao/serie-a/time/:slug  → Pagina do time
/esportes/brasileirao/serie-a/estatisticas → Hub de estatisticas
/esportes/brasileirao/serie-a/estatisticas/artilharia
/esportes/brasileirao/serie-a/estatisticas/cartoes
```

### 5.2 Home do Brasileirao

**Arquivo:** `src/pages/public/esportes/BrasileiraoPage.tsx`

```tsx
// Layout:
// [Header com busca de time]
// [Tabs: Ao Vivo | Jogos de Hoje | Rodada Atual | Tabela | Estatisticas]
// [Filtro: Serie A | Serie B]

// Helmet:
<Helmet>
  <title>Brasileirao 2026 - Jogos, Tabela e Resultados | Conexao na Cidade</title>
  <meta name="description" content="Acompanhe o Campeonato Brasileiro 2026. Jogos ao vivo, tabela de classificacao, resultados e estatisticas da Serie A e Serie B." />
  <script type="application/ld+json">
    {JSON.stringify(sportsEventSchema)}
  </script>
</Helmet>
```

### 5.3 Pagina do Jogo

**Arquivo:** `src/pages/public/esportes/MatchDetailPage.tsx`

```tsx
// Layout:
// [Header com times + placar grande]
// [Status: Ao Vivo / Encerrado / Agendado]
// [Grid 2 colunas:
//   - Estatisticas da partida
//   - Eventos (gols, cartoes)
// ]
// [Historico H2H]
// [Forma recente dos times]
// [Slot de patrocinio Publidoor]

// URL: /esportes/brasileirao/serie-a/jogo/corinthians-x-palmeiras-2026-05-15
// Slug gerado: {home_slug}-x-{away_slug}-{YYYY-MM-DD}
```

### 5.4 Pagina do Time

**Arquivo:** `src/pages/public/esportes/TeamDetailPage.tsx`

```tsx
// Layout:
// [Header com escudo grande + nome + estadio]
// [Cards: Posicao | Pontos | V/E/D | Ultimos 5]
// [Proximo jogo destacado]
// [Ultimos 5 jogos]
// [Desempenho Casa/Fora]
// [Artilheiro do time]
// [Noticias relacionadas do portal]

// SEO automatico:
// Title: "Corinthians - Tabela, Jogos e Estatisticas | Brasileirao 2026"
// Description gerada dinamicamente com posicao atual e forma
```

### 5.5 Schema.org

```typescript
// SportsEvent para jogos
const matchSchema = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "Corinthians x Palmeiras",
  "startDate": "2026-05-15T16:00:00-03:00",
  "location": {
    "@type": "Place",
    "name": "Neo Quimica Arena",
    "address": "Sao Paulo, Brasil"
  },
  "competitor": [
    { "@type": "SportsTeam", "name": "Corinthians" },
    { "@type": "SportsTeam", "name": "Palmeiras" }
  ]
};

// SportsTeam para times
const teamSchema = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  "name": "Sport Club Corinthians Paulista",
  "sport": "Football",
  "location": {
    "@type": "Place",
    "name": "Neo Quimica Arena"
  }
};
```

---

## 6. Arquivos a Criar

### 6.1 Edge Functions

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/football-api/index.ts` | API principal de futebol |

### 6.2 Hooks

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useFootball.ts` | Hook principal de dados de futebol |

### 6.3 Tipos

| Arquivo | Descricao |
|---------|-----------|
| `src/types/football.ts` | Tipos TypeScript para o modulo |

### 6.4 Componentes

| Arquivo | Descricao |
|---------|-----------|
| `src/components/esportes/MatchCard.tsx` | Card de partida |
| `src/components/esportes/LiveMatchCard.tsx` | Card ao vivo |
| `src/components/esportes/StandingsTable.tsx` | Tabela de classificacao |
| `src/components/esportes/TeamBadge.tsx` | Badge de time |
| `src/components/esportes/TeamSearch.tsx` | Busca de times |
| `src/components/esportes/MatchStats.tsx` | Stats da partida |
| `src/components/esportes/H2HHistory.tsx` | Historico de confrontos |
| `src/components/esportes/FormBadge.tsx` | Ultimos 5 jogos |
| `src/components/esportes/PlayerStatsRow.tsx` | Estatisticas de jogador |
| `src/components/esportes/RoundSelector.tsx` | Seletor de rodada |
| `src/components/esportes/CompetitionHeader.tsx` | Header da competicao |

### 6.5 Paginas Publicas

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/public/esportes/BrasileiraoPage.tsx` | Home do Brasileirao |
| `src/pages/public/esportes/SerieDetailPage.tsx` | Pagina da Serie (A/B) |
| `src/pages/public/esportes/MatchDetailPage.tsx` | Detalhe da partida |
| `src/pages/public/esportes/TeamDetailPage.tsx` | Detalhe do time |
| `src/pages/public/esportes/RoundPage.tsx` | Jogos da rodada |
| `src/pages/public/esportes/StatsHubPage.tsx` | Hub de estatisticas |
| `src/pages/public/esportes/TopScorersPage.tsx` | Artilharia |
| `src/pages/public/esportes/CardsPage.tsx` | Cartoes |

---

## 7. Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `supabase/config.toml` | Adicionar football-api function |
| `src/App.tsx` | Registrar rotas publicas de esportes |
| `src/pages/admin/esportes/EsportesDashboard.tsx` | Conectar com dados reais |
| `src/pages/admin/esportes/BrasileiraoHome.tsx` | Conectar com dados reais |
| `src/pages/admin/esportes/EsportesEstatisticas.tsx` | Conectar com dados reais |

---

## 8. Secrets Necessarios

A implementacao requer uma chave de API para API-Football (RapidAPI):

| Secret | Descricao |
|--------|-----------|
| `RAPIDAPI_KEY` | Chave de acesso ao API-Football via RapidAPI |

**Nota:** Sera solicitada a adicao desta secret antes de prosseguir.

---

## 9. Detalhes de Implementacao

### 9.1 Refetch Intervals por Status

```typescript
const getRefetchInterval = (status: string) => {
  switch (status) {
    case 'live':
      return 15 * 1000;    // 15 segundos
    case 'today':
      return 60 * 1000;    // 1 minuto
    case 'scheduled':
      return 5 * 60 * 1000; // 5 minutos
    default:
      return 30 * 60 * 1000; // 30 minutos
  }
};
```

### 9.2 Destaques Visuais na Tabela

```typescript
const getPositionHighlight = (position: number, totalTeams: number) => {
  if (position <= 4) return 'bg-green-500/10 border-l-2 border-l-green-500'; // G4
  if (position <= 6) return 'bg-blue-500/10 border-l-2 border-l-blue-500';   // Pre-Liberta
  if (position <= 12) return 'bg-orange-500/10 border-l-2 border-l-orange-500'; // Sula
  if (position > totalTeams - 4) return 'bg-red-500/10 border-l-2 border-l-red-500'; // Z4
  return '';
};
```

### 9.3 URL Slug para Jogos

```typescript
const generateMatchSlug = (match: FootballMatch) => {
  const date = format(new Date(match.matchDate), 'yyyy-MM-dd');
  return `${match.homeTeam.slug}-x-${match.awayTeam.slug}-${date}`;
  // Resultado: "corinthians-x-palmeiras-2026-05-15"
};
```

### 9.4 Indicador Visual de Jogo Ao Vivo

```tsx
// LiveMatchCard inclui:
// - Borda pulsante verde
// - Badge "AO VIVO" animado
// - Tempo decorrido atualizado
// - Placar em destaque

<div className="relative animate-pulse-border border-2 border-green-500">
  <Badge className="absolute -top-2 -right-2 bg-red-500 animate-pulse">
    AO VIVO
  </Badge>
  {/* ... */}
</div>
```

---

## 10. Integracao com Publidoor (Slots de Monetizacao)

### 10.1 Locais de Patrocinio

| Local | Tipo |
|-------|------|
| Header da competicao | Banner horizontal |
| Pagina do jogo | Patrocinador da partida |
| Pagina do time | Patrocinador do time |
| Entre jogos na lista | Card patrocinado |
| Jogos ao vivo | Oferta relampago |

### 10.2 Componente de Slot

```tsx
<PublidoorSlot 
  type="match_sponsor" 
  context={{ matchId, homeTeam, awayTeam }}
  fallback={null}
/>
```

---

## 11. Rotas a Registrar no App.tsx

```tsx
// Rotas publicas de Esportes (dentro do PublicLayout)
<Route path="/esportes/brasileirao" element={<BrasileiraoPage />} />
<Route path="/esportes/brasileirao/:serie" element={<SerieDetailPage />} />
<Route path="/esportes/brasileirao/:serie/rodada/:round" element={<RoundPage />} />
<Route path="/esportes/brasileirao/:serie/jogo/:slug" element={<MatchDetailPage />} />
<Route path="/esportes/brasileirao/:serie/time/:slug" element={<TeamDetailPage />} />
<Route path="/esportes/brasileirao/:serie/estatisticas" element={<StatsHubPage />} />
<Route path="/esportes/brasileirao/:serie/estatisticas/artilharia" element={<TopScorersPage />} />
<Route path="/esportes/brasileirao/:serie/estatisticas/cartoes" element={<CardsPage />} />
```

---

## 12. Ordem de Implementacao

1. Solicitar secret `RAPIDAPI_KEY`
2. Criar `src/types/football.ts` (tipos TypeScript)
3. Criar `supabase/functions/football-api/index.ts` (Edge Function)
4. Atualizar `supabase/config.toml`
5. Criar `src/hooks/useFootball.ts`
6. Criar componentes base:
   - TeamBadge, FormBadge
   - MatchCard, LiveMatchCard
   - StandingsTable
   - TeamSearch
7. Criar paginas publicas:
   - BrasileiraoPage
   - SerieDetailPage
   - MatchDetailPage
   - TeamDetailPage
8. Registrar rotas em App.tsx
9. Atualizar paginas admin para usar dados reais
10. Testar fluxo completo

---

## 13. Resumo

| Categoria | Quantidade |
|-----------|------------|
| Edge Functions | 1 |
| Hooks | 1 (com 8 funcoes) |
| Tipos | 1 arquivo |
| Componentes | 11 |
| Paginas Publicas | 8 |
| Secrets | 1 (RAPIDAPI_KEY) |
