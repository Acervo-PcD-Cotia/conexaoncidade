
# Correcao: Canais de Exibicao nao funcionam ao clicar

## Problema Identificado

O componente `ChannelSelector.tsx` possui um **bug de duplo-toggle** que impede a selecao de qualquer canal. Quando o usuario clica em um canal (Ads, Publidoor, WebStories, etc.), dois event handlers disparam simultaneamente:

1. O `onCheckedChange` do `Checkbox` chama `toggleChannel()` -- adiciona o canal
2. O `onClick` do `div` pai (que envolve o Checkbox) tambem chama `toggleChannel()` -- remove o canal imediatamente

Resultado: o canal e adicionado e removido no mesmo clique, parecendo que nada acontece. Nenhum canal pode ser selecionado, tornando impossivel salvar uma campanha com canais configurados.

Este e o unico motivo pelo qual todos os 7 canais (Ads, Publidoor, WebStories, Exit-Intent, Painel de Login, Push, Newsletter) "nao estao funcionando".

## Solucao

Modificar o `ChannelSelector.tsx` para que o toggle aconteca apenas uma vez por clique:

- **Remover** o `onCheckedChange` do componente `Checkbox` (deixar ele apenas como indicador visual)
- **Manter** o `onClick` no `div` pai como unico responsavel pelo toggle
- Adicionar `e.stopPropagation()` para evitar propagacao indesejada entre o Checkbox e o div

## Arquivo a Modificar

`src/components/admin/campaigns/ChannelSelector.tsx`

### Mudanca Especifica (linhas 283-311)

Alterar o bloco do Checkbox de:
```text
<Checkbox
  checked={isSelected(channel.type)}
  onCheckedChange={() => toggleChannel(channel.type)}
  className="mt-0.5"
/>
```

Para:
```text
<Checkbox
  checked={isSelected(channel.type)}
  className="mt-0.5 pointer-events-none"
/>
```

A propriedade `pointer-events-none` no Checkbox garante que o clique seja capturado apenas pelo `div` pai, eliminando o duplo-toggle. O Checkbox continua mostrando o estado visual correto (checked/unchecked).

## Resultado Esperado

- Clicar em qualquer canal (Ads, Publidoor, WebStories, Exit-Intent, Login Panel, Push, Newsletter) seleciona e expande o formulario de configuracao do canal
- Clicar novamente desmarca e fecha o formulario
- Salvar a campanha com canais selecionados grava corretamente os registros na tabela `campaign_channels`
- O card da campanha na listagem exibe os badges dos canais configurados em vez de "Nenhum canal configurado"
