

# Plano: Reduzir Altura do Header para Melhorar Visibilidade do Super Banner

## Problema
O header do site ocupa muito espaco vertical, cobrindo parcialmente o Super Banner. A area marcada em amarelo no PDF inclui o logo grande (ate 150px), a barra de servicos e a navegacao de categorias.

## Alteracoes Propostas

### Arquivo: `src/components/layout/Header.tsx`

1. **Reduzir tamanho do logo**
   - De: `h-[80px] sm:h-[120px] md:h-[150px]`
   - Para: `h-[50px] sm:h-[60px] md:h-[70px]`
   - Reduzir `max-w` de 450px para 300px

2. **Reduzir padding do header principal**
   - De: `py-4`
   - Para: `py-2`

3. **Reduzir padding da barra de servicos (chips)**
   - De: `py-2` com `px-4 py-2` nos chips
   - Para: `py-1` com `px-3 py-1` nos chips e texto `text-xs`

4. **Reduzir padding da navegacao de categorias**
   - De: `py-2.5` nos links
   - Para: `py-1.5` nos links

### Arquivo: `src/components/home/MarketDataBar.tsx`

5. **Reduzir padding da barra de mercado**
   - De: `py-2`
   - Para: `py-1`

## Resultado Esperado
O header ficara aproximadamente 40-50% mais compacto, liberando espaco para que o Super Banner fique totalmente visivel sem necessidade de scroll.

## O Que NAO Sera Alterado
- Funcionalidade dos menus e links
- Responsividade mobile
- Estrutura de navegacao
- Ordem dos elementos

