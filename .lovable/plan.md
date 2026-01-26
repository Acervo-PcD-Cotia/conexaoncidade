
# Plano de Implementação: Conexão.AI

## Visão Geral

O **Conexão.AI** será o cérebro operacional do Portal Conexão na Cidade - um módulo nativo do dashboard que centraliza inteligência artificial, automação e ferramentas inteligentes para acelerar a produção de conteúdo e operações do portal.

---

## Arquitetura do Sistema

### Posicionamento no Dashboard

O módulo será adicionado ao grupo **Negócios** no menu lateral, logo após o Conexão Academy:

```text
Negócios
├── Conexão Academy
├── Conexão.AI  ← NOVO
├── Soluções
├── Treinamento
└── ...
```

### Estrutura de Rotas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin/conexao-ai` | Dashboard principal | Cards de ação rápida |
| `/admin/conexao-ai/assistente` | Assistente contextual | Chat com IA do portal |
| `/admin/conexao-ai/criador` | Criador de conteúdo | Geração de notícias |
| `/admin/conexao-ai/ferramentas` | Ferramentas inteligentes | Quiz, checklists, etc. |
| `/admin/conexao-ai/automacoes` | Automações | Motor de eventos |
| `/admin/conexao-ai/insights` | Insights e diagnósticos | Painéis analíticos |

---

## Banco de Dados

### Novas Tabelas

```text
conexao_ai_conversations
├── id (UUID, PK)
├── user_id (UUID)
├── title (TEXT) - título gerado automaticamente
├── context (TEXT) - área do portal (news, pcd, radio, etc.)
├── created_at / updated_at (TIMESTAMPTZ)

conexao_ai_messages
├── id (UUID, PK)
├── conversation_id (UUID, FK → conexao_ai_conversations)
├── role ('user' | 'assistant')
├── content (TEXT)
├── metadata (JSONB) - ações sugeridas, links, etc.
├── created_at (TIMESTAMPTZ)

conexao_ai_content_drafts
├── id (UUID, PK)
├── user_id (UUID)
├── type ('news' | 'pcd' | 'instagram' | 'facebook')
├── title (TEXT)
├── content (JSONB) - estrutura completa do conteúdo
├── status ('draft' | 'published' | 'discarded')
├── published_id (UUID) - referência à notícia publicada
├── created_at / updated_at (TIMESTAMPTZ)

conexao_ai_automations
├── id (UUID, PK)
├── trigger_event (TEXT) - 'news_created', 'partner_registered', etc.
├── action_type (TEXT) - 'suggest_share', 'generate_checklist', etc.
├── config (JSONB) - configurações da automação
├── is_active (BOOLEAN)
├── created_at (TIMESTAMPTZ)

conexao_ai_automation_logs
├── id (UUID, PK)
├── automation_id (UUID, FK)
├── user_id (UUID)
├── trigger_data (JSONB)
├── result (JSONB)
├── created_at (TIMESTAMPTZ)

conexao_ai_tool_usage
├── id (UUID, PK)
├── user_id (UUID)
├── tool_id (TEXT) - identificador da ferramenta
├── input_data (JSONB)
├── output_data (JSONB)
├── created_at (TIMESTAMPTZ)
```

---

## Edge Functions

### 1. `conexao-ai-assistant` (Assistente Contextual)

Sistema de prompt especializado que conhece o portal:

```text
CONHECIMENTOS DO ASSISTENTE:
- Módulos do portal (Notícias, Rádio, TV, PcD, Academy, etc.)
- Fluxos de cadastro (parceiros, eventos, PcD)
- Regras editoriais do Conexão na Cidade
- Estrutura de categorias e tags
- Funcionalidades de cada seção
- Gamificação da comunidade
- Direitos PcD e legislação básica

COMPORTAMENTO:
- Responde APENAS sobre o ecossistema Conexão
- Sugere ações práticas no sistema
- Indica rotas/páginas específicas quando relevante
- Usa linguagem simples e acolhedora
- Nunca inventa funcionalidades que não existem
```

### 2. `conexao-ai-content` (Criador de Conteúdo)

Gera conteúdo no padrão editorial:

