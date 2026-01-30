
# Plano: Template JSON + Validação Visual em Tempo Real

## Visão Geral

Este plano implementa três funcionalidades para melhorar a experiência de importação JSON no módulo Notícias AI:

1. **Gerador de Template JSON** - Botão para baixar um arquivo `.json` de exemplo
2. **Validação Visual em Tempo Real** - Destaque de campos inválidos enquanto digita
3. **Exemplo com Múltiplas Notícias e Galerias** - Template completo mostrando todas as possibilidades

---

## Funcionalidades a Implementar

### 1. Botão "Baixar Template" 

Adicionar um botão no topo da aba JSON que gera e baixa um arquivo `template-noticias.json` com exemplo completo.

**Comportamento:**
- Clique gera arquivo `.json` para download
- Arquivo contém 2 notícias de exemplo com todos os campos documentados
- Inclui comentários (como valores de string) explicando cada campo

### 2. Validação Visual em Tempo Real

Sistema de validação que analisa o JSON enquanto o usuário digita e exibe:
- Lista de erros encontrados com descrição clara
- Campos obrigatórios faltando destacados em vermelho
- Campos opcionais ausentes em amarelo (aviso)
- Contadores de validação (erros/avisos)

**Regras de Validação:**

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `titulo` | string | Sim | Min 10 caracteres |
| `slug` | string | Sim | Apenas letras minúsculas, números e hífens |
| `resumo` | string | Sim | Min 30, max 300 caracteres |
| `conteudo` | string | Sim | Min 100 caracteres |
| `categoria` | string | Sim | Não vazio |
| `tags` | array | Não | Recomendado 12 itens |
| `imagem.hero` | string | Não | URL válida se presente |
| `destaque` | enum | Não | `none`, `home`, `featured`, `urgent` |

### 3. Template de Exemplo Expandido

Atualizar o placeholder e o template baixável com exemplo completo incluindo:
- 2 notícias com todos os campos
- Galerias de imagens
- Diferentes níveis de destaque
- Todas as opções de SEO

---

## Alterações Técnicas

### Arquivo: `src/components/admin/noticias-ai/NoticiasAIInput.tsx`

#### Adicionar Constante com Template Completo

```typescript
const JSON_TEMPLATE = {
  noticias: [
    {
      titulo: "Prefeitura anuncia novo programa de educação infantil para 2025",
      slug: "prefeitura-novo-programa-educacao-infantil-2025",
      subtitulo: "Iniciativa vai beneficiar mais de 5 mil crianças em escolas municipais",
      chapeu: "EDUCAÇÃO",
      resumo: "A Prefeitura Municipal apresentou hoje um novo programa de educação infantil que promete revolucionar o ensino nas escolas públicas. O projeto prevê investimentos de R$ 10 milhões.",
      conteudo: "<p><strong>A Prefeitura Municipal apresentou hoje um novo programa de educação infantil que promete revolucionar o ensino.</strong></p><p>O projeto, batizado de 'Futuro Brilhante', prevê investimentos de R$ 10 milhões e beneficiará mais de 5 mil crianças matriculadas em escolas municipais.</p><p>Entre as principais ações estão a construção de novas salas de aula, capacitação de professores e distribuição de material didático gratuito.</p>",
      categoria: "Educação",
      tags: ["educação", "prefeitura", "escolas", "crianças", "investimento", "programa social", "ensino infantil", "2025", "municipal", "professores", "sala de aula", "didático"],
      editor: "Redação Conexão na Cidade",
      fonte: "https://prefeitura.gov.br/noticias/educacao-infantil",
      destaque: "home",
      generateWebStory: true,
      imagem: {
        hero: "https://exemplo.com/imagens/educacao-programa.jpg",
        og: "https://exemplo.com/imagens/educacao-programa-og.jpg",
        card: "https://exemplo.com/imagens/educacao-programa-card.jpg",
        alt: "Crianças em sala de aula participando do novo programa educacional",
        credito: "Foto: Assessoria de Imprensa / Prefeitura Municipal",
        galeria: [
          "https://exemplo.com/imagens/galeria/educacao-1.jpg",
          "https://exemplo.com/imagens/galeria/educacao-2.jpg",
          "https://exemplo.com/imagens/galeria/educacao-3.jpg"
        ]
      },
      seo: {
        meta_titulo: "Novo programa de educação infantil beneficiará 5 mil crianças | Portal",
        meta_descricao: "Prefeitura anuncia investimento de R$ 10 milhões em programa educacional para escolas municipais. Saiba mais detalhes."
      }
    },
    {
      titulo: "Festival Gastronômico reúne 30 restaurantes no centro da cidade",
      slug: "festival-gastronomico-30-restaurantes-centro",
      subtitulo: "Evento acontece de 15 a 18 de março com entrada gratuita",
      chapeu: "CULTURA",
      resumo: "O tradicional Festival Gastronômico retorna este ano com 30 restaurantes participantes. O evento promete movimentar o centro da cidade durante quatro dias.",
      conteudo: "<p><strong>O tradicional Festival Gastronômico retorna este ano maior e melhor.</strong></p><p>Com 30 restaurantes participantes, o evento promete movimentar o centro da cidade de 15 a 18 de março.</p><p>A entrada é gratuita e os pratos terão preços promocionais entre R$ 15 e R$ 45.</p>",
      categoria: "Cultura",
      tags: ["festival", "gastronomia", "restaurantes", "centro", "março", "eventos", "culinária", "comida", "chef", "gratuito", "promoção", "cidade"],
      editor: "Maria Silva",
      fonte: "https://cultura.gov.br/festival-gastronomico",
      destaque: "featured",
      generateWebStory: true,
      imagem: {
        hero: "https://exemplo.com/imagens/festival-food.jpg",
        alt: "Pratos típicos sendo servidos durante o festival",
        credito: "Foto: João Fotógrafo",
        galeria: [
          "https://exemplo.com/imagens/galeria/festival-1.jpg",
          "https://exemplo.com/imagens/galeria/festival-2.jpg"
        ]
      },
      seo: {
        meta_titulo: "Festival Gastronômico 2025: 30 restaurantes, entrada grátis",
        meta_descricao: "Festival reúne 30 restaurantes no centro com pratos de R$ 15 a R$ 45. De 15 a 18 de março."
      }
    }
  ]
};
```

