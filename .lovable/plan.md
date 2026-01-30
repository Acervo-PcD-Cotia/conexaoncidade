

# Plano: Atualização Completa do Módulo Notícias AI

## Visão Geral

Este plano implementa as regras definitivas para o módulo **Notícias AI** conforme especificado, incluindo:
- Whitelist fixa de 26 categorias
- Fallback automático para "Geral" quando categoria não existir
- Conversão de categorias inválidas em tags
- Atualização do template JSON oficial
- Validação aprimorada em tempo real

---

## 1. Cadastro das Categorias no Banco de Dados

### Situação Atual
O banco possui apenas 8 categorias:
- Cultura, Educação, Esportes, Geral, Internacional, Meio Ambiente, Saúde, Tecnologia

### Ação Necessária
Adicionar as 18 categorias faltantes da whitelist:

| Categorias a Adicionar |
|------------------------|
| Brasil |
| Cidades |
| Política |
| Economia |
| Justiça |
| Segurança Pública |
| Ciência |
| Infraestrutura |
| Entretenimento |
| Comportamento |
| Lifestyle |
| Emprego & Renda |
| Mobilidade Urbana |
| Inclusão & PCD |
| Projetos Sociais |
| Inovação Pública |
| Conexão Academy |
| Web Rádio |
| Web TV |

**Método**: Migration SQL para inserir as novas categorias

---

## 2. Whitelist de Categorias no Frontend

### Arquivo: `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Criar constante com a lista oficial de categorias permitidas:

```typescript
const ALLOWED_CATEGORIES = [
  'Brasil', 'Cidades', 'Política', 'Economia', 'Justiça', 
  'Segurança Pública', 'Saúde', 'Educação', 'Ciência', 
  'Tecnologia', 'Meio Ambiente', 'Infraestrutura', 'Esportes',
  'Entretenimento', 'Cultura', 'Comportamento', 'Lifestyle',
  'Emprego & Renda', 'Mobilidade Urbana', 'Inclusão & PCD',
  'Projetos Sociais', 'Inovação Pública', 'Conexão Academy',
  'Web Rádio', 'Web TV', 'Geral'
];
```

### Atualizar Validação JSON

Na função `validateNewsJson`, adicionar verificação de categoria:

```typescript
// Validar categoria contra whitelist
if (article.categoria) {
  const normalizedCat = article.categoria.trim();
  if (!ALLOWED_CATEGORIES.some(c => c.toLowerCase() === normalizedCat.toLowerCase())) {
    errors.push({
      field: 'categoria',
      message: `Artigo ${index + 1}: Categoria "${article.categoria}" será convertida em tag (fallback: Geral)`,
      type: 'warning',
      articleIndex: index
    });
  }
}
```

---

## 3. Fallback para "Geral" + Conversão de Categoria Inválida em Tag

### Arquivo: `src/pages/admin/NoticiasAI.tsx`

Atualizar a função `importArticle` para:
1. Verificar se categoria está na whitelist
2. Se não estiver, usar "Geral" como fallback
3. Converter categoria inválida em tag adicional

```typescript
const importArticle = async (article: ManualData): Promise<boolean> => {
  // Whitelist de categorias
  const ALLOWED_CATEGORIES = [
    'Brasil', 'Cidades', 'Política', 'Economia', 'Justiça', 
    'Segurança Pública', 'Saúde', 'Educação', 'Ciência', 
    'Tecnologia', 'Meio Ambiente', 'Infraestrutura', 'Esportes',
    'Entretenimento', 'Cultura', 'Comportamento', 'Lifestyle',
    'Emprego & Renda', 'Mobilidade Urbana', 'Inclusão & PCD',
    'Projetos Sociais', 'Inovação Pública', 'Conexão Academy',
    'Web Rádio', 'Web TV', 'Geral'
  ];
  
  // Verificar se categoria é válida
  const originalCategory = article.categoria?.trim() || '';
  const isValidCategory = ALLOWED_CATEGORIES.some(
    c => c.toLowerCase() === originalCategory.toLowerCase()
  );
  
  // Categoria a usar (com fallback para Geral)
  const categoryToUse = isValidCategory ? originalCategory : 'Geral';
  
  // Se categoria inválida, converter em tag
  let extraTag: string | null = null;
  if (!isValidCategory && originalCategory) {
    extraTag = originalCategory;
  }
  
  // Buscar ID da categoria
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', categoryToUse)
    .single();
  
  // Se mesmo "Geral" não existir, criar
  if (!category) {
    console.error('Categoria Geral não encontrada no banco!');
    // Fallback: buscar qualquer categoria ativa
    const { data: fallbackCat } = await supabase
      .from('categories')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();
    // usar fallbackCat?.id
  }
  
  // Adicionar tag extra se categoria foi convertida
  let tags = article.tags || [];
  if (extraTag && !tags.includes(extraTag)) {
    tags = [extraTag, ...tags];
  }
  
  // ... resto da função
};
```

