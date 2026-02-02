
# Novo Modulo: Correcao de Conteudo

## Objetivo

Criar um modulo dedicado no menu **Conteudo** para centralizar todas as ferramentas de correcao e validacao de noticias:
- Correcao de imagens
- Correcao de datas
- Validacao de URLs
- Verificacao de integridade

---

## Arquitetura Proposta

```text
src/
├── modules/
│   └── content-fix/                    # Novo modulo
│       ├── pages/
│       │   ├── index.tsx               # Export barrel
│       │   ├── ContentFixDashboard.tsx # Dashboard central
│       │   ├── ImageFixer.tsx          # Ferramenta de imagens
│       │   ├── DateFixer.tsx           # Ferramenta de datas
│       │   └── ContentValidator.tsx    # Verificador de integridade
│       ├── components/
│       │   ├── NewsSelector.tsx        # Seletor de noticias com filtros
│       │   ├── ImageFixPanel.tsx       # Painel de correcao de imagem
│       │   ├── DateFixPanel.tsx        # Painel de correcao de data
│       │   └── FixProgressCard.tsx     # Card de progresso
│       ├── hooks/
│       │   ├── useNewsWithIssues.ts    # Query de noticias com problemas
│       │   └── useContentFixStats.ts   # Estatisticas de correcao
│       └── types.ts                    # Tipos do modulo
```

---

## Posicionamento no Menu

O novo modulo sera inserido no menu **Conteudo** apos "Auto Post Regional":

| Item Atual | Posicao |
|------------|---------|
| Dashboard | 1 |
| Noticias | 2 |
| Nova Noticia | 3 |
| Noticias IA | 4 |
| Notas Rapidas | 5 |
| Web Stories | 6 |
| Podcasts | 7 |
| Edicao Digital | 8 |
| Auto Post Regional | 9 |
| **Correcao de Conteudo** | **10** (NOVO) |

---

## Paginas do Modulo

### 1. Dashboard Central (`ContentFixDashboard.tsx`)

Layout estilo "Centro de Comando" com:

**KPIs no topo:**
- Noticias sem imagem valida
- Noticias com data errada (future dates)
- Noticias sem `original_published_at`
- URLs de fonte invalidas

**Cards de Acesso Rapido:**
- Corrigir Imagens → `/admin/content-fix/images`
- Corrigir Datas → `/admin/content-fix/dates`
- Verificar Integridade → `/admin/content-fix/validator`

**Lista de Alertas:**
- Top 10 noticias mais urgentes para correcao

---

### 2. Correcao de Imagens (`ImageFixer.tsx`)

Interface dedicada com:

**Filtros:**
- Apenas sem imagem
- Apenas com imagem invalida
- Por categoria
- Por data de publicacao

**Tabela de Noticias:**
- Checkbox para selecao multipla
- Thumbnail atual (ou placeholder)
- Titulo
- Status da imagem (valida/invalida/ausente)
- Data de publicacao

**Acoes em Lote:**
- Botao "Corrigir Selecionadas"
- Abre `ImageCorrectionDialog` existente

---

### 3. Correcao de Datas (`DateFixer.tsx`)

Interface similar com:

**Filtros:**
- Datas futuras (erros de importacao)
- Sem `original_published_at`
- Por range de datas
- Por categoria

**Tabela de Noticias:**
- Checkbox para selecao multipla
- Titulo
- Data atual
- `original_published_at`
- Fonte

**Acoes em Lote:**
- Botao "Corrigir Selecionadas"
- Abre `DateCorrectionDialog` existente

---

### 4. Verificador de Integridade (`ContentValidator.tsx`)

Ferramenta de diagnostico:

**Verificacoes:**
- URLs de imagens retornando 404
- URLs de fonte inacessiveis
- Conteudo duplicado (por titulo similar)
- Noticias sem categoria
- Noticias sem tags

**Resultado:**
- Lista com status de cada verificacao
- Botao para corrigir problemas encontrados

