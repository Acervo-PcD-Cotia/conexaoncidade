
# Plano: Corrigir Execução do Auto Post Regional

## Diagnóstico

### Erro Encontrado
```
[Regional Admin] Action: run_now, source_id: undefined
Error: source_id is required
```

### Causa Raiz
- O botão "Executar Ingestão" no Dashboard chama `runIngest.mutate(undefined)` sem passar um `source_id`
- A edge function `regional-admin-tools` na ação `run_now` exige `source_id`
- Porém, a edge function `regional-ingest` **suporta** ser chamada sem `source_id` (processa todas as fontes ativas)

### Fluxo Atual (Quebrado)
```text
┌─────────────────────┐     ┌────────────────────────┐     ┌──────────────────┐
│  Dashboard          │     │ regional-admin-tools   │     │ regional-ingest  │
│  "Executar Ingestão"│────>│ action: run_now        │──X──│                  │
│  source_id: null    │     │ ERROR: required        │     │                  │
└─────────────────────┘     └────────────────────────┘     └──────────────────┘
```

---

## Solução Proposta

Adicionar nova ação `run_all` na edge function `regional-admin-tools` que chama `regional-ingest` sem filtro de fonte, processando **todas as fontes ativas**.

### Arquivo: `supabase/functions/regional-admin-tools/index.ts`

**Adicionar novo case `run_all` após o case `run_now`** (após linha 60):

```typescript
case 'run_all': {
  // Run ingestion for ALL active sources
  const response = await fetch(`${supabaseUrl}/functions/v1/regional-ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({}), // No source_id = all sources
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

---

### Arquivo: `src/hooks/useRegionalAutoPost.ts`

**Modificar hook `useRunRegionalIngest`** para usar ação correta (linha 217-243):

```typescript
export function useRunRegionalIngest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId?: string) => {
      // Use 'run_all' when no sourceId, 'run_now' for specific source
      const action = sourceId ? 'run_now' : 'run_all';
      
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action, source_id: sourceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-runs'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      
      if (data.results && data.results.length > 0) {
        const totalNew = data.results.reduce((sum: number, r: any) => sum + (r.items_new || 0), 0);
        const totalDup = data.results.reduce((sum: number, r: any) => sum + (r.items_duplicated || 0), 0);
        toast.success(`Ingestão concluída: ${totalNew} novos, ${totalDup} duplicados`);
      } else {
        toast.success('Ingestão executada');
      }
    },
    onError: (error) => {
      toast.error(`Erro na ingestão: ${error.message}`);
    },
  });
}
```

---

## Fluxo Corrigido

```text
┌─────────────────────┐     ┌────────────────────────┐     ┌──────────────────┐
│  Dashboard          │     │ regional-admin-tools   │     │ regional-ingest  │
│  "Executar Ingestão"│────>│ action: run_all        │────>│ source_id: null  │
│  source_id: null    │     │ (no validation needed) │     │ = ALL sources    │
└─────────────────────┘     └────────────────────────┘     └──────────────────┘
                                                                    │
                                                                    ▼
                                                           ┌──────────────────┐
                                                           │ Processa todas   │
                                                           │ fontes ativas    │
                                                           │ (13 prefeituras) │
                                                           └──────────────────┘
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `supabase/functions/regional-admin-tools/index.ts` | Adicionar case `run_all` |
| `src/hooks/useRegionalAutoPost.ts` | Usar `run_all` quando `sourceId` for undefined |

---

## Benefícios

1. **Botão "Executar Ingestão" funcionará** - Processará todas as 13 prefeituras de uma vez
2. **Mantém compatibilidade** - Execução individual por fonte continua funcionando
3. **Feedback melhorado** - Mostra total de novos/duplicados de todas as fontes

---

## Problema Adicional: Encoding de Caracteres

Observei nos screenshots que os títulos estão com encoding incorreto:
- `inscri&#231;&#245;es` → deveria ser `inscrições`
- `F&#233;rias` → deveria ser `Férias`

Isso é um problema de parsing do RSS que exigiria decode de HTML entities. Posso adicionar isso ao plano se desejar.
