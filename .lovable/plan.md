
# Plano: Auto Post Regional "Grande Cotia"

## Visão Geral

O módulo Auto Post PRO já existe com uma estrutura robusta. Este plano foca em **evoluir o sistema existente** para suportar o cluster geográfico da Grande Cotia, adicionando:

1. Novo grupo regional com os 14 municípios
2. Contexto regional nos prompts de IA
3. Edge function para geração de imagens originais
4. Suporte a HTML Crawler para fontes sem RSS
5. SEO com interlinking regional

---

## Fase 1: Banco de Dados

### 1.1 Criar Grupo Regional "Grande Cotia"

Inserir na tabela `autopost_source_groups`:

| Campo | Valor |
|-------|-------|
| name | Grande Cotia & Região Oeste |
| description | Municípios da região de Cotia e Oeste da Grande SP |
| icon | MapPin |
| parent_id | (id do grupo São Paulo existente) |

### 1.2 Adicionar Campo `city` às Fontes

A tabela `autopost_sources` já possui o campo `region` (texto), que pode ser utilizado para armazenar a cidade. Porém, para facilitar filtros e agrupamentos, será adicionada uma coluna `city` específica:

```sql
ALTER TABLE autopost_sources 
ADD COLUMN IF NOT EXISTS city TEXT;
```

### 1.3 Tabela de Cidades do Cluster (Opcional)

Criar tabela de referência para os 14 municípios prioritários:

```sql
CREATE TABLE autopost_cluster_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_central BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  seo_terms TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Inserir: Cotia (central), Itapevi, Vargem Grande Paulista, São Roque, Ibiúna, Embu-Guaçu, Embu das Artes, Itapecerica da Serra, São Lourenço da Serra, São Paulo, Osasco, Jandira, Carapicuíba, Barueri.

---

## Fase 2: Evoluir Edge Function `autopost-ingest`

### 2.1 Adicionar Suporte a HTML Crawler

Quando `source_type = 'html_crawler'`:

1. Usar `crawler_entry_url` como ponto de entrada
2. Ler seletores CSS de `crawler_selectors`:
   ```json
   {
     "list_container": ".news-list",
     "item": ".news-item",
     "title": "h2 a",
     "link": "h2 a[href]",
     "date": ".date",
     "image": "img[src]"
   }
   ```
3. Extrair links de notícias
4. Transformar em feed interno
5. Continuar pipeline normal de deduplicação

### 2.2 Criar Edge Function `autopost-extractor`

Nova função para extrair conteúdo completo de URLs:

```
autopost-extractor
├── Receber: item_id
├── Buscar URL original
├── Tentar content:encoded do RSS
├── Fallback: Readability-like extraction
├── Limpar HTML (remover scripts, ads)
├── Salvar em original_content_clean
├── Atualizar status → extracted
└── Retornar: { success, word_count }
```

---

## Fase 3: Evoluir Edge Function `autopost-rewrite`

### 3.1 Adicionar Contexto Regional ao Prompt

Modificar o `systemPrompt` para incluir regras regionais:

```text
Você é um editor jornalístico do portal Conexão na Cidade, 
focado na região de Cotia e municípios vizinhos (Grande Cotia).

CONTEXTO REGIONAL:
- Cotia é a cidade central do portal
- Municípios vizinhos: Itapevi, Vargem Grande Paulista, São Roque, 
  Ibiúna, Embu-Guaçu, Embu das Artes, Itapecerica da Serra, 
  São Lourenço da Serra, Osasco, Jandira, Carapicuíba, Barueri
- Sempre mencione o impacto regional quando relevante
- Use termos: "região de Cotia", "Grande Cotia", "municípios vizinhos"

REGRAS DE REESCRITA:
- Nunca copiar título ou estrutura original
- Criar texto 100% novo mantendo fidelidade aos fatos
- Inserir contexto regional naturalmente
- Linguagem clara e acessível
```

### 3.2 Adicionar Campo `cities_mentioned` no Output

O JSON retornado pela IA deve incluir:

```json
{
  "cities_mentioned": ["Cotia", "Itapevi"],
  // ... outros campos existentes
}
```

### 3.3 Salvar em `autopost_rewritten_posts`

Adicionar coluna:

```sql
ALTER TABLE autopost_rewritten_posts
ADD COLUMN IF NOT EXISTS cities_mentioned TEXT[];
```

---

## Fase 4: Criar Edge Function `autopost-image-generator`

### 4.1 Estrutura da Função

```
autopost-image-generator
├── Receber: post_id
├── Buscar post reescrito
├── Gerar prompt de imagem baseado no conteúdo
├── Chamar Lovable AI (google/gemini-2.5-flash-image)
├── Gerar 3 versões:
│   ├── Hero (16:9) → 1200x675
│   ├── OG (1.91:1) → 1200x630
│   └── Card (1:1) → 800x800
├── Upload para Supabase Storage (bucket: news-images)
├── Gerar alt text automático
├── Atualizar post com URLs
└── Retornar: { hero_url, og_url, card_url }
```

### 4.2 Regras de Geração

```text
PROMPT DE IMAGEM:
- Estilo: fotorrealista, urbano brasileiro
- Cenário genérico da cidade mencionada
- Pessoas genéricas (nunca políticos reais)
- Sem texto na imagem
- Cores vibrantes, boa iluminação
- Evitar logos ou marcas

