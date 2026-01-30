
# PATCH FINAL — Notícias AI (Prompt Mestre v2)

## Problema Identificado

**Localização:** `supabase/functions/noticias-ai-generate/index.ts`, linhas 641-655

**Causa:** As tags HTML no `systemPrompt` estão escritas como texto literal (`<p>`, `<h2>`, etc.) em vez de entidades HTML. Quando o prompt é enviado para a IA, essas tags podem ser interpretadas como markup real ou filtradas, deixando a IA sem instrução clara sobre a formatação HTML esperada.

**Trecho Atual (problemático):**
```typescript
## 5. CONTEÚDO HTML (OBRIGATÓRIO)
O campo "conteudo" deve ser HTML válido usando APENAS estas tags:
<p>, <h2>, <blockquote>, <strong>, <ul>, <li>

Regras:
- O primeiro parágrafo deve ser o lide em negrito:
  <p><strong>Lide completo com informações principais.</strong></p>
- Intertítulos: usar <h2>...</h2>
- Citações longas: usar <blockquote>...</blockquote>
- Parágrafos sempre separados por <p>...</p>
```

---

## Solução: Usar Entidades HTML

**Substituir** a seção 5 completa (linhas 641-655) pela versão com entidades HTML blindadas:

```typescript
## 5. CONTEÚDO HTML (OBRIGATÓRIO)
O campo "conteudo" deve ser HTML válido usando APENAS estas tags:
&lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;

Regras:
- O primeiro parágrafo deve ser o lide em negrito:
  &lt;p&gt;&lt;strong&gt;Lide completo com informações principais.&lt;/strong&gt;&lt;/p&gt;
- Intertítulos: usar &lt;h2&gt;...&lt;/h2&gt;
- Citações longas: usar &lt;blockquote&gt;...&lt;/blockquote&gt;
- Parágrafos sempre separados por &lt;p&gt;...&lt;/p&gt;

PROIBIÇÕES:
- NÃO inclua URLs de imagens no conteúdo
- NÃO inclua tags HTML fora da lista permitida
- NÃO inclua o array "tags" dentro do conteúdo
```

---

## Arquivo a Modificar

| Arquivo | Linhas | Ação |
|---------|--------|------|
| `supabase/functions/noticias-ai-generate/index.ts` | 641-655 | Substituir tags HTML por entidades HTML |

---

## Alterações Detalhadas

### Antes vs. Depois

| Linha | Antes (Literal) | Depois (Entidade) |
|-------|-----------------|-------------------|
| 643 | `<p>, <h2>, <blockquote>, <strong>, <ul>, <li>` | `&lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;` |
| 647 | `<p><strong>Lide completo...</strong></p>` | `&lt;p&gt;&lt;strong&gt;Lide completo...&lt;/strong&gt;&lt;/p&gt;` |
| 648 | `<h2>...</h2>` | `&lt;h2&gt;...&lt;/h2&gt;` |
| 649 | `<blockquote>...</blockquote>` | `&lt;blockquote&gt;...&lt;/blockquote&gt;` |
| 650 | `<p>...</p>` | `&lt;p&gt;...&lt;/p&gt;` |
| 655 | `array de "tags"` | `o array "tags"` (pequena correção textual) |

---

## Seção Técnica

### Por que entidades HTML?

Quando strings contendo `<p>` são processadas em diferentes contextos (logging, parsing, rendering), elas podem ser:
- Interpretadas como markup
- Sanitizadas/removidas por segurança
- Escapadas de forma inconsistente

Usar entidades HTML (`&lt;` = `<`, `&gt;` = `>`) garante que:
- O texto é preservado literalmente
- A IA recebe a instrução completa
- Não há risco de injection ou sanitização

### Validação Pós-Deploy

Após aplicar o patch, testar com uma entrada simples para verificar se a IA:
1. Retorna JSON válido
2. O campo `conteudo` contém tags HTML corretas
3. O lide está em negrito (`<p><strong>...</strong></p>`)
