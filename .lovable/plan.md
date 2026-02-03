
# Renomear Menus do Header

## Objetivo
Atualizar os nomes dos menus especiais na barra de servicos do Header conforme solicitado.

## Mapeamento de Alteracoes

| Nome Atual | Novo Nome |
|------------|-----------|
| Apareça no Google | Você no Google |
| Brasileirão | Brasileirão (sem alteracao) |
| Censo PcD | Censo SP |
| Conexões | Conexões (sem alteracao) |
| ENEM 2026 | ENEM |
| Fake News | Fake News (sem alteracao) |
| Transporte Escolar | Escolar |
| Web Rádio / TV | Web Live |

---

## Arquivos a Modificar

### 1. src/types/portal-templates.ts

Atualizar os valores padrao do vocabulario:

```typescript
// Linha 202-205
google_maps_cta: 'Você no Google',  // era 'Apareça no Google'
fake_news: 'Fake News',             // sem alteracao
school_transport: 'Escolar',        // era 'Transporte Escolar'  
pcd_census: 'Censo SP',             // era 'Censo PcD'
```

---

### 2. src/components/layout/Header.tsx

Atualizar os textos hardcoded e fallbacks em **dois locais** (mobile e desktop):

**Mobile (linhas 83-147):**
- Linha 89: fallback `"Apareça no Google"` → `"Você no Google"`
- Linha 97: `Brasileirão` (manter)
- Linha 105: fallback `"Censo PcD"` → `"Censo SP"`
- Linha 121: `ENEM 2026` → `ENEM`
- Linha 137: fallback `"Transporte Escolar"` → `"Escolar"`
- Linha 146: `Web Rádio / TV` → `Web Live`

**Desktop (linhas 308-372):**
- Linha 314: fallback `"Apareça no Google"` → `"Você no Google"`
- Linha 322: `Brasileirão` (manter)
- Linha 330: fallback `"Censo PcD"` → `"Censo SP"`
- Linha 346: `ENEM 2026` → `ENEM`
- Linha 362: fallback `"Transporte Escolar"` → `"Escolar"`
- Linha 371: `Web Rádio / TV` → `Web Live`

---

## Comentarios no Codigo

Tambem atualizar os comentarios para refletir os novos nomes:
- `{/* 1. Apareça no Google */}` → `{/* 1. Você no Google */}`
- `{/* 3. Censo PcD */}` → `{/* 3. Censo SP */}`
- `{/* 5. ENEM 2026 */}` → `{/* 5. ENEM */}`
- `{/* 7. Transporte Escolar */}` → `{/* 7. Escolar */}`
- `{/* 8. Web Rádio / TV */}` → `{/* 8. Web Live */}`

---

## Resultado Esperado

Apos a implementacao, a barra de menus exibira:

```
[Você no Google] [Brasileirão] [Censo SP] [Conexões] [ENEM] [Fake News] [Escolar] [Web Live] [Imóveis]
```

Tanto na versao mobile quanto desktop do Header.
