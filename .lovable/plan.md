
# Plano: Automatizar Geração de WebStories no Notícias AI

## Contexto

O módulo **Notícias AI** possui 5 modos de entrada de conteúdo:
1. **Cadastro** - Detecção automática de modo
2. **Cadastro Manual** - Campos estruturados 
3. **JSON** - Importação via JSON
4. **Link** - Extração de URL única
5. **Lote** - Múltiplas URLs simultâneas

A geração automática de WebStories já existe via edge function `generate-webstory`, mas precisa ser garantida em TODOS os fluxos e ter um controle explícito na UI.

---

## Análise do Estado Atual

### O que já existe ✅
1. Edge function `generate-webstory` funcional (cria 5 slides padrão)
2. Coluna `auto_generate_webstory` na tabela `news` (default: `true`)
3. Código em `NoticiasAI.tsx` linha 310 que dispara geração após import
4. Tabelas `web_stories` e `web_story_slides` configuradas

### Problemas identificados 🔴
1. **Toggle ausente na UI**: Não há switch para ativar/desativar WebStory na interface de entrada
2. **Feedback ausente**: Usuário não sabe se WebStory foi gerada
3. **Inconsistência**: O campo `auto_generate_webstory` não é passado no insert, depende do default do DB

---

## Implementação Proposta

### 1. Adicionar Toggle "Gerar WebStory" na UI de Entrada

**Arquivo**: `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Adicionar ao card de "Destaques" um novo toggle:
```tsx
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label className="text-sm flex items-center gap-1.5">
      <Wand2 className="h-3.5 w-3.5 text-purple-500" />
      WebStory
    </Label>
    <p className="text-xs text-muted-foreground">Gerar WebStory automaticamente</p>
  </div>
  <Switch
    checked={generateWebStory}
    onCheckedChange={setGenerateWebStory}
  />
</div>
```

**Novo state**:
```tsx
const [generateWebStory, setGenerateWebStory] = useState(true); // Ativado por padrão
```

**Passar para onGenerate**:
```tsx
await onGenerate(processContent, mode, imageUrls, { ...highlights, generateWebStory });
```

---

### 2. Atualizar Interface HighlightSettings

**Arquivo**: `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Expandir a interface:
```typescript
export interface HighlightSettings {
  is_home_highlight: boolean;
  is_urgent: boolean;
  is_featured: boolean;
  generateWebStory: boolean;  // NOVO
}
```

---

### 3. Garantir Passagem no Insert de Notícia

**Arquivo**: `src/pages/admin/NoticiasAI.tsx`

Modificar o insert para incluir explicitamente:
```typescript
const { data: news, error: newsError } = await supabase
  .from('news')
  .insert({
    // ... campos existentes ...
    auto_generate_webstory: true, // Forçar explicitamente
  })
  .select()
  .single();
```

Ou, se houver preferência do usuário:
```typescript
auto_generate_webstory: article.generateWebStory ?? true,
```

---

### 4. Adicionar Feedback Visual Após Geração

**Arquivo**: `src/pages/admin/NoticiasAI.tsx`

Após a chamada bem-sucedida do `generate-webstory`, mostrar toast com link:
```typescript
if (news?.auto_generate_webstory) {
  supabase.functions.invoke('generate-webstory', {
    body: { newsId: news.id }
  }).then((response) => {
    if (response.data?.success) {
      toast({
        title: '📱 WebStory gerada!',
        description: 'Acesse a lista de stories para visualizar.',
        action: (
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/stories')}>
            Ver Stories
          </Button>
        ),
      });
    }
  }).catch(err => console.error('WebStory generation failed:', err));
}
```

---

### 5. Atualizar Fluxo de Artigo Manual

**Arquivo**: `src/pages/admin/NoticiasAI.tsx`

Adicionar campo `generateWebStory` no `ManualData`:
```typescript
interface ManualData {
  // ... campos existentes ...
  generateWebStory?: boolean;
}
```

E garantir que seja passado durante a importação.

---

### 6. Mostrar Badge "WebStory" na Lista de Artigos Processados

**Arquivo**: `src/components/admin/noticias-ai/NoticiasAIJsonTab.tsx`

Na lista de artigos, mostrar indicador:
```tsx
{article.generateWebStory !== false && (
  <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
    📱 WebStory
  </Badge>
)}
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Adicionar toggle WebStory, atualizar interface |
| `src/pages/admin/NoticiasAI.tsx` | Incluir campo no insert, melhorar feedback |
| `src/components/admin/noticias-ai/NoticiasAIJsonTab.tsx` | Badge indicador de WebStory |

---

## Fluxo Completo Após Implementação

```text
┌────────────────────────────────────────────────────────────────┐
│                      Notícias AI                                │
├────────────────────────────────────────────────────────────────┤
│  [Cadastro] [Manual] [JSON] [Link] [Lote]                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐│
│  │ 📷 Imagens   │  │ ⭐ Destaques                              ││
│  │              │  │   □ Home                                  ││
│  │              │  │   □ Urgente                               ││
│  │              │  │   □ Manchete                              ││
│  │              │  │   ✓ 📱 WebStory [NOVO]                    ││
│  └──────────────┘  └──────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Gerar Notícia]                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │ Processa com IA │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │  Insert em news │
                    │ auto_generate   │
                    │ _webstory=true  │
                    └────────┬────────┘
                             ↓
              ┌──────────────┴──────────────┐
              ↓                             ↓
     ┌─────────────────┐          ┌─────────────────┐
     │ generate-webstory│          │ generate-podcast│
     │  Edge Function  │          │  Edge Function  │
     └────────┬────────┘          └─────────────────┘
              ↓
     ┌─────────────────┐
     │ WebStory criada │
     │   5 slides      │
     │   status=pub    │
     └─────────────────┘
              ↓
     Toast: "📱 WebStory gerada!"
```

---

## Checklist de Implementação

- [ ] Adicionar state `generateWebStory` em NoticiasAIInput
- [ ] Adicionar toggle UI no card de Destaques
- [ ] Expandir interface `HighlightSettings`
- [ ] Passar campo para função `onGenerate`
- [ ] Atualizar `ManualData` interface
- [ ] Modificar insert para incluir `auto_generate_webstory`
- [ ] Adicionar feedback visual com toast e link
- [ ] Adicionar badge na lista de artigos JSON
- [ ] Testar todos os 5 modos de entrada

---

## Benefícios

1. **Automatização completa**: WebStory gerada automaticamente em TODOS os fluxos
2. **Controle do usuário**: Toggle permite desativar quando não desejado
3. **Feedback claro**: Usuário sabe que WebStory foi gerada
4. **Consistência**: Comportamento uniforme em todos os modos de entrada
