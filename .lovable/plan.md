
# Plano: Conexão Academy com Conteúdo Inicial

## Visão Geral

O objetivo é tornar o Conexão Academy funcional desde o primeiro acesso, com:
1. Dashboard home com CTAs claros e cards de cursos
2. 2 cursos iniciais (WebRádio e WebTV) com módulos e aulas estruturados
3. Suporte a checklists nas aulas
4. Sistema de progresso por usuário

---

## Análise do Estado Atual

### Estrutura Existente

O Academy já possui uma implementação sólida:

| Componente | Status |
|------------|--------|
| Tabelas de banco | `academy_categories`, `academy_courses`, `academy_lessons`, `academy_progress` ✅ |
| Hooks React Query | CRUD completo para categorias, cursos, aulas e progresso ✅ |
| Páginas | Dashboard, Curso, Aula (funcional mas sem conteúdo) ✅ |
| Sidebar | Dentro do grupo "Negócios" ✅ |

### Problemas Identificados

1. **Banco vazio**: Nenhum curso cadastrado
2. **Dashboard genérica**: Não tem CTAs claros quando vazio
3. **Sem suporte a checklist**: O campo `external_links` existe, mas não há campo específico para checklists
4. **Falta seed automático**: Não há lógica para criar cursos iniciais

---

## Mudanças Necessárias

### 1. Banco de Dados

**Alteração na tabela `academy_lessons`:**
Adicionar coluna `checklist` (JSONB) para armazenar itens de verificação:

```sql
ALTER TABLE academy_lessons 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';
```

Estrutura do checklist:
```json
[
  { "item": "Definir formato da rádio", "order": 1 },
  { "item": "Escolher plataforma de streaming", "order": 2 }
]
```

**Seed Data (Migration):**
Inserir automaticamente os 2 cursos com seus módulos e aulas SE a tabela estiver vazia.

---

### 2. Dashboard Home (UI Melhorada)

**Novo comportamento:**

```text
┌─────────────────────────────────────────────────────────┐
│ 🎓 Conexão Academy                          [Buscar...] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TREINAMENTOS OPERACIONAIS                              │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │  📻          │  │  📺          │                       │
│  │  WebRádio   │  │  WebTV      │                       │
│  │  do zero    │  │  do zero    │                       │
│  │  ao ar      │  │  ao ar      │                       │
│  │             │  │             │                       │
│  │ [Abrir] 0%  │  │ [Abrir] 0%  │                       │
│  └─────────────┘  └─────────────┘                       │
│                                                         │
│  CONTINUE DE ONDE PAROU                                 │
│  (exibe se houver progresso)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Componentes a criar/modificar:**

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `AcademyDashboard.tsx` | Modificar | Adicionar CTA principal, empty state melhorado, hook de seed |
| `AcademyEmptyState.tsx` | Criar | Componente para estado vazio com CTAs |
| `AcademyCourseGrid.tsx` | Criar | Grid de cursos (alternativa ao carousel) |

---

### 3. Página do Curso com Accordion de Módulos

**Novo componente:** Agrupar aulas por módulo (usando prefixo no título).

A estrutura atual usa `sort_order` para ordenar aulas. Como não há tabela de módulos, usaremos **prefixo no título da aula** para agrupar:

- "M1: Preparação | O que é WebRádio no Conexão"
- "M1: Preparação | Materiais necessários"
- "M2: Implantação | Criando a rádio no painel"

**Componente:** `AcademyModuleAccordion.tsx`

```text
┌──────────────────────────────────────────────┐
│ ▼ M1: Preparação (3 aulas)                   │
├──────────────────────────────────────────────┤
│   ○ O que é WebRádio no Conexão              │
│   ○ Materiais necessários                    │
│   ○ Checklist mínimo                         │
└──────────────────────────────────────────────┘
│ ▶ M2: Implantação (3 aulas)                  │
└──────────────────────────────────────────────┘
```

---

### 4. Página da Aula com Checklist

**Modificar `AcademyLesson.tsx`:**

Adicionar renderização de checklist quando disponível:

```text
┌─────────────────────────────────────────────────────────┐
│ ← Voltar ao curso           [Marcar como concluída]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Checklist mínimo para WebRádio                         │
│                                                         │
│  ☐ Definir formato da rádio (musical, talk, misto)     │
│  ☐ Escolher plataforma de streaming                     │
│  ☐ Preparar identidade visual                           │
│  ☐ Configurar encoder (OBS, BUTT, etc.)                │
│  ☐ Testar conexão e qualidade do áudio                 │
│                                                         │
│  [Conteúdo em texto da aula...]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Novo componente:** `AcademyLessonChecklist.tsx`

---

### 5. Hook de Auto-Seed

**Criar:** `useAcademySeed.ts`

Lógica:
1. Verifica se existem cursos
2. Se não existirem, insere os 2 cursos iniciais com aulas
3. Executa apenas uma vez (com flag no localStorage para evitar loops)

```typescript
export function useAcademySeed() {
  const { data: courses, isLoading } = useAcademyCourses();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!isLoading && courses?.length === 0 && !seeded) {
      seedInitialCourses().then(() => setSeeded(true));
    }
  }, [isLoading, courses, seeded]);
}
```

---

## Estrutura de Dados dos Cursos Iniciais

### Curso 1: WebRádio

