
# Plano de Correção: Sincronização do Módulo Brasileirão

## Diagnóstico Completo

A sincronização falha silenciosamente devido a múltiplos problemas na cadeia de dados:

### Problema Principal: Coluna GENERATED ALWAYS
A tabela `football_standings` possui a coluna `goal_difference` definida como **GENERATED ALWAYS** (calculada automaticamente como `goals_for - goals_against`). A edge function `br-sync-cbf` tenta inserir um valor nessa coluna, causando erro:

```text
ERROR: cannot insert a non-DEFAULT value into column "goal_difference"
```

Este erro acontece 20 vezes (uma por time) mas a função retorna "sucesso" porque não trata os erros de banco.

### Problema Secundário: Incompatibilidade de Slugs
- Competições originais (2024): `serie-a`, `serie-b`
- Nova competição (2026): `brasileirao-serie-a`
- O frontend usa `useCompetitionByType("Série A")` que busca por nome, não por slug

### Problema Terciário: Temporada Hardcoded
A UI exibe "Temporada 2025" fixo em vários lugares, causando confusão.

---

## Plano de Correção

### Fase 1: Corrigir Edge Function `br-sync-cbf`

Remover o campo `goal_difference` do upsert de standings, já que ele é calculado automaticamente pelo banco:

```typescript
// ANTES (causa erro)
await supabase.from('football_standings').upsert({
  competition_id: competitionId,
  season,
  position: i + 1,
  team_id: team.id,
  goals_for: 0,
  goals_against: 0,
  goal_difference: 0,  // REMOVER
  points: 0,
  ...
});

// DEPOIS (correto)
await supabase.from('football_standings').upsert({
  competition_id: competitionId,
  season,
  position: i + 1,
  team_id: team.id,
  goals_for: 0,
  goals_against: 0,
  // goal_difference é calculado automaticamente
  points: 0,
  ...
});
```

Também adicionar tratamento de erros nos upserts para logs adequados.

### Fase 2: Normalizar Slugs das Competições

Atualizar registros no banco para usar slugs consistentes:

```sql
-- Atualizar slug da competição 2026 para padrão existente
UPDATE football_competitions 
SET slug = 'serie-a' 
WHERE slug = 'brasileirao-serie-a' AND season = 2026;
```

Ou alternativamente, atualizar a edge function para buscar qualquer competição com "Série A" no nome.

### Fase 3: Corrigir Hook `useCompetitionByType`

Atualizar o hook para buscar a competição mais recente (maior season):

```typescript
export function useCompetitionByType(type: string) {
  return useQuery({
    queryKey: ["football", "competition", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_competitions")
        .select("*")
        .ilike("name", `%${type}%`)
        .order("season", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
```

### Fase 4: Dinamizar Temporada na UI

Substituir valores hardcoded por dados dinâmicos:

```typescript
// BrasileiraoPage.tsx
const currentSeason = serieACompetition?.season || new Date().getFullYear();

<CompetitionHeader 
  title="Campeonato Brasileiro" 
  subtitle={`Temporada ${currentSeason} • Série A e B`}
  currentSerie="serie-a"
/>
```

```typescript
// EsportesConfig.tsx - Linha 187
<span className="font-mono">{serieA?.season || 2026}</span>
```

### Fase 5: Adicionar Tratamento de Erros

Melhorar logs e tratamento de erros na edge function:

```typescript
const { error: upsertError } = await supabase
  .from('football_standings')
  .upsert(standingData, { onConflict: 'competition_id,team_id,season' });

if (upsertError) {
  console.error('Failed to upsert standing:', upsertError);
  continue;
}
processed++;
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/br-sync-cbf/index.ts` | Remover `goal_difference` do upsert, adicionar error handling |
| `src/hooks/useFootball.ts` | Ordenar por season DESC no `useCompetitionByType` |
| `src/pages/public/esportes/BrasileiraoPage.tsx` | Usar season dinâmica |
| `src/pages/admin/esportes/EsportesConfig.tsx` | Usar season dinâmica |
| **Migração SQL** | Normalizar slug da competição 2026 para `serie-a` |

---

## Resultado Esperado

Após as correções:
1. A sincronização vai inserir os 20 times na tabela de standings
2. O frontend vai encontrar a competição correta (2026)
3. A tabela de classificação será exibida no site
4. Os erros de banco serão logados adequadamente
5. A temporada será exibida dinamicamente
