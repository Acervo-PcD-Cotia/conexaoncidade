

# Reverter Filtro de Categorias nas Notícias

## Problema Criado (por erro meu)

Eu implementei incorretamente um filtro que:
- Remove notícias do site quando a categoria está "Oculta"
- Isso está **ERRADO**

## Comportamento Correto Esperado

| Categoria | Status | Menu do Site | Notícias no Site |
|-----------|--------|--------------|------------------|
| Cultura | **Oculta** | ❌ Não aparece | ✅ Aparecem normalmente |
| Economia | **Oculta** | ❌ Não aparece | ✅ Aparecem normalmente |
| Saúde | Ativa | ✅ Aparece | ✅ Aparecem normalmente |

**Resumo:** O status "Oculta/Ativa" da categoria afeta **SOMENTE** a visibilidade no menu de navegação (Header e Footer), **NÃO** afeta as notícias.

---

## Alterações Necessárias

### Arquivo: `src/hooks/useNews.ts`

Reverter as mudanças em 6 locais:

| Hook/Função | Linha | Mudança |
|-------------|-------|---------|
| `useNews` | 81-85 | Remover `!inner` e filtro `is_active` |
| `useRelatedNews` (tags) | 321-326 | Remover `!inner` e filtro `is_active` |
| `useRelatedNews` (category) | 356-361 | Remover `!inner` e filtro `is_active` |
| `useRelatedNews` (latest) | 392-396 | Remover `!inner` e filtro `is_active` |
| `useFeaturedNews` | 432-436 | Remover `!inner` e filtro `is_active` |
| `useMostReadNews` | 469-473 | Remover `!inner` e filtro `is_active` |

---

## Código a Reverter

### Antes (ERRADO - o que eu fiz):
```typescript
.select(`
  *,
  category:categories!inner(id, name, slug, color, is_active)
`)
.eq('status', 'published')
.is('deleted_at', null)
.eq('category.is_active', true)  // ❌ REMOVER
```

### Depois (CORRETO - reverter para):
```typescript
.select(`
  *,
  category:categories(id, name, slug, color)
`)
.eq('status', 'published')
.is('deleted_at', null)
// Sem filtro de is_active
```

---

## Resumo

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/hooks/useNews.ts` | Modificar | Reverter filtros de `category.is_active` em 6 funções |

---

## Resultado Final

- ✅ Categorias "Ocultas" continuam invisíveis no menu (Header/Footer)
- ✅ Notícias de categorias "Ocultas" **aparecem normalmente** no site
- ✅ Buscas e pesquisas retornam notícias independente do status da categoria