```typescript
{
  title: "WebRádio: do zero ao ar",
  slug: "webradio-do-zero-ao-ar",
  description: "Aprenda a configurar sua WebRádio no Conexão e colocar no ar com qualidade.",
  visibility: "all",
  is_published: true,
  duration_minutes: 45,
  lessons: [
    // M1: Preparação
    {
      title: "O que é WebRádio no Conexão",
      description: "Entenda o conceito e as possibilidades",
      content_html: "<p>Uma WebRádio é uma estação de rádio que transmite...</p>",
      sort_order: 1
    },
    {
      title: "Materiais necessários",
      description: "Lista completa do que você precisa",
      content_html: "<ul><li>Computador ou celular</li>...</ul>",
      sort_order: 2
    },
    {
      title: "Checklist mínimo",
      description: "Verifique antes de começar",
      checklist: [
        { item: "Definir formato da rádio (musical, talk, misto)", order: 1 },
        { item: "Escolher plataforma de streaming", order: 2 },
        // ...
      ],
      sort_order: 3
    },
    // M2: Implantação
    {
      title: "Criando a rádio no painel",
      description: "Passo a passo no dashboard",
      content_html: "<p>Acesse Streaming > Rádio Web...</p>",
      sort_order: 4
    },
    // ... demais aulas
  ]
}
```

### Curso 2: WebTV

Estrutura similar com 9 aulas sobre WebTV.

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `migrations/seed_academy.sql` | Criar | Adicionar coluna checklist + seed data |
| `src/types/academy.ts` | Modificar | Adicionar `checklist?: AcademyChecklistItem[]` |
| `src/hooks/useAcademy.ts` | Modificar | Parser para checklist, hook de seed |
| `src/hooks/useAcademySeed.ts` | Criar | Lógica de auto-seed |
| `src/pages/admin/academy/AcademyDashboard.tsx` | Modificar | CTA, empty state, grid de cursos |
| `src/pages/admin/academy/AcademyCourse.tsx` | Modificar | Accordion de módulos |
| `src/pages/admin/academy/AcademyLesson.tsx` | Modificar | Renderizar checklist |
| `src/components/academy/AcademyEmptyState.tsx` | Criar | Estado vazio com CTAs |
| `src/components/academy/AcademyCourseGrid.tsx` | Criar | Grid de cursos |
| `src/components/academy/AcademyModuleAccordion.tsx` | Criar | Accordion de módulos |
| `src/components/academy/AcademyLessonChecklist.tsx` | Criar | Renderização de checklist |

---

## Conteúdo das Aulas (Resumo)

### Curso: WebRádio - do zero ao ar

**Módulo 1: Preparação**
1. **O que é WebRádio no Conexão** - Explicação conceitual
2. **Materiais necessários** - Lista: computador, microfone, software, internet
3. **Checklist mínimo** - Verificação pré-implantação

**Módulo 2: Implantação**
4. **Criando a rádio no painel** - Passo a passo no dashboard
5. **Configurando streaming e player** - RTMP, Icecast, player embed
6. **Testes e validação** - Como testar antes de publicar

**Módulo 3: Publicação e distribuição**
7. **Publicando no portal** - Ativação e destaque
8. **Alexa e apps: visão geral** - Próximos passos
9. **Boas práticas e padrões** - Qualidade de áudio, horários

### Curso: WebTV - do zero ao ar

**Módulo 1: Preparação**
1. **O que é WebTV e formatos** - Ao vivo, gravado, híbrido
2. **Materiais necessários** - Câmera, encoder, iluminação
3. **Checklist de qualidade mínima** - Verificação técnica

**Módulo 2: Implantação**
4. **Criando canal e player** - Configuração no dashboard
5. **RTMP vs HLS: quando usar** - Diferenças técnicas
6. **Testes: imagem, som, bitrate** - Validação de qualidade

**Módulo 3: Publicação e crescimento**
7. **Publicação no portal + destaque** - Visibilidade
8. **Smart TVs: visão geral** - Futuras integrações
9. **Monetização e publicidade** - Oportunidades

---

## Fluxo de Implementação

```text
1. Migration (banco)
   └─> Adicionar coluna checklist
   └─> Seed dos 2 cursos com aulas

2. Types/Hooks
   └─> Atualizar tipos
   └─> Criar parser de checklist
   └─> Criar hook de seed

3. Componentes
   └─> AcademyEmptyState
   └─> AcademyCourseGrid
   └─> AcademyModuleAccordion
   └─> AcademyLessonChecklist

4. Páginas
   └─> Dashboard (CTA + grid)
   └─> Curso (accordion)
   └─> Aula (checklist)
```

---

## Critérios de Aceite

### Funcionalidade
- [ ] Dashboard exibe 2 cursos iniciais automaticamente
- [ ] Cada curso mostra módulos em accordion
- [ ] Aulas com checklist renderizam lista de verificação
- [ ] Progresso do usuário persiste corretamente
- [ ] Botão "Marcar como concluída" funciona
- [ ] Empty state tem CTA claro

### Integração
- [ ] Sidebar mantém "Conexão Academy" no grupo Negócios
- [ ] Rotas existentes continuam funcionando
- [ ] Não quebra outros módulos

### UX
- [ ] Interface limpa e responsiva
- [ ] Loading states adequados
- [ ] Feedback visual ao completar aula

---

## Observações Técnicas

1. **Módulos sem tabela própria**: Usaremos agrupamento por prefixo no título da aula para evitar nova tabela
2. **Checklist no front**: MVP com estado local; persistência opcional via `academy_progress`
3. **Seed via migration**: Garante que o conteúdo existe desde o deploy
4. **Reutilização**: Aproveita 100% da infraestrutura existente do Academy