- Título otimizado (≤60 caracteres)
- Slug SEO-friendly
- Chapéu/Hat
- Subtítulo/Linha fina
- Lead jornalístico
- Corpo estruturado
- Meta título e descrição
- Sugestão de tags
- Variantes para PcD News (linguagem inclusiva)
- Adaptações para redes sociais (Instagram/Facebook)

### 3. `conexao-ai-tools` (Ferramentas)

Ferramentas específicas:
- Gerador de pautas locais (por cidade/bairro)
- Quiz de cadastro de parceiros
- Checklist "Apareça no Google"
- Formulário guiado PcD
- Análise de oportunidades de conteúdo

---

## Estrutura de Arquivos

```text
src/
├── pages/admin/conexao-ai/
│   ├── ConexaoAIDashboard.tsx      # Home com cards de ação
│   ├── ConexaoAIAssistant.tsx      # Chat contextual
│   ├── ConexaoAICreator.tsx        # Criador de conteúdo
│   ├── ConexaoAITools.tsx          # Ferramentas inteligentes
│   ├── ConexaoAIAutomations.tsx    # Motor de automação
│   └── ConexaoAIInsights.tsx       # Painéis de diagnóstico
│
├── components/conexao-ai/
│   ├── AIActionCard.tsx            # Card de ação rápida
│   ├── AIChat.tsx                  # Interface de chat
│   ├── AIChatMessage.tsx           # Mensagem individual
│   ├── AIContentPreview.tsx        # Preview do conteúdo gerado
│   ├── AIContentVariants.tsx       # Variantes (PcD, social)
│   ├── AIToolCard.tsx              # Card de ferramenta
│   ├── AIAutomationCard.tsx        # Card de automação
│   ├── AIInsightWidget.tsx         # Widget de insight
│   └── AIPublishDialog.tsx         # Dialog de publicação
│
├── hooks/
│   └── useConexaoAI.ts             # Hooks do módulo
│
└── types/
    └── conexao-ai.ts               # Tipagens TypeScript
```

---

## Componentes Principais

### 1. Dashboard Principal (`ConexaoAIDashboard.tsx`)

Layout com cards de ação orientados a resultado:

| Card | Ícone | Ação |
|------|-------|------|
| Criar notícia com IA | Newspaper + Sparkles | Abre o criador de conteúdo |
| Divulgar negócio | Store | Inicia quiz de parceiro |
| Criar projeto PcD | Accessibility | Formulário guiado |
| Configurar Rádio/TV | Radio / Tv | Wizard de configuração |
| Analisar desempenho | BarChart3 | Vai para insights |
| Automatizar tarefas | Zap | Lista de automações |

Design: Cards grandes com gradiente, ícone destacado e descrição curta.

### 2. Assistente Inteligente (`ConexaoAIAssistant.tsx`)

Interface de chat estilo moderno:

- Input fixo na parte inferior
- Histórico de mensagens com scroll
- Sugestões de perguntas frequentes
- Ações clicáveis nas respostas (links para rotas do dashboard)
- Contexto persistente por conversa

Exemplos de prompts iniciais:
- "Como cadastro um parceiro?"
- "Quero criar uma web rádio"
- "Como publicar uma notícia corretamente?"
- "Quais serviços PcD existem no portal?"

### 3. Criador de Conteúdo (`ConexaoAICreator.tsx`)

Fluxo em etapas:

1. **Input**: Usuário fornece tema, rascunho ou link
2. **Geração**: IA gera estrutura completa
3. **Revisão**: Editor com preview lado a lado
4. **Variantes**: Toggle para PcD, Instagram, Facebook
5. **Publicação**: Envio direto para `news` ou clipboard

Campos gerados:
- `titulo` (≤60 chars)
- `slug`
- `chapeu` (categoria em maiúsculas)
- `subtitulo` (≤120 chars)
- `resumo` (2-3 frases)
- `conteudo` (HTML formatado)
- `meta_titulo` (≤60 chars)
- `meta_descricao` (≤160 chars)
- `tags` (5-12 sugestões)

### 4. Ferramentas Inteligentes (`ConexaoAITools.tsx`)

Grid de ferramentas com cards:

