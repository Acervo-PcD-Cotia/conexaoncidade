
# Plano: Finalizar Integração das Rotas Publidoor

## Resumo

Adicionar as rotas do módulo Publidoor ao `App.tsx` e criar a página `PublidoorEdit.tsx` para edição de Publidoors existentes.

---

## Mudanças Necessárias

### 1. Imports no App.tsx

Adicionar imports para todas as páginas do Publidoor (linhas ~95-105):

```typescript
// Publidoor Pages
import PublidoorDashboard from "./pages/admin/publidoor/PublidoorDashboard";
import PublidoorCreate from "./pages/admin/publidoor/PublidoorCreate";
import PublidoorEdit from "./pages/admin/publidoor/PublidoorEdit";
import PublidoorCampaigns from "./pages/admin/publidoor/PublidoorCampaigns";
import PublidoorLocations from "./pages/admin/publidoor/PublidoorLocations";
import PublidoorSchedules from "./pages/admin/publidoor/PublidoorSchedules";
import PublidoorAdvertisers from "./pages/admin/publidoor/PublidoorAdvertisers";
import PublidoorMetrics from "./pages/admin/publidoor/PublidoorMetrics";
import PublidoorTemplates from "./pages/admin/publidoor/PublidoorTemplates";
import PublidoorApprovals from "./pages/admin/publidoor/PublidoorApprovals";
import PublidoorSettings from "./pages/admin/publidoor/PublidoorSettings";
```

### 2. Rotas Admin no App.tsx

Adicionar bloco de rotas após as rotas do Conexão Academy (linha ~399):

```typescript
{/* Publidoor Routes */}
<Route path="publidoor" element={<PublidoorDashboard />} />
<Route path="publidoor/criar" element={<PublidoorCreate />} />
<Route path="publidoor/:id/editar" element={<PublidoorEdit />} />
<Route path="publidoor/campanhas" element={<PublidoorCampaigns />} />
<Route path="publidoor/locais" element={<PublidoorLocations />} />
<Route path="publidoor/agenda" element={<PublidoorSchedules />} />
<Route path="publidoor/anunciantes" element={<PublidoorAdvertisers />} />
<Route path="publidoor/metricas" element={<PublidoorMetrics />} />
<Route path="publidoor/modelos" element={<PublidoorTemplates />} />
<Route path="publidoor/aprovacoes" element={<PublidoorApprovals />} />
<Route path="publidoor/config" element={<PublidoorSettings />} />
```

### 3. Criar Página PublidoorEdit.tsx

Nova página para edição de Publidoors existentes:

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/admin/publidoor/PublidoorEdit.tsx` | Página de edição com carregamento do Publidoor existente |

**Funcionalidades:**
- Receber `id` via `useParams`
- Carregar dados do Publidoor via `usePublidoorItem(id)`
- Reutilizar componentes de `PublidoorCreate`
- Preview em tempo real durante edição
- Botões: "Salvar Alterações", "Cancelar"

---

## Estrutura de Rotas Publidoor

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin/publidoor` | Dashboard | Visão geral com métricas |
| `/admin/publidoor/criar` | Create | Criar novo Publidoor |
| `/admin/publidoor/:id/editar` | Edit | Editar Publidoor existente |
| `/admin/publidoor/campanhas` | Campaigns | Gestão de campanhas |
| `/admin/publidoor/locais` | Locations | Locais de exibição |
| `/admin/publidoor/agenda` | Schedules | Programação e agenda |
| `/admin/publidoor/anunciantes` | Advertisers | Cadastro de anunciantes |
| `/admin/publidoor/metricas` | Metrics | Analytics e métricas |
| `/admin/publidoor/modelos` | Templates | Modelos visuais |
| `/admin/publidoor/aprovacoes` | Approvals | Fluxo de aprovação |
| `/admin/publidoor/config` | Settings | Configurações gerais |

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/App.tsx` | Modificar (imports + rotas) |
| `src/pages/admin/publidoor/PublidoorEdit.tsx` | Criar |

---

## Detalhes Técnicos

### PublidoorEdit.tsx

```typescript
// Estrutura básica
export default function PublidoorEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = usePublidoorItem(id!);
  const updateItem = useUpdatePublidoorItem();

  // Formulário com valores pré-carregados
  // Preview em tempo real
  // Submissão via mutation
}
```

### Posicionamento das Rotas

As rotas serão inseridas após o bloco do Conexão Academy e antes do Conexão.AI, mantendo a organização alfabética/lógica do arquivo.

---

## Resultado Esperado

- Todas as 11 rotas do Publidoor funcionando
- Navegação completa pelo sidebar
- Página de edição permitindo modificar Publidoors existentes
- Integração consistente com o padrão existente do projeto
