

# Plano: Adicionar "Auto Post Regional" ao Menu Conteúdo

## Resumo

Adicionar um novo item de menu "Auto Post Regional" exclusivamente dentro do grupo "Conteúdo" na sidebar administrativa. Este item será separado do "Auto Post PRO" existente que permanece em "Negócios".

---

## Alterações Necessárias

### 1. Sidebar (`AdminSidebar.tsx`)

Adicionar novo item na lista `contentItems`:

| Campo | Valor |
|-------|-------|
| title | Auto Post Regional |
| url | /admin/autopost-regional |
| icon | MapPin |
| badge | Grande Cotia |
| badgeColor | bg-amber-500 |

**Posição**: Após "Edição Digital" (último item da lista atual)

### 2. Route Mapping (`useSidebarPersistence.ts`)

Adicionar mapeamento de rota para o grupo "conteudo":

```text
"/admin/autopost-regional": "conteudo"
```

### 3. Nova Rota e Página

Criar rota `/admin/autopost-regional` que renderiza um componente dedicado para a funcionalidade regional, ou redireciona para a página existente `/admin/autopost` com filtro regional ativo.

---

## Arquivos a Modificar

```text
src/components/admin/AdminSidebar.tsx
├── Importar MapPin (já importado)
└── Adicionar item em contentItems

src/hooks/useSidebarPersistence.ts
└── Adicionar rota no ROUTE_TO_GROUP

src/App.tsx (ou routes)
└── Adicionar rota /admin/autopost-regional

src/pages/admin/autopost/AutoPostRegional.tsx (NOVO)
└── Página dedicada ao Auto Post Regional
```

---

## Resultado Visual Esperado

No menu "Conteúdo" expandido:

```text
📁 Conteúdo
├── Dashboard
├── Notícias
├── Nova Notícia
├── Notícias IA [IA]
├── Notas Rápidas
├── Web Stories
├── Podcasts
├── Edição Digital
└── Auto Post Regional [Grande Cotia] ← NOVO
```

---

## Observações

- O item existente "Auto Post PRO" em "Negócios" permanece inalterado
- A badge "Grande Cotia" identifica visualmente o foco regional
- O ícone MapPin reforça o conceito geográfico