| Ferramenta | Descrição | Output |
|------------|-----------|--------|
| Gerador de Pautas | Sugere temas por cidade/bairro | Lista de ideias |
| Quiz Parceiro | Perguntas guiadas para cadastro | Dados estruturados |
| Checklist Google | Verificação de presença digital | Tarefas acionáveis |
| Formulário PcD | Cadastro assistido de serviços | Formulário preenchido |
| Análise de Oportunidades | Identifica lacunas de conteúdo | Relatório |

Cada ferramenta:
- Objetivo claro no card
- Fluxo simples (máximo 3 etapas)
- Resultado acionável (copiar, salvar, publicar)

### 5. Automações (`ConexaoAIAutomations.tsx`)

Motor baseado em eventos:

| Gatilho | Ação Sugerida |
|---------|---------------|
| `news_created` | Sugerir divulgação nas redes |
| `partner_registered` | Gerar checklist de visibilidade |
| `event_created` | Criar post social |
| `radio_activated` | Gerar páginas e instruções |

Interface:
- Lista de automações ativas
- Toggle para ativar/desativar
- Log de execuções recentes
- Automações são SUGERIDAS, não forçadas

### 6. Insights e Diagnósticos (`ConexaoAIInsights.tsx`)

Painéis visuais simples:

- Top 10 conteúdos mais acessados
- Ações mais realizadas (últimos 30 dias)
- Módulos mais utilizados
- Demandas mais comuns de PcD
- Oportunidades de monetização

Design: Cards com gráficos simples (barras, pizza) usando Recharts.

---

## Integração com Módulos Existentes

### Reutilização de Infraestrutura

| Recurso | Origem | Uso no Conexão.AI |
|---------|--------|-------------------|
| `news-ai` Edge Function | Notícias IA | Base para criador de conteúdo |
| `community-ai-chat` | Comunidade | Padrão para assistente |
| `useAuth` | Auth | Controle de acesso |
| `useUserRole` | RBAC | Permissões por perfil |
| Lovable AI Gateway | Infraestrutura | Todas as chamadas de IA |

### Fluxo de Publicação

1. Conteúdo gerado no Conexão.AI
2. Usuário revisa e ajusta
3. Clica em "Publicar"
4. Sistema insere em `news` com `origin: 'conexao-ai'`
5. Tags são criadas automaticamente
6. Automação sugere divulgação

---

## Políticas RLS

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `conexao_ai_conversations` | Próprio user | Próprio user | Próprio user | Próprio user |
| `conexao_ai_messages` | Próprio user | Próprio user | — | — |
| `conexao_ai_content_drafts` | Próprio user | Próprio user | Próprio user | Próprio user |
| `conexao_ai_automations` | Admin | Admin | Admin | Admin |
| `conexao_ai_automation_logs` | Admin | Sistema | — | — |
| `conexao_ai_tool_usage` | Próprio user | Próprio user | — | — |

---

## Menu Lateral (Sidebar)

Adicionar ao grupo **Negócios** em `AdminSidebar.tsx`:

```typescript
const businessItems: MenuItem[] = [
  { title: "Conexão Academy", url: "/admin/academy", icon: PlayCircle },
  { title: "Conexão.AI", url: "/admin/conexao-ai", icon: Brain }, // NOVO
  { title: "Soluções", url: "/admin/solutions", icon: Puzzle },
  // ...
];
```

Ícone sugerido: `Brain` (lucide-react) ou `Sparkles` para consistência com IA.

---

## Rotas no App.tsx

```typescript
// Conexão.AI Pages
import ConexaoAIDashboard from "./pages/admin/conexao-ai/ConexaoAIDashboard";
import ConexaoAIAssistant from "./pages/admin/conexao-ai/ConexaoAIAssistant";
import ConexaoAICreator from "./pages/admin/conexao-ai/ConexaoAICreator";
import ConexaoAITools from "./pages/admin/conexao-ai/ConexaoAITools";
import ConexaoAIAutomations from "./pages/admin/conexao-ai/ConexaoAIAutomations";
import ConexaoAIInsights from "./pages/admin/conexao-ai/ConexaoAIInsights";

// Routes
<Route path="conexao-ai" element={<ConexaoAIDashboard />} />
<Route path="conexao-ai/assistente" element={<ConexaoAIAssistant />} />
<Route path="conexao-ai/criador" element={<ConexaoAICreator />} />
<Route path="conexao-ai/ferramentas" element={<ConexaoAITools />} />
<Route path="conexao-ai/automacoes" element={<ConexaoAIAutomations />} />
<Route path="conexao-ai/insights" element={<ConexaoAIInsights />} />
```