---

## 4. Atualização da Edge Function

### Arquivo: `supabase/functions/noticias-ai-generate/index.ts`

Atualizar o `systemPrompt` para usar a whitelist correta:

**Linha 648** (atual):
```typescript
- Categorias: Política, Economia, Esportes, Cultura, Tecnologia, Saúde, Educação, Cidade, Brasil, Mundo
```

**Nova versão**:
```typescript
- Categorias PERMITIDAS (usar apenas estas): Brasil, Cidades, Política, Economia, Justiça, Segurança Pública, Saúde, Educação, Ciência, Tecnologia, Meio Ambiente, Infraestrutura, Esportes, Entretenimento, Cultura, Comportamento, Lifestyle, Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, Inovação Pública, Conexão Academy, Web Rádio, Web TV, Geral
- Se o tema não se encaixar em nenhuma categoria, use "Geral"
- Temas específicos que não são categorias devem ir nas TAGS (ex: Futebol vai em tags, não em categoria)
```

---

## 5. Atualização do Template JSON Oficial

### Arquivo: `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

Substituir `JSON_TEMPLATE` pelo formato oficial solicitado:

```typescript
const JSON_TEMPLATE = {
  noticias: [
    {
      categoria: "Cidades",
      titulo: "Prefeitura anuncia novo programa de educação infantil para 2025",
      slug: "prefeitura-novo-programa-educacao-infantil-2025",
      resumo: "A Prefeitura Municipal apresentou hoje um novo programa que vai beneficiar mais de 5 mil crianças.",
      conteudo: `<p><strong>A Prefeitura Municipal apresentou hoje um novo programa de educação infantil que promete revolucionar o ensino.</strong></p>
<h2>Investimentos Previstos</h2>
<p>O projeto, batizado de 'Futuro Brilhante', prevê investimentos de R$ 10 milhões e beneficiará mais de 5 mil crianças matriculadas em escolas municipais.</p>
<p>Entre as principais ações estão:</p>
<ul>
  <li>Construção de novas salas de aula</li>
  <li>Capacitação de professores</li>
  <li>Distribuição de material didático gratuito</li>
</ul>
<h2>Declarações das Autoridades</h2>
<blockquote><p>"Este é o maior investimento em educação da história do município"</p></blockquote>
<p>O secretário de educação <strong>afirmou em entrevista coletiva.</strong></p>`,
      fonte: "https://prefeitura.gov.br/noticias/educacao-infantil",
      imagem: {
        hero: "https://exemplo.com/imagens/educacao-programa.jpg",
        og: "https://exemplo.com/imagens/educacao-programa-og.jpg",
        card: "https://exemplo.com/imagens/educacao-programa-card.jpg",
        alt: "Crianças em sala de aula participando do novo programa educacional",
        credito: "Foto: Assessoria de Imprensa / Prefeitura Municipal",
        galeria: [
          "https://exemplo.com/imagens/galeria/educacao-1.jpg",
          "https://exemplo.com/imagens/galeria/educacao-2.jpg"
        ]
      },
      tags: ["Cotia", "educação", "prefeitura", "escolas", "crianças", "investimento", "programa social", "ensino infantil", "2025", "municipal", "professores", "didático"],
      seo: {
        meta_titulo: "Novo programa de educação beneficiará 5 mil crianças",
        meta_descricao: "Prefeitura anuncia investimento de R$ 10 milhões em programa educacional para escolas municipais."
      }
    },
    {
      categoria: "Cultura",
      titulo: "Festival Gastronômico reúne 30 restaurantes no centro da cidade",
      slug: "festival-gastronomico-30-restaurantes-centro",
      resumo: "O tradicional Festival Gastronômico retorna este ano com 30 restaurantes participantes e entrada gratuita.",
      conteudo: `<p><strong>O tradicional Festival Gastronômico retorna este ano maior e melhor, com 30 restaurantes participantes.</strong></p>
<p>O evento promete movimentar o centro da cidade de 15 a 18 de março.</p>
<h2>Preços e Horários</h2>
<p>A entrada é gratuita e os pratos terão preços promocionais entre R$ 15 e R$ 45.</p>
<ul>
  <li>Sexta: 18h às 23h</li>
  <li>Sábado: 12h às 23h</li>
  <li>Domingo: 12h às 20h</li>
</ul>`,
      fonte: "https://cultura.gov.br/festival-gastronomico",
      imagem: {
        hero: "https://exemplo.com/imagens/festival-food.jpg",
        alt: "Pratos típicos sendo servidos durante o festival",
        credito: "Foto: João Fotógrafo",
        galeria: [
          "https://exemplo.com/imagens/galeria/festival-1.jpg",
          "https://exemplo.com/imagens/galeria/festival-2.jpg"
        ]
      },
      tags: ["festival", "gastronomia", "restaurantes", "centro", "março", "eventos", "culinária", "comida", "chef", "gratuito", "promoção", "cidade"],
      seo: {
        meta_titulo: "Festival Gastronômico 2025: 30 restaurantes, entrada grátis",
        meta_descricao: "Festival reúne 30 restaurantes no centro com pratos de R$ 15 a R$ 45. De 15 a 18 de março."
      }
    }
  ]
};
```

