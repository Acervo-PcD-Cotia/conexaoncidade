

# Toggles para Menus Especiais do Site

## Objetivo
Criar uma pagina administrativa para ativar/desativar individualmente cada botao do menu especial (barra de chips coloridos) no site publico.

## Menus controlados

| Menu | Module Key | Cor |
|---|---|---|
| Voce no Google | `menu_google` | Blue |
| Brasileirao | `menu_brasileirao` | Emerald |
| Censo SP | `menu_censo` | Purple |
| Conexoes | `menu_conexoes` | Pink |
| ENEM | `menu_enem` | Indigo |
| Fake News | `menu_fakenews` | Green |
| Escolar | `menu_escolar` | Amber |
| Imoveis | `menu_imoveis` | Teal |

## Implementacao

### 1. Expandir ModuleKey (portal-templates.ts)

Adicionar 8 novas chaves ao tipo `ModuleKey`:
```
'menu_google' | 'menu_brasileirao' | 'menu_censo' | 'menu_conexoes'
| 'menu_enem' | 'menu_fakenews' | 'menu_escolar' | 'menu_imoveis'
```

Adicionar metadata correspondente em `MODULE_METADATA`.

### 2. Criar pagina admin: MenuToggleSettings

Arquivo: `src/pages/admin/settings/MenuToggleSettings.tsx`

Uma pagina simples com uma lista de switches, semelhante ao `StreamingTogglePanel`, onde cada item mostra o icone colorido, o nome do menu e um Switch on/off. Utiliza `useToggleModule` para persistir no banco via `modules_overrides`.

### 3. Adicionar rota no App.tsx

Montar a nova pagina em `/spah/painel/settings/menus`.

### 4. Adicionar link na sidebar

Incluir item "Menus do Site" dentro do grupo de Configuracoes na sidebar administrativa.

### 5. Atualizar Header.tsx

Envolver cada chip de menu com verificacao `useModuleEnabled('menu_xxx')`. Se o modulo estiver desativado, o chip nao renderiza. A logica se aplica tanto na versao desktop (barra de chips) quanto na versao mobile (lista no Sheet).

Todos os menus iniciam como **ativados por padrao** (fallback `true` quando nao ha override), para manter o comportamento atual.

## Detalhes Tecnicos

### Arquivos modificados

| Arquivo | Tipo | Descricao |
|---|---|---|
| `src/types/portal-templates.ts` | MODIFICAR | Adicionar 8 ModuleKeys + metadata |
| `src/pages/admin/settings/MenuToggleSettings.tsx` | NOVO | Pagina de toggles dos menus |
| `src/App.tsx` | MODIFICAR | Rota `/spah/painel/settings/menus` |
| `src/components/admin/AdminSidebar.tsx` | MODIFICAR | Link "Menus do Site" |
| `src/components/layout/Header.tsx` | MODIFICAR | Condicionar renderizacao dos chips |
| `src/hooks/useModuleEnabled.ts` | MODIFICAR | Tratar `menu_*` keys com default `true` |

### Comportamento padrao

Os novos module keys `menu_*` nao estao em `CORE_MODULES` nem em `default_modules` dos templates. Para que iniciem ativados, o hook `useModuleEnabled` sera ajustado para retornar `true` como fallback para chaves que comecam com `menu_`, a menos que exista um override explicito em `modules_overrides` setando `false`.

