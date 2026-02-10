
# Correções: Toggles de Streaming e Faixa do Rádio

## Problema 1: TV Web "não funciona" ao desativar

**Diagnóstico**: A rota `/tv` está corretamente protegida por `RouteModuleGuard` e redireciona para a home quando desativada. Porém, o link "Web Live" no menu do Header aponta para `/web-radio-tv` (uma página comercial/landing page), que NÃO está protegida. Além disso, os links "Web Live" no Header (mobile e desktop) não estão envolvidos em `ModuleGuard`, então continuam visíveis mesmo com rádio e TV desativados.

**Solução**: 
- Envolver os links "Web Live" no Header (mobile e desktop) com lógica condicional: mostrar apenas quando `web_radio` OU `web_tv` estiverem ativos
- Proteger a rota `/web-radio-tv` com guard que verifica se pelo menos um dos módulos (web_radio ou web_tv) está ativo

**Arquivo**: `src/components/layout/Header.tsx`
- Importar `useModuleEnabled` ou usar `ModuleGuard` 
- Envolver o link "Web Live" mobile (linhas ~139-147) com condição
- Envolver o link "Web Live" desktop (linhas ~364-372) com condição

**Arquivo**: `src/App.tsx`
- Não é necessário proteger `/web-radio-tv` pois é uma página comercial (venda do serviço). Mas o link no Header deve sumir.

---

## Problema 2: Manter faixa laranja vazia ao desativar rádio

**Diagnóstico atual**: O `ModuleGuard` remove completamente o `TopAudioPlayer` quando `web_radio` está desativado. O usuário quer manter a faixa laranja (barra sticky no topo) visível, porém vazia (sem controles do rádio).

**Solução**: 
- Em `src/components/layout/PublicLayout.tsx`: remover o `ModuleGuard` do `TopAudioPlayer`
- Em `src/components/layout/TopAudioPlayer.tsx`: usar `useModuleEnabled('web_radio')` internamente e, quando desativado, renderizar apenas a barra laranja vazia (sem controles, sem nome da rádio)

**Arquivo**: `src/components/layout/PublicLayout.tsx`
- Remover o `<ModuleGuard module="web_radio">` que envolve o `<TopAudioPlayer />`

**Arquivo**: `src/components/layout/TopAudioPlayer.tsx`
- Importar `useModuleEnabled`
- Se `web_radio` desativado: renderizar apenas `<div className="sticky top-0 z-50 h-12 bg-gradient-to-r from-primary via-primary/95 to-primary ...">` vazio
- Se ativado: renderizar normalmente (comportamento atual)

---

## Problema 3: Menu Publicidade e Monetização

**Diagnóstico**: Todos os 6 itens do menu foram testados no navegador:
- Campanhas 360 (`/admin/campaigns/unified`) — OK, carrega normalmente
- Comprovantes (`/admin/comprovantes`) — OK, carrega normalmente
- Anúncios (`/admin/ads`) — OK, carrega normalmente
- Super Banners (`/admin/banners`) — OK, carrega normalmente
- Publidoor (`/admin/publidoor`) — OK, carrega normalmente
- Parceiros (`/admin/partners`) — OK, carrega normalmente

Nenhum erro de JavaScript relacionado a estas páginas. O único erro encontrado é de CORS com a API de cotações (`economia.awesomeapi.com.br`), que não está relacionado ao menu de publicidade.

**Resultado**: Nenhuma correção necessária no menu Publicidade e Monetização.

---

## Resumo de alterações

| Arquivo | Alteração |
|---|---|
| `src/components/layout/Header.tsx` | Ocultar links "Web Live" quando ambos web_radio e web_tv estão desativados |
| `src/components/layout/PublicLayout.tsx` | Remover `ModuleGuard` do `TopAudioPlayer` |
| `src/components/layout/TopAudioPlayer.tsx` | Renderizar barra vazia quando web_radio desativado |

## Sem alterações em
- Banco de dados / migrações
- Rotas do App.tsx (já estão protegidas corretamente)
- Páginas de Publicidade e Monetização (funcionando)