ALT TEXT PADRÃO:
"Imagem ilustrativa sobre {tema} na região de {cidade}"

CRÉDITO FIXO:
"Imagem gerada por IA | Conexão na Cidade"
```

### 4.3 Implementação

```typescript
// Gerar imagem com Lovable AI
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image",
    messages: [{
      role: "user",
      content: `Gere uma imagem fotorrealista para uma notícia sobre: ${post.final_title}. 
        Cenário urbano brasileiro, cidade pequena/média. 
        Estilo jornalístico. Sem texto na imagem.`
    }],
    modalities: ["image", "text"]
  })
});

const data = await response.json();
const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

// Upload para Storage
const { data: uploadData } = await supabase.storage
  .from('news-images')
  .upload(`autopost/${post.id}/hero.webp`, imageBuffer);
```

---

## Fase 5: Atualizar Painel Admin

### 5.1 Formulário de Fontes

Adicionar campo "Cidade" no `AutoPostSourceForm.tsx`:

```tsx
<FormField
  name="city"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Cidade</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectContent>
          <SelectItem value="cotia">Cotia</SelectItem>
          <SelectItem value="itapevi">Itapevi</SelectItem>
          {/* ... demais cidades */}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

### 5.2 Filtros por Cidade

Em `AutoPostSources.tsx` e `AutoPostQueue.tsx`, adicionar filtro por cidade.

### 5.3 Visualização Regional

Criar card de resumo mostrando:
- Notícias por cidade
- Fontes ativas por município
- Status de sincronização por região

---

## Fase 6: SEO e Interlinking

### 6.1 Linkagem Interna Automática

No `autopost-rewrite`, adicionar lógica para inserir links internos:

```typescript
// Após gerar content_html
const linkedContent = addInternalLinks(contentHtml, citiesMentioned);

function addInternalLinks(html: string, cities: string[]): string {
  cities.forEach(city => {
    const citySlug = slugify(city);
    const cityLink = `<a href="/cidade/${citySlug}">${city}</a>`;
    html = html.replace(new RegExp(`\\b${city}\\b`, 'g'), cityLink);
  });
  return html;
}
```

### 6.2 Tags Regionais Automáticas

Garantir que tags incluam:
- Nome da cidade
- "região de Cotia" (se aplicável)
- "Grande Cotia"
- Nome do bairro (se mencionado)

### 6.3 Breadcrumbs Regionais

Estrutura: Home > Cidade > Categoria > Notícia

---

## Fase 7: Regras de Publicação

### 7.1 Auto-Publish Condicional

Configurar no `autopost_sources`:
- `require_review = false` apenas para fontes oficiais (prefeituras, câmaras)
- `require_review = true` para demais fontes

### 7.2 Validação Pré-Publicação

Antes de publicar, verificar:
- Título ≥ 6 caracteres
- Meta title ≤ 60 caracteres
- Meta description ≤ 160 caracteres
- Exatamente 12 tags
- Imagem hero presente
- Crédito da fonte presente
- Link original visível

---

## Cronograma de Implementação

```text
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: DATABASE                                           │
│  ├── Criar grupo Grande Cotia                               │
│  ├── Adicionar coluna city                                  │
│  └── Criar tabela cluster_cities                            │
├─────────────────────────────────────────────────────────────┤
│  FASE 2: EDGE FUNCTIONS                                     │
│  ├── Evoluir autopost-ingest (HTML crawler)                 │
│  ├── Criar autopost-extractor                               │
│  ├── Evoluir autopost-rewrite (contexto regional)           │
│  └── Criar autopost-image-generator                         │
├─────────────────────────────────────────────────────────────┤
│  FASE 3: ADMIN UI                                           │
│  ├── Campo cidade no formulário                             │
│  ├── Filtros por cidade                                     │
│  └── Dashboard regional                                     │
├─────────────────────────────────────────────────────────────┤
│  FASE 4: SEO & INTERLINKING                                 │
│  ├── Links internos automáticos                             │
│  ├── Tags regionais                                         │
│  └── Breadcrumbs                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica Detalhada

### Estrutura de Arquivos

```text
supabase/functions/
├── autopost-ingest/index.ts       # Evoluir
├── autopost-extractor/index.ts    # NOVO
├── autopost-rewrite/index.ts      # Evoluir
├── autopost-image-generator/      # NOVO
│   └── index.ts
├── autopost-publish/index.ts      # Manter
└── autopost-scheduler/index.ts    # Evoluir