---

## Alteracoes em Arquivos Existentes

### AdminSidebar.tsx

Adicionar item no array `contentItems`:

```typescript
const contentItems: MenuItem[] = [
  // ... itens existentes ...
  { title: "Auto Post Regional", url: "/admin/autopost-regional", icon: MapPin, badge: "Grande Cotia", badgeColor: "bg-amber-500" },
  { title: "Correcao de Conteudo", url: "/admin/content-fix", icon: Wrench, badge: "Novo", badgeColor: "bg-primary" },  // NOVO
];
```

### App.tsx

Adicionar rotas:

```typescript
// Content Fix Module
<Route path="content-fix" element={<ContentFixDashboard />} />
<Route path="content-fix/images" element={<ImageFixer />} />
<Route path="content-fix/dates" element={<DateFixer />} />
<Route path="content-fix/validator" element={<ContentValidator />} />
```

---

## Componentes Reutilizados

| Componente | Origem | Uso |
|------------|--------|-----|
| `DateCorrectionDialog` | Existente | Chamado pelo DateFixer |
| `ImageCorrectionDialog` | Existente | Chamado pelo ImageFixer |
| `fix-publication-dates` | Edge Function | Backend de datas |
| `fix-news-images` | Edge Function | Backend de imagens |

---

## Queries para Deteccao de Problemas

### Noticias sem imagem valida

```sql
SELECT * FROM news 
WHERE status = 'published' 
AND (featured_image_url IS NULL 
     OR featured_image_url = '' 
     OR featured_image_url LIKE '%_0001%')
ORDER BY published_at DESC;
```

### Noticias com data futura

```sql
SELECT * FROM news 
WHERE status = 'published' 
AND published_at > NOW()
ORDER BY published_at DESC;
```

### Noticias sem original_published_at

```sql
SELECT * FROM news 
WHERE status = 'published' 
AND original_published_at IS NULL
AND source IS NOT NULL
ORDER BY published_at DESC;
```

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/modules/content-fix/pages/index.tsx` | Barrel export |
| `src/modules/content-fix/pages/ContentFixDashboard.tsx` | Dashboard central |
| `src/modules/content-fix/pages/ImageFixer.tsx` | Pagina de correcao de imagens |
| `src/modules/content-fix/pages/DateFixer.tsx` | Pagina de correcao de datas |
| `src/modules/content-fix/pages/ContentValidator.tsx` | Verificador de integridade |
| `src/modules/content-fix/components/NewsIssueCard.tsx` | Card de problema detectado |
| `src/modules/content-fix/components/FixStatsGrid.tsx` | Grid de KPIs |
| `src/modules/content-fix/hooks/useNewsWithIssues.ts` | Hook para buscar noticias com problemas |

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/admin/AdminSidebar.tsx` | Adicionar item no menu Conteudo |
| `src/App.tsx` | Adicionar rotas do modulo |

---

## Fluxo de Uso

```text
Usuario acessa:
  /admin/content-fix
       │
       ▼
  ┌─────────────────────────────────────────┐
  │         Dashboard de Correcao           │
  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
  │  │ 29  │  │ 12  │  │ 60  │  │  5  │    │
  │  │ Img │  │Data │  │Orig │  │ URL │    │
  │  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘    │
  └─────│───────│───────│───────│──────────┘
        │       │       │       │
        ▼       ▼       ▼       ▼
  /images   /dates   /dates   /validator
        │       │               │
        ▼       ▼               ▼
  ImageCorrectionDialog    ContentValidator
  DateCorrectionDialog
```

---

## Resultado Esperado

Apos implementacao:

| Antes | Depois |
|-------|--------|
| Ferramentas espalhadas na lista de noticias | Hub centralizado |
| Sem visibilidade de problemas | Dashboard com KPIs |
| Correcao item a item | Correcao em lote com filtros |
| Sem verificacao de integridade | Diagnostico automatico |