---

## 6. Resumo de Arquivos a Modificar

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | **Migration SQL** | Inserir 18 novas categorias no banco |
| 2 | `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Adicionar whitelist, atualizar validação e template JSON |
| 3 | `src/pages/admin/NoticiasAI.tsx` | Adicionar lógica de fallback para "Geral" e conversão de categoria inválida em tag |
| 4 | `supabase/functions/noticias-ai-generate/index.ts` | Atualizar systemPrompt com whitelist oficial |

---

## 7. Fluxo de Processamento Atualizado

```text
┌────────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│  Entrada JSON      │────>│  Validação Frontend │────>│ Edge Function AI  │
│  categoria: "XYZ"  │     │  - Whitelist check  │     │ - Whitelist prompt│
└────────────────────┘     │  - Warning se inv.  │     └───────────────────┘
                           └─────────────────────┘              │
                                                                 ▼
┌────────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│  Notícia Salva     │<────│  Importação         │<────│ JSON Processado   │
│  category: "Geral" │     │  - Fallback Geral   │     │ categoria: "XYZ"  │
│  tags: ["XYZ",...] │     │  - Cat→Tag convert  │     └───────────────────┘
└────────────────────┘     └─────────────────────┘
```

---

## Seção Técnica Detalhada

### Migration SQL para Categorias

```sql
-- Inserir categorias faltantes (ignorar se já existir)
INSERT INTO public.categories (name, slug, color, is_active, sort_order)
VALUES 
  ('Brasil', 'brasil', '#22c55e', true, 1),
  ('Cidades', 'cidades', '#3b82f6', true, 2),
  ('Política', 'politica', '#ef4444', true, 3),
  ('Economia', 'economia', '#f59e0b', true, 4),
  ('Justiça', 'justica', '#6366f1', true, 5),
  ('Segurança Pública', 'seguranca-publica', '#dc2626', true, 6),
  ('Ciência', 'ciencia', '#14b8a6', true, 7),
  ('Infraestrutura', 'infraestrutura', '#64748b', true, 8),
  ('Entretenimento', 'entretenimento', '#ec4899', true, 9),
  ('Comportamento', 'comportamento', '#8b5cf6', true, 10),
  ('Lifestyle', 'lifestyle', '#f97316', true, 11),
  ('Emprego & Renda', 'emprego-renda', '#10b981', true, 12),
  ('Mobilidade Urbana', 'mobilidade-urbana', '#0ea5e9', true, 13),
  ('Inclusão & PCD', 'inclusao-pcd', '#a855f7', true, 14),
  ('Projetos Sociais', 'projetos-sociais', '#84cc16', true, 15),
  ('Inovação Pública', 'inovacao-publica', '#06b6d4', true, 16),
  ('Conexão Academy', 'conexao-academy', '#7c3aed', true, 17),
  ('Web Rádio', 'web-radio', '#f43f5e', true, 18),
  ('Web TV', 'web-tv', '#e11d48', true, 19)
ON CONFLICT (slug) DO NOTHING;
```

### Constante de Whitelist (compartilhada)

Para evitar duplicação, criar um arquivo de constantes:

**Novo arquivo**: `src/constants/categories.ts`

```typescript
export const ALLOWED_CATEGORIES = [
  'Brasil',
  'Cidades', 
  'Política',
  'Economia',
  'Justiça',
  'Segurança Pública',
  'Saúde',
  'Educação',
  'Ciência',
  'Tecnologia',
  'Meio Ambiente',
  'Infraestrutura',
  'Esportes',
  'Entretenimento',
  'Cultura',
  'Comportamento',
  'Lifestyle',
  'Emprego & Renda',
  'Mobilidade Urbana',
  'Inclusão & PCD',
  'Projetos Sociais',
  'Inovação Pública',
  'Conexão Academy',
  'Web Rádio',
  'Web TV',
  'Geral'
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

export const DEFAULT_CATEGORY = 'Geral';

export const isValidCategory = (category: string): boolean => {
  return ALLOWED_CATEGORIES.some(
    c => c.toLowerCase() === category.toLowerCase().trim()
  );
};
```

---

## Benefícios da Implementação

1. **Consistência**: Todas as notícias terão categorias válidas do sistema
2. **Sem Erros**: Fallback automático evita erros de categoria não encontrada
3. **SEO Preservado**: Temas específicos são mantidos como tags (não perdidos)
4. **Compatibilidade Google News**: Estrutura padronizada e previsível
5. **Processamento em Lote Confiável**: Sem falhas por categoria inválida