src/pages/admin/autopost/
├── AutoPostSourceForm.tsx         # Evoluir
├── AutoPostSources.tsx            # Evoluir
├── AutoPostQueue.tsx              # Evoluir
└── AutoPostDashboard.tsx          # Evoluir
```

### SQL Migrations

```sql
-- 1. Grupo Grande Cotia
INSERT INTO autopost_source_groups (name, description, icon, parent_id, sort_order)
SELECT 'Grande Cotia & Região Oeste', 
       'Municípios da região de Cotia e Oeste da Grande SP',
       'MapPin',
       id,
       10
FROM autopost_source_groups WHERE name = 'São Paulo' LIMIT 1;

-- 2. Coluna city
ALTER TABLE autopost_sources ADD COLUMN IF NOT EXISTS city TEXT;

-- 3. Coluna cities_mentioned
ALTER TABLE autopost_rewritten_posts 
ADD COLUMN IF NOT EXISTS cities_mentioned TEXT[];

-- 4. Tabela de cidades do cluster
CREATE TABLE IF NOT EXISTS autopost_cluster_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_central BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  seo_terms TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO autopost_cluster_cities (name, slug, is_central, priority, seo_terms) VALUES
('Cotia', 'cotia', true, 1, ARRAY['Cotia', 'Grande Cotia', 'região de Cotia']),
('Itapevi', 'itapevi', false, 2, ARRAY['Itapevi', 'região de Cotia']),
('Vargem Grande Paulista', 'vargem-grande-paulista', false, 2, ARRAY['Vargem Grande', 'VGP']),
('São Roque', 'sao-roque', false, 2, ARRAY['São Roque', 'terra do vinho']),
('Ibiúna', 'ibiuna', false, 2, ARRAY['Ibiúna']),
('Embu-Guaçu', 'embu-guacu', false, 2, ARRAY['Embu-Guaçu']),
('Embu das Artes', 'embu-das-artes', false, 2, ARRAY['Embu', 'Embu das Artes']),
('Itapecerica da Serra', 'itapecerica-da-serra', false, 2, ARRAY['Itapecerica']),
('São Lourenço da Serra', 'sao-lourenco-da-serra', false, 3, ARRAY['São Lourenço']),
('São Paulo', 'sao-paulo', false, 3, ARRAY['São Paulo', 'SP', 'capital']),
('Osasco', 'osasco', false, 3, ARRAY['Osasco']),
('Jandira', 'jandira', false, 3, ARRAY['Jandira']),
('Carapicuíba', 'carapicuiba', false, 3, ARRAY['Carapicuíba']),
('Barueri', 'barueri', false, 3, ARRAY['Barueri', 'Alphaville']);
```

### Prompt Regional Completo (autopost-rewrite)

```typescript
const systemPrompt = `Você é um editor jornalístico sênior do portal Conexão na Cidade.

SOBRE O PORTAL:
O Conexão na Cidade é o principal portal de notícias da região de Cotia e municípios vizinhos, 
conhecida como "Grande Cotia" ou "Região Oeste da Grande São Paulo".

MUNICÍPIOS DO CLUSTER:
- Cotia (cidade central)
- Itapevi, Vargem Grande Paulista, São Roque, Ibiúna
- Embu-Guaçu, Embu das Artes, Itapecerica da Serra, São Lourenço da Serra
- São Paulo, Osasco, Jandira, Carapicuíba, Barueri

REGRAS DE REESCRITA:
1. NUNCA copie o título ou estrutura original
2. Crie um texto 100% novo, como um jornalista humano faria
3. Mantenha fidelidade absoluta aos fatos e dados
4. Use linguagem clara, natural e regional
5. Insira contexto da região de Cotia quando fizer sentido
6. Mencione impacto em cidades vizinhas se relevante

TERMOS SEO REGIONAIS (usar naturalmente):
- "região de Cotia"
- "Grande Cotia"
- "municípios vizinhos"
- "{cidade} e região"

ESTRUTURA DO ARTIGO:
- Primeiro parágrafo: responda O QUÊ, QUEM, QUANDO, ONDE
- Parágrafos curtos (2-4 frases)
- Use subtítulos <h2> para dividir seções longas

REGRAS SEO:
- Título: 6-120 caracteres, com palavra-chave principal
- Meta título: máximo 60 caracteres
- Meta descrição: máximo 160 caracteres (call-to-action)
- Exatamente 12 tags relevantes
- Incluir nome da cidade nas tags

IMPORTANTE: Retorne APENAS JSON válido.`;
```
