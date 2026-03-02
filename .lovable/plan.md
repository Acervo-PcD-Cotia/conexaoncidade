
## Auto-save de Noticias no Relatorio TXT

### Problema
Atualmente, as noticias so sao salvas quando o usuario clica manualmente em "Salvar". Se ele navegar para outra pagina antes disso, perde todo o trabalho.

### Solucao
Implementar auto-save que salva automaticamente no banco de dados sempre que o usuario adiciona, edita ou remove uma noticia.

### Como vai funcionar

1. **Auto-save no `handleAdd`, `handleRemove` e imports (TXT/JSON)**: Apos cada alteracao na lista de `items`, disparar um save automatico no banco.

2. **Debounced auto-save via `useEffect`**: Monitorar mudancas em `items` e `reportTitle`. Quando houver alteracao, aguardar 2 segundos de inatividade e salvar automaticamente. Isso cobre todos os cenarios (adicionar, editar, remover, importar).

3. **Indicador visual**: Mostrar um pequeno texto como "Salvando..." ou "Salvo automaticamente" ao lado do botao Salvar, para o usuario saber que nao vai perder o trabalho.

4. **Criacao automatica do rascunho**: Se nao houver um `currentReportId`, o auto-save cria um novo registro no banco com o titulo atual (mesmo "Sem titulo"). Nas proximas alteracoes, apenas atualiza o registro existente.

### Detalhes tecnicos

**Arquivo modificado**: `src/pages/admin/RelatorioTXT.tsx`

- Adicionar um `useEffect` com debounce de 2 segundos que observa `items` e `reportTitle`
- Dentro do effect, chamar uma funcao `autoSave()` que:
  - Verifica se ha itens (se `items.length === 0`, nao salva)
  - Obtem o usuario logado
  - Se `currentReportId` existe, faz `update`
  - Se nao, faz `insert` e atualiza `currentReportId`
- Adicionar estado `autoSaveStatus` com valores: `idle`, `saving`, `saved`, `error`
- Exibir o status ao lado do botao Salvar (ex: "Salvo automaticamente as 10:08")
- O botao "Novo" continua limpando tudo e resetando o `currentReportId`
- O `handleNewReport` cria um novo rascunho limpo