#### Adicionar Função de Download

```typescript
const handleDownloadTemplate = () => {
  const blob = new Blob([JSON.stringify(JSON_TEMPLATE, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-noticias.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: 'Template baixado!',
    description: 'Edite o arquivo e cole o conteúdo aqui',
  });
};
```

#### Adicionar Tipos e Função de Validação

```typescript
interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
  articleIndex?: number;
}

const validateNewsJson = (text: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  try {
    const parsed = JSON.parse(text);
    
    // Verifica estrutura raiz
    if (!parsed.noticias && !Array.isArray(parsed)) {
      errors.push({ 
        field: 'root', 
        message: 'JSON deve ter objeto "noticias" ou ser um array', 
        type: 'error' 
      });
      return errors;
    }
    
    const articles = parsed.noticias || parsed;
    
    articles.forEach((article: any, index: number) => {
      // Campos obrigatórios
      if (!article.titulo || article.titulo.length < 10) {
        errors.push({ 
          field: 'titulo', 
          message: `Artigo ${index + 1}: Título obrigatório (min 10 caracteres)`, 
          type: 'error', 
          articleIndex: index 
        });
      }
      
      if (!article.slug || !/^[a-z0-9-]+$/.test(article.slug)) {
        errors.push({ 
          field: 'slug', 
          message: `Artigo ${index + 1}: Slug inválido (use apenas letras minúsculas, números e hífens)`, 
          type: 'error', 
          articleIndex: index 
        });
      }
      
      if (!article.resumo || article.resumo.length < 30) {
        errors.push({ 
          field: 'resumo', 
          message: `Artigo ${index + 1}: Resumo obrigatório (min 30 caracteres)`, 
          type: 'error', 
          articleIndex: index 
        });
      }
      
      if (!article.conteudo || article.conteudo.length < 100) {
        errors.push({ 
          field: 'conteudo', 
          message: `Artigo ${index + 1}: Conteúdo obrigatório (min 100 caracteres)`, 
          type: 'error', 
          articleIndex: index 
        });
      }
      
      if (!article.categoria) {
        errors.push({ 
          field: 'categoria', 
          message: `Artigo ${index + 1}: Categoria obrigatória`, 
          type: 'error', 
          articleIndex: index 
        });
      }
      
      // Avisos (campos recomendados)
      if (!article.tags || article.tags.length < 12) {
        errors.push({ 
          field: 'tags', 
          message: `Artigo ${index + 1}: Recomendado 12 tags (atual: ${article.tags?.length || 0})`, 
          type: 'warning', 
          articleIndex: index 
        });
      }
      
      if (!article.imagem?.hero) {
        errors.push({ 
          field: 'imagem', 
          message: `Artigo ${index + 1}: Imagem hero recomendada`, 
          type: 'warning', 
          articleIndex: index 
        });
      }
      
      if (article.destaque && !['none', 'home', 'featured', 'urgent'].includes(article.destaque)) {
        errors.push({ 
          field: 'destaque', 
          message: `Artigo ${index + 1}: Destaque inválido (use: none, home, featured ou urgent)`, 
          type: 'error', 
          articleIndex: index 
        });
      }
    });
    
  } catch (e) {
    errors.push({ 
      field: 'json', 
      message: 'JSON inválido: verifique a sintaxe', 
      type: 'error' 
    });
  }
  
  return errors;
};
```

