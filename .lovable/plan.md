
# Ocultar/Ativar Web Radio e Web TV no Site

## Resumo

O sistema de modulos ja possui toda a infraestrutura para ativar/desativar `web_radio` e `web_tv` via painel admin (`/admin/settings/modules`). Porem, alguns componentes publicos nao respeitam esse toggle. A solucao e envolver os componentes publicos com os guards existentes.

---

## O que ja funciona

- Painel em `/admin/settings/modules` com Switch para cada modulo (incluindo Web Radio e Web TV)
- Hook `useModuleEnabled('web_radio')` e `useModuleEnabled('web_tv')` retornam o estado correto
- `ModuleGuard` e `RouteModuleGuard` componentes prontos para uso
- Header ja importa `ModuleGuard`

## O que precisa ser corrigido

1. **Rotas publicas `/radio` e `/tv`** nao estao protegidas por `RouteModuleGuard`
2. **`TopAudioPlayer`** (barra sticky do radio no topo) nao respeita o toggle `web_radio`
3. **`GlobalRadioProvider`** no `PublicLayout` carrega mesmo quando radio esta desativado

---

## Alteracoes

### 1. `src/App.tsx` — Proteger rotas publicas

Envolver as rotas `/radio` e `/tv` com `RouteModuleGuard`:

```tsx
<Route path="/radio" element={
  <RouteModuleGuard module="web_radio">
    <RadioPage />
  </RouteModuleGuard>
} />
<Route path="/tv" element={
  <RouteModuleGuard module="web_tv">
    <TvPage />
  </RouteModuleGuard>
} />
```

Quando o modulo estiver desativado, o usuario sera redirecionado para `/` com um toast informativo.

### 2. `src/components/layout/PublicLayout.tsx` — Condicionar radio player

Envolver `TopAudioPlayer` e `GlobalRadioProvider` com `ModuleGuard`:

```tsx
<ModuleGuard module="web_radio">
  <GlobalRadioProvider>
    <TopAudioPlayer />
    {/* resto do conteudo que depende do radio context */}
  </GlobalRadioProvider>
</ModuleGuard>
```

Como o `GlobalRadioProvider` envolve todo o layout (e outros componentes podem usar `useGlobalRadio`), a abordagem sera:
- Manter o provider mas condicionar apenas o `TopAudioPlayer` com `ModuleGuard`
- Isso evita erros de context em componentes filhos

Solucao final:
```tsx
<ModuleGuard module="web_radio">
  <TopAudioPlayer />
</ModuleGuard>
```

### 3. Verificar Header — Links de Radio/TV no menu

O Header ja importa `ModuleGuard`. Verificar se os links de menu para Radio e TV ja estao condicionados. Se nao estiverem, envolver com `ModuleGuard` tambem.

---

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/App.tsx` | Envolver rotas `/radio` e `/tv` com `RouteModuleGuard` |
| `src/components/layout/PublicLayout.tsx` | Envolver `TopAudioPlayer` com `ModuleGuard` |

## Nenhuma alteracao em

- Banco de dados
- Politicas RLS
- Painel de modulos (ja funciona)
- Arquitetura do projeto

## Como usar

1. Acesse `/admin/settings/modules`
2. Desative "Web Radio" — a barra de audio do topo desaparece e a rota `/radio` redireciona para home
3. Desative "Web TV" — a rota `/tv` redireciona para home
4. Reative a qualquer momento pelo mesmo painel
