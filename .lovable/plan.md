
# Implementacao do Modulo Esportes - Pronto para Execucao

A chave `RAPIDAPI_KEY` foi verificada e esta configurada corretamente no projeto. Agora vou implementar o modulo completo.

## Status Atual

- RAPIDAPI_KEY: Configurada
- Tabelas do banco: Todas existentes (football_teams, football_matches, football_standings, etc.)
- Estrutura do projeto: Analisada

## Arquivos a Criar

### 1. Tipos TypeScript
`src/types/football.ts` - Tipos para matches, teams, standings, player stats, helpers

### 2. Edge Function 
`supabase/functions/football-api/index.ts` - API completa com:
- GET /fixtures - Jogos por data/liga/status
- GET /standings - Tabela de classificacao
- GET /team - Dados do time
- GET /match - Detalhe da partida
- GET /topscorers - Artilharia
- GET /search - Busca de times
- POST /sync - Sincronizacao manual
- Cache inteligente (15s-24h baseado no tipo)

### 3. Hook useFootball
`src/hooks/useFootball.ts` - React Query hooks:
- useMatches, useLiveMatches, useTodayMatches
- useStandings
- useTeam, useTeamSearch
- useMatchDetail
- useTopScorers
- useFavoriteTeams, useToggleFavorite
- useSyncFootballData

### 4. Componentes Visuais
- `src/components/esportes/TeamBadge.tsx`
- `src/components/esportes/FormBadge.tsx`
- `src/components/esportes/MatchCard.tsx`
- `src/components/esportes/LiveMatchCard.tsx`
- `src/components/esportes/StandingsTable.tsx`
- `src/components/esportes/TeamSearch.tsx`
- `src/components/esportes/MatchStats.tsx`
- `src/components/esportes/RoundSelector.tsx`
- `src/components/esportes/CompetitionHeader.tsx`
- `src/components/esportes/PlayerStatsTable.tsx`

### 5. Paginas Publicas SEO-First
- `src/pages/public/esportes/BrasileiraoPage.tsx` - Home
- `src/pages/public/esportes/SerieDetailPage.tsx` - Serie A/B
- `src/pages/public/esportes/MatchDetailPage.tsx` - Detalhe do jogo
- `src/pages/public/esportes/TeamDetailPage.tsx` - Pagina do time
- `src/pages/public/esportes/RoundPage.tsx` - Jogos da rodada
- `src/pages/public/esportes/StatsHubPage.tsx` - Hub estatisticas
- `src/pages/public/esportes/TopScorersPage.tsx` - Artilharia

### 6. Arquivos a Modificar
- `supabase/config.toml` - Adicionar football-api
- `src/App.tsx` - Registrar rotas publicas
- `src/pages/admin/esportes/*.tsx` - Conectar dados reais

## Rotas Publicas

```
/esportes/brasileirao
/esportes/brasileirao/:serie (serie-a, serie-b)
/esportes/brasileirao/:serie/rodada/:round
/esportes/brasileirao/:serie/jogo/:slug
/esportes/brasileirao/:serie/time/:slug
/esportes/brasileirao/:serie/estatisticas
/esportes/brasileirao/:serie/estatisticas/artilharia
```

## Funcionalidades

1. Jogos ao vivo com refresh 15s
2. Tabela com destaque G4/Z4
3. Busca de times com autocomplete
4. Paginas SEO com Schema.org
5. Sistema de times favoritos
6. Estatisticas de jogadores
7. Cache inteligente multi-nivel

## Proximos Passos

Ao aprovar, implementarei todos os arquivos listados acima em sequencia.