#### Atualizar UI da Aba JSON (linhas 598-635)

Adicionar estado para erros de validação e atualizar o componente:

```tsx
// Estado adicional
const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

// Validação em tempo real (debounced)
useEffect(() => {
  if (!jsonContent.trim()) {
    setValidationErrors([]);
    return;
  }
  
  const timer = setTimeout(() => {
    setValidationErrors(validateNewsJson(jsonContent));
  }, 500);
  
  return () => clearTimeout(timer);
}, [jsonContent]);
```

Nova UI da aba JSON:

```tsx
<TabsContent value="json" className="mt-4 space-y-3">
  {/* Header com botões */}
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant={jsonValid === true ? 'default' : jsonValid === false ? 'destructive' : 'secondary'}>
      {jsonValid === true ? '✓ JSON válido' : jsonValid === false ? '✗ JSON inválido' : 'Aguardando JSON'}
    </Badge>
    
    {validationErrors.length > 0 && (
      <>
        <Badge variant="destructive">
          {validationErrors.filter(e => e.type === 'error').length} erro(s)
        </Badge>
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          {validationErrors.filter(e => e.type === 'warning').length} aviso(s)
        </Badge>
      </>
    )}
    
    <div className="flex-1" />
    
    <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
      <Download className="mr-1 h-4 w-4" />
      Baixar Template
    </Button>
    
    <Button variant="outline" size="sm" onClick={() => validateJson(jsonContent)} disabled={!jsonContent.trim()}>
      Validar
    </Button>
  </div>
  
  {/* Lista de erros de validação */}
  {validationErrors.length > 0 && (
    <div className="rounded-lg border p-3 space-y-1 max-h-32 overflow-y-auto">
      {validationErrors.map((err, idx) => (
        <div 
          key={idx} 
          className={`text-xs flex items-start gap-2 ${
            err.type === 'error' ? 'text-destructive' : 'text-amber-600'
          }`}
        >
          {err.type === 'error' ? (
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          )}
          <span><strong>{err.field}:</strong> {err.message}</span>
        </div>
      ))}
    </div>
  )}
  
  {/* Textarea do JSON */}
  <Textarea
    placeholder={`Cole o JSON aqui ou baixe o template de exemplo...

Estrutura esperada:
{
  "noticias": [
    {
      "titulo": "Título da notícia (obrigatório)",
      "slug": "slug-da-noticia (obrigatório)",
      "resumo": "Resumo com 30-300 caracteres (obrigatório)",
      "conteudo": "Conteúdo HTML (obrigatório)",
      "categoria": "Nome da categoria (obrigatório)",
      "tags": ["tag1", "tag2", ...] (recomendado 12),
      "destaque": "none" | "home" | "featured" | "urgent",
      "generateWebStory": true,
      "imagem": {
        "hero": "https://url-imagem-principal.jpg",
        "galeria": ["url1.jpg", "url2.jpg"]
      }
    }
  ]
}`}
    value={jsonContent}
    onChange={(e) => {
      setJsonContent(e.target.value);
      setJsonValid(null);
    }}
    className={`min-h-[200px] font-mono text-sm ${
      validationErrors.some(e => e.type === 'error') 
        ? 'border-destructive focus-visible:ring-destructive' 
        : ''
    }`}
  />
</TabsContent>
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/admin/noticias-ai/NoticiasAIInput.tsx` | Adicionar template, validação em tempo real e botão de download |

---

## Resultado Visual Esperado

### Antes
- Apenas badge de "JSON válido/inválido"
- Placeholder básico com exemplo incompleto
- Sem forma de obter template

### Depois
- Botão "Baixar Template" que gera arquivo `.json` completo
- Validação automática enquanto digita
- Lista de erros/avisos com ícones coloridos
- Contador de erros (vermelho) e avisos (amarelo)
- Borda vermelha no textarea quando há erros
- Placeholder expandido com documentação dos campos
- Template de exemplo com 2 notícias completas e galerias de imagens
