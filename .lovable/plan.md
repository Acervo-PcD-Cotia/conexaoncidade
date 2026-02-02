
# Correção de Datas de Notícias

## Visão Geral

Criar uma ferramenta administrativa para corrigir datas de notícias com duas opções:
1. **Buscar data original** - Extrair a data real da fonte via Firecrawl
2. **Definir data manualmente** - Escolher uma data específica

---

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                      NewsList.tsx                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Barra de ações em lote (quando itens selecionados)          ││
│  │  [Excluir] [Corrigir Datas] [Cancelar]                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DateCorrectionDialog                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Modo de correção:                                            ││
│  │  ○ Buscar data original da fonte (via IA)                   ││
│  │  ○ Definir data manualmente: [Calendário]                   ││
│  │                                                              ││
│  │ Notícias selecionadas: 5                                     ││
│  │  - "Cesta básica do servidor..." (30/01/2026)               ││
│  │  - "Cultura abre inscrições..." (30/01/2026)                ││
│  │  ...                                                         ││
│  │                                                              ││
│  │ [Cancelar]  [Corrigir Datas]                                ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌───────────────────┐                     ┌───────────────────┐
│ Modo: Data Original│                     │ Modo: Manual      │
│                    │                     │                   │
│ Edge Function:     │                     │ Supabase Client:  │
│ fix-publication-   │                     │ .update()         │
│ dates              │                     │ published_at      │
└───────────────────┘                     └───────────────────┘
```

---

## Componentes a Criar

### 1. DateCorrectionDialog.tsx

Novo componente de modal para correção de datas:

| Prop | Tipo | Descrição |
|------|------|-----------|
| `open` | boolean | Controla visibilidade do dialog |
| `onOpenChange` | function | Callback ao fechar |
| `selectedNews` | NewsItem[] | Lista de notícias selecionadas |
| `onSuccess` | function | Callback após correção bem-sucedida |

**Funcionalidades:**
- Dois modos de operação: "original" (buscar via Firecrawl) ou "manual" (date picker)
- Lista as notícias selecionadas com suas datas atuais
- Indicador de progresso durante processamento
- Relatório de resultados ao finalizar

---

### 2. Modificações no NewsList.tsx

Adicionar na barra de ações em lote:
- Botão "Corrigir Datas" (ícone Calendar)
- Integração com o novo DateCorrectionDialog

---

### 3. Edge Function: fix-publication-dates (já existe)

Aproveitar a Edge Function existente, que já suporta:
- `dryRun`: simular sem aplicar
- `limit`: quantidade por lote
- `targetDate`: filtrar por data específica
- `onlyMissing`: apenas sem `original_published_at`

**Adicionar novo parâmetro:**
- `newsIds`: array de IDs específicos para processar

---

## Detalhes de Implementação

### Arquivo 1: `src/components/admin/DateCorrectionDialog.tsx`

```typescript
interface DateCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: Array<{
    id: string;
    title: string;
    published_at: string | null;
    source: string | null;
  }>;
  onSuccess: () => void;
}

type CorrectionMode = 'original' | 'manual';
```

**Estados do componente:**
- `mode`: 'original' | 'manual'
- `manualDate`: Date | undefined
- `isProcessing`: boolean
- `progress`: { current: number, total: number }
- `results`: ProcessResult[]

**UI do Dialog:**
1. Header com título "Corrigir Datas de Publicação"
2. RadioGroup para selecionar modo
3. Se modo manual: DatePicker com Popover + Calendar
4. Lista scrollável de notícias selecionadas
5. Botões Cancelar/Corrigir
6. Durante processamento: Progress bar + logs em tempo real
7. Ao finalizar: Resumo com sucesso/erros

---

### Arquivo 2: Modificação em `src/pages/admin/NewsList.tsx`

Adicionar:
1. Import do DateCorrectionDialog
2. Estado `dateCorrectionOpen`
3. Botão na barra de ações em lote
4. Renderização do Dialog

```typescript
// Novo estado
const [dateCorrectionOpen, setDateCorrectionOpen] = useState(false);

// Na barra de ações
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => setDateCorrectionOpen(true)}
>
  <Calendar className="mr-2 h-4 w-4" />
  Corrigir Datas
</Button>

// No final do componente
<DateCorrectionDialog
  open={dateCorrectionOpen}
  onOpenChange={setDateCorrectionOpen}
  selectedNews={news?.filter(n => selectedIds.has(n.id)) || []}
  onSuccess={() => {
    queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    setSelectedIds(new Set());
  }}
/>
```

---

### Arquivo 3: Modificação em `supabase/functions/fix-publication-dates/index.ts`

Adicionar suporte para processar IDs específicos:

```typescript
const { 
  dryRun = true, 
  limit = 50, 
  daysBack = 30,
  onlyMissing = true,
  targetDate = null,
  newsIds = null  // NOVO: array de IDs específicos
} = await req.json().catch(() => ({}));

// Se newsIds fornecido, filtrar por esses IDs
if (newsIds && Array.isArray(newsIds) && newsIds.length > 0) {
  console.log(`Processing specific news IDs: ${newsIds.length} items`);
  query = query.in('id', newsIds);
}
```

---

## Fluxo de Uso

### Cenário 1: Corrigir com data original

1. Usuário seleciona notícias na lista
2. Clica em "Corrigir Datas"
3. Seleciona modo "Buscar data original da fonte"
4. Clica em "Corrigir"
5. Sistema chama Edge Function fix-publication-dates
6. Firecrawl extrai datas das fontes originais
7. Banco de dados é atualizado
8. Usuário vê relatório de resultados

### Cenário 2: Definir data manualmente

1. Usuário seleciona notícias na lista
2. Clica em "Corrigir Datas"
3. Seleciona modo "Definir data manualmente"
4. Escolhe data no calendário (ex: 06/01/2026)
5. Clica em "Corrigir"
6. Sistema atualiza diretamente via Supabase client
7. Todas as notícias selecionadas recebem a mesma data
8. Usuário vê confirmação

---

## Resumo das Alterações

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/admin/DateCorrectionDialog.tsx` | Criar | Modal de correção de datas com dois modos |
| `src/pages/admin/NewsList.tsx` | Modificar | Adicionar botão e integrar dialog |
| `supabase/functions/fix-publication-dates/index.ts` | Modificar | Adicionar suporte para `newsIds` |

---

## Resultado Esperado

Após implementação:

| Funcionalidade | Antes | Depois |
|---------------|-------|--------|
| Correção individual | ❌ Não existia | ✅ Via menu de ações |
| Correção em lote | ❌ Apenas via curl | ✅ Interface visual |
| Data original automática | ✅ Via Edge Function | ✅ + Interface visual |
| Data manual | ❌ Não existia | ✅ Date picker integrado |
| Feedback de progresso | ❌ Logs apenas | ✅ Progress bar + resultados |
