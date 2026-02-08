
# Toggles de Radio e TV Web no Dashboard

## Resumo

Adicionar um painel compacto no Dashboard administrativo com switches para ativar/desativar rapidamente os modulos **Web Radio** e **Web TV**, sem precisar navegar ate `/admin/settings/modules`.

---

## Alteracoes

### 1. Novo componente: `src/components/admin/dashboard/StreamingTogglePanel.tsx`

Criar um componente compacto (Card) com:
- Titulo: "Streaming" ou "Radio e TV"
- Dois itens com icone, label e Switch:
  - **Web Radio** (`web_radio`) — icone `Radio`
  - **Web TV** (`web_tv`) — icone `Tv`
- Usa os hooks existentes: `useSiteTemplateConfig` para ler estado, `useToggleModule` para alternar
- Reutiliza a mesma logica de `getModuleState` do `ModulesManager.tsx`
- Link "Gerenciar modulos" apontando para `/admin/settings/modules`

Layout visual:
```text
+-----------------------------+
| Radio e TV            Gear  |
| Controle rapido             |
|-----------------------------|
| [Radio icon] Web Radio  [o] |
| [TV icon]    Web TV     [o] |
+-----------------------------+
```

### 2. `src/pages/admin/Dashboard.tsx`

Importar e posicionar o `StreamingTogglePanel` na coluna lateral (sidebar column, `lg:col-span-4`), junto aos outros paineis como `TrendingPanel`, `UserManagementPanel` e `QuickStatsPanel`.

---

## Detalhes tecnicos

- **Hooks reutilizados**: `useSiteTemplateConfig`, `usePortalTemplate`, `useToggleModule` — mesma logica ja usada em `ModulesManager.tsx`
- **Tipo**: `ModuleKey` de `@/types/portal-templates`
- **Nenhuma alteracao** em banco de dados, RLS, ou arquitetura
- **Dois arquivos**: 1 criado, 1 editado
