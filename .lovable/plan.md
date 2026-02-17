

## Varredura Completa: 3 Problemas Identificados

---

### Problema 1: Apenas 1 dos 5 anuncios aparece no site

**Causa raiz**: Os `slot_type` salvos no banco de dados nao correspondem aos `slotId` usados no codigo de renderizacao.

| Anuncio no banco | slot_type no DB | slotId esperado pelo codigo | Aparece? |
|---|---|---|---|
| Mega Destaque (970x250px) | `super_banner` | `super_banner` | SIM |
| Destaque Horizontal (728x90px) | `home_top` | `leaderboard` | NAO |
| Benilton Freitas (970x250) | `home_banner` | `super_banner` | NAO |
| Destaque Inteligente (300x250px) | `rectangle` | `retangulo_medio` | NAO |
| Painel Vertical (300x600px) | `skyscraper` | `arranha_ceu` | NAO |
| Alerta Comercial (580x400px) | `popup` | `popup` | NAO (nao ha slot popup na home) |

O `useAdUnit.ts` faz `eq('slot_type', slotId)`, mas os slotIds usados em `DynamicHomeSection.tsx` sao `leaderboard`, `retangulo_medio`, `arranha_ceu` -- que nao correspondem aos valores `home_top`, `rectangle`, `skyscraper` salvos no banco.

**Correcao**: Atualizar o `useAdUnit.ts` para incluir um mapeamento de aliases, permitindo que tanto os nomes antigos (`home_top`, `rectangle`, `skyscraper`) quanto os novos (`leaderboard`, `retangulo_medio`, `arranha_ceu`) encontrem os anuncios. A query usara `.in('slot_type', [slotId, ...aliases])` em vez de `.eq('slot_type', slotId)`.

---

### Problema 2: Nome do formato nao aparece na etiqueta "Publicidade"

A `AdLabel` no nivel `public` exibe apenas "Publicidade" sem indicar qual formato/tipo de anuncio esta sendo veiculado. Para o usuario administrador ver o nome do formato, o `level` precisa ser `admin` ou `superadmin`.

**Correcao**: Verificar que o `useAdDebugLevel` esta retornando o nivel correto para administradores logados e, se necessario, ajustar para que administradores sempre vejam o nivel `admin` por padrao. Tambem garantir que o `adType` passado ao `AdLabel` reflita o nome comercial do slot (ex: "Mega Destaque", "Destaque Horizontal") em vez do ID tecnico.

---

### Problema 3: Nomes das categorias fora do padrao

Na pagina de artigo, o chapeu mostra "EMPREGO & RENDA" que e o valor do campo `hat` da noticia, nao o nome oficial da categoria. A categoria oficial no banco seria "Economia" ou outra da whitelist de 26 categorias. O campo `hat` as vezes e preenchido pelo AI com valores que nao correspondem a whitelist oficial.

Alem disso, no formulario de cadastro de anuncios (Ads.tsx), os slots usam nomes inconsistentes: "Mega Destaque Topo" (slot `super_banner`) vs "Mega Destaque" (slot `home_banner`) -- ambos sao 970x250 mas com nomes diferentes. Isso deve ser padronizado usando os nomes oficiais do `adSlots.ts`.

**Correcao**: Atualizar a lista `AD_SLOTS` em `pages/admin/Ads.tsx` para usar os mesmos IDs e labels definidos em `src/lib/adSlots.ts` (fonte unica de verdade).

---

## Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/hooks/useAdUnit.ts` | Adicionar mapeamento de aliases para slot_type: `leaderboard` busca `['leaderboard', 'home_top']`, `retangulo_medio` busca `['retangulo_medio', 'rectangle']`, `arranha_ceu` busca `['arranha_ceu', 'skyscraper']`, `super_banner` busca `['super_banner', 'home_banner']` |
| `src/pages/admin/Ads.tsx` | Atualizar a lista `AD_SLOTS` para usar os IDs oficiais de `adSlots.ts` (`leaderboard`, `super_banner`, `retangulo_medio`, `arranha_ceu`, `popup`) com labels padronizados |
| `src/lib/adFormats.ts` | Atualizar `slotTypeToFormatKey` para mapear os novos IDs corretamente |
| `src/components/ads/ResponsiveAdUnit.tsx` | Garantir que o `adType` passado ao `AdLabel` use o label comercial do formato (ex: "Mega Destaque") |

---

## Detalhes tecnicos

### Mapeamento de aliases no useAdUnit.ts

```text
const SLOT_ALIASES: Record<string, string[]> = {
  leaderboard: ['leaderboard', 'home_top'],
  super_banner: ['super_banner', 'home_banner'],
  retangulo_medio: ['retangulo_medio', 'rectangle', 'sidebar', 'content'],
  arranha_ceu: ['arranha_ceu', 'skyscraper'],
  popup: ['popup'],
};

// Na query:
const aliases = SLOT_ALIASES[slotId] || [slotId];
supabase.from('ads')
  .select(...)
  .in('slot_type', aliases)
  .eq('is_active', true)
  ...
```

### Padronizacao dos AD_SLOTS em Ads.tsx

Substituir a lista local por importacao direta dos slots oficiais:

```text
import { AD_SLOTS } from '@/lib/adSlots';

// Filtrar apenas os do canal 'ads'
const adsSlots = AD_SLOTS
  .filter(s => s.channel === 'ads')
  .map(s => ({ value: s.id, label: s.label, size: s.key }));
```

Isso garante que os nomes exibidos na admin, os IDs salvos no banco e os IDs usados na renderizacao estejam todos alinhados.

