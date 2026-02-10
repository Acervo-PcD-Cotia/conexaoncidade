
# Correcao: Web TV continua aparecendo mesmo desativada

## Causa raiz

A homepage e renderizada por secoes dinamicas (`DynamicHomeSection`), e cada secao pode ter um campo `moduleKey` que, quando presente, faz a secao ser ocultada se o modulo estiver desativado (logica em `useSiteConfig.ts` linha 209).

O problema: a secao `video_block` (que renderiza o player "WebTV Conexao" na homepage) **nao tem `moduleKey` definido** no banco de dados. Portanto, ela sempre aparece, independentemente do toggle `web_tv`.

Alem disso, a secao `live_broadcast` tem `moduleKey: "lives"` em vez de `"web_tv"`, entao tambem nao responde ao toggle.

E o componente `LiveBroadcastWidget` renderiza tanto TV quanto Radio internamente, sem verificar se cada modulo esta ativo.

## Solucao

### 1. Migracao SQL — adicionar `moduleKey` correto nas `home_sections`

Atualizar o campo `home_sections` do template `journalist` para:
- `video_block` (ordem 2): adicionar `"moduleKey": "web_tv"`  
- `live_broadcast` (ordem 6): trocar `"moduleKey": "lives"` por nenhum ou manter (depende do contexto — `lives` e um modulo diferente)

```sql
UPDATE portal_templates
SET home_sections = jsonb_set(
  home_sections::jsonb,
  -- para cada item do array que tem type = video_block, adicionar moduleKey = web_tv
)
WHERE key = 'journalist';
```

Na pratica, a migracao vai reescrever o array `home_sections` completo com os moduleKeys corretos.

### 2. `LiveBroadcastWidget.tsx` — respeitar toggles de modulos

Importar `useModuleEnabled` e:
- Ocultar a secao TV quando `web_tv` esta desativado
- Ocultar a secao Radio quando `web_radio` esta desativado
- Se ambos estiverem desativados, retornar `null`

```tsx
const isRadioEnabled = useModuleEnabled('web_radio');
const isTvEnabled = useModuleEnabled('web_tv');

// Se ambos desativados, nao mostrar widget
if (!isRadioEnabled && !isTvEnabled) return null;

// Dentro do grid, renderizar condicionalmente cada secao
{isTvEnabled && (/* TV section */)}
{isRadioEnabled && (/* Radio section */)}
```

### 3. `HomeVideoBlock.tsx` — verificar modulo (seguranca extra)

Adicionar verificacao `useModuleEnabled('web_tv')` como fallback de seguranca, retornando `null` se desativado. Isso protege mesmo se o `moduleKey` no banco nao estiver configurado.

---

## Resumo de alteracoes

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Adicionar `moduleKey: "web_tv"` na secao `video_block` do template |
| `src/components/home/HomeVideoBlock.tsx` | Adicionar guard `useModuleEnabled('web_tv')` |
| `src/components/home/LiveBroadcastWidget.tsx` | Renderizar TV/Radio condicionalmente baseado nos modulos |

## Impacto

- Desativar Web TV no dashboard remove imediatamente o player da homepage
- Desativar Web Radio remove a secao de radio do widget
- Sem alteracao na arquitetura ou em outros componentes
