

## Bug: Formato errado no upload do 728x90

O problema esta no mapeamento `SLOT_TO_FORMAT` dentro de `AdImageUploader.tsx`. Quando o usuario seleciona "Destaque Horizontal (728x90)" (slot `home_top`), o mapeamento envia o formato `'home-topo'` para o uploader, que corresponde a "Mega Destaque (970x250px)". Por isso o label do formato aparece errado e a validacao/dimensoes ficam inconsistentes.

### Causa raiz

Linha 325 de `AdImageUploader.tsx`:
```text
home_top: 'home-topo',   // ERRADO - home_top e 728x90, nao 970x250
```

O slot `home_top` deveria mapear para `'leaderboard'` (728x90), nao para `'home-topo'` (970x250).

### Correcao

No arquivo `src/components/admin/AdImageUploader.tsx`, alterar o mapeamento:

| Slot (valor) | Formato atual (ERRADO) | Formato correto |
|---|---|---|
| `home_top` | `'home-topo'` (970x250) | `'leaderboard'` (728x90) |

Apenas 1 linha precisa mudar. Todos os outros mapeamentos estao corretos.

### Arquivo a alterar

- `src/components/admin/AdImageUploader.tsx` -- linha 325: trocar `'home-topo'` por `'leaderboard'`

