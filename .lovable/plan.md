

# Expansao do Formulario "Gerador" no Noticias AI

## Resumo
Adicionar 4 campos opcionais (Titulo, Subtitulo, Fonte, Descricao) ao formulario do Gerador automatico de noticias, atualizando tanto o frontend quanto a edge function para processar esses dados.

## Mudancas

### 1. Frontend: `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

**Interface `GeneratorNewsItem`** (linha 414-418): Adicionar os novos campos opcionais:
```typescript
interface GeneratorNewsItem {
  linkMateria: string;
  linkImagem: string;
  dataPublicacao: string;
  title: string;       // novo
  subtitle: string;    // novo
  source: string;      // novo
  description: string; // novo
}
```

**Estado inicial** (linha 480-482): Incluir valores vazios para os novos campos.

**Helpers** (`addGeneratorItem`, linha 650-652): Atualizar o objeto inicial com os novos campos vazios.

**Reset** (linha 852): Incluir os novos campos no reset.

**UI do card de noticia** (linhas 1369-1401): Reorganizar o layout do card:
- Linha 1: Link da Materia (largura total)
- Linha 2: Link da Imagem (70%) + Data (30%) -- sem alteracao
- Linha 3: Titulo (opcional) -- campo novo, largura total
- Linha 4: Subtitulo (opcional) -- campo novo, largura total
- Linha 5: Fonte (opcional) -- campo novo, largura total
- Linha 6: Descricao (opcional) -- textarea novo, largura total

Todos os novos campos terao placeholders indicando opcionalidade (ex: "Titulo (opcional)").

### 2. Backend: `supabase/functions/noticias-ai-batch-generator/index.ts`

**Interface `NewsInput`** (linhas 8-12): Adicionar os campos opcionais:
```typescript
interface NewsInput {
  linkMateria: string;
  linkImagem: string;
  dataPublicacao: string;
  title?: string;
  subtitle?: string;
  source?: string;
  description?: string;
}
```

**Funcao `rewriteWithAI`** (linha 213): Aceitar os novos campos e injeta-los no prompt do usuario para que a IA os considere na reescrita:
- Se `title` fornecido, usar como titulo sugerido
- Se `subtitle` fornecido, incluir no prompt
- Se `source` fornecido, usar como fonte ao inves da URL
- Se `description` fornecido, incluir como contexto adicional para a IA

**Loop de processamento** (linha 443-473): Passar os novos campos do item para `rewriteWithAI`.

### 3. Logica de priorizacao no backend

Quando campos opcionais sao fornecidos:
- `title`: A IA usa como base, podendo refinar mas mantendo a essencia
- `subtitle`: Injeta no prompt como subtitulo sugerido
- `source`: Substitui a URL como valor do campo `fonte` no JSON final
- `description`: Se fornecido E nao houver conteudo extraido via scraping, usa como corpo principal para reescrita

## Arquivos modificados
1. `src/components/admin/noticias-ai/NoticiasAIInput.tsx` -- Interface, estado, UI do formulario
2. `supabase/functions/noticias-ai-batch-generator/index.ts` -- Interface, prompt, processamento

## Restricoes respeitadas
- Barra lateral e cabecalho intactos
- Botao "Gerar N Noticia(s) em JSON" mantido no rodape
- Botao "Adicionar" preservado
- Design segue o padrao visual existente (inputs arredondados, cores sobrias, border-l-amber-400)