---

## System Prompt do Assistente

```text
Você é o Assistente Inteligente do Portal Conexão na Cidade.

VOCÊ CONHECE:
- Módulos: Notícias, Rádio Web, TV Web, PcD/Núcleo PcD, Academy, Parceiros, Comunidade
- Fluxos: Cadastro de parceiro, publicação de notícia, criação de evento, registro PcD
- Ferramentas: Notícias IA, AutoPost, Gerador de Links, Distribuição Social
- Gamificação: Pontos, níveis, badges da comunidade
- Legislação PcD básica e direitos

VOCÊ NÃO CONHECE:
- Assuntos externos ao portal
- Notícias de outros veículos
- Informações não relacionadas ao Conexão na Cidade

COMPORTAMENTO:
- Responde de forma simples e direta
- Sugere ações práticas (ex: "Vá em Notícias > Nova Notícia")
- Indica rotas do dashboard quando relevante
- Usa linguagem acolhedora e inclusiva
- Nunca inventa funcionalidades

FORMATO DE RESPOSTA:
- Respostas curtas (máximo 200 palavras)
- Use listas quando apropriado
- Inclua [AÇÃO: /rota] para sugerir navegação
```

---

## Critérios de Aceite

### Funcionalidade
- [ ] Dashboard com 6 cards de ação funcionais
- [ ] Assistente responde sobre o portal com precisão
- [ ] Assistente recusa assuntos externos educadamente
- [ ] Criador gera notícia completa no padrão Conexão
- [ ] Variantes PcD e Social funcionam
- [ ] Publicação direta para tabela `news`
- [ ] Ferramentas com fluxo simples e resultado acionável
- [ ] Automações sugeridas, não forçadas
- [ ] Insights mostram dados reais

### Integração
- [ ] Menu lateral com item Conexão.AI
- [ ] Rotas registradas e funcionando
- [ ] Autenticação obrigatória
- [ ] RLS configurado corretamente

### UX
- [ ] Interface limpa e moderna
- [ ] Linguagem simples e humana
- [ ] Responsivo em mobile
- [ ] Loading states adequados
- [ ] Tratamento de erros amigável

---

## Estimativa de Esforço

| Fase | Complexidade | Componentes |
|------|-------------|-------------|
| Banco de Dados | Média | 6 tabelas + RLS |
| Edge Functions | Alta | 3 funções com prompts complexos |
| Tipos/Hooks | Média | ~15 hooks |
| Dashboard | Baixa | 1 página + 6 cards |
| Assistente | Alta | Chat completo + histórico |
| Criador | Alta | Editor + variantes + publicação |
| Ferramentas | Média | 5 ferramentas básicas |
| Automações | Média | Motor + UI de gestão |
| Insights | Baixa | 5 widgets com queries |
| Integração | Baixa | Sidebar + Rotas |

---

## Tecnologias Utilizadas

- **IA**: Lovable AI Gateway (gemini-3-flash-preview)
- **UI**: Shadcn/ui + Tailwind CSS
- **Estado**: React Query + Zustand (se necessário)
- **Gráficos**: Recharts (já instalado)
- **Editor Rico**: TipTap (já instalado)
- **Markdown**: react-markdown para renderização de chat

---

## Observações Finais

1. **Isolamento**: O módulo é independente e não modifica outros módulos
2. **Escalabilidade**: Estrutura preparada para futuro SaaS multi-tenant
3. **Segurança**: Todas as chamadas de IA passam por Edge Functions
4. **Performance**: Streaming de respostas para UX responsiva
5. **Manutenção**: Código documentado e seguindo padrões existentes

O Conexão.AI será o motor inteligente que acelera todas as operações do portal, mantendo a identidade e padrões do Conexão na Cidade.
