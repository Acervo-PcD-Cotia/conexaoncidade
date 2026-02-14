

# Plano: Atualizar Tutorial + Corrigir Exibicao de Imagens da Campanha

## Parte A — Atualizar o Tutorial com Informacoes Faltantes

### A1. Secao "Ciclos de Distribuicao"
Adicionar uma nova secao completa ao tutorial (`CampaignsTutorial.tsx`) explicando:

- **O que sao Ciclos**: Rodadas de exibicao/envio dentro de uma campanha. Permitem dividir o periodo total em fases (ex: "Semana 1", "Fase de Lancamento", "Reforco Final").
- **Como criar um novo ciclo**: Clicar em "+ Novo Ciclo" na tela de edicao da campanha, preencher nome, datas de inicio/fim e selecionar os canais ativos para aquele ciclo.
- **Status dos ciclos**: Agendado, Ativo, Concluido, Cancelado.
- **Confirmacao obrigatoria**: Ciclos que incluem canais Push ou Newsletter exigem confirmacao manual antes de serem ativados (para evitar envios acidentais).
- **Caso de uso pratico**: Ex: Campanha de 30 dias dividida em 3 ciclos de 10 dias cada, com criativos diferentes por fase.

### A2. Secao "Tipos de Exibicao do Publidoor"
Adicionar explicacao detalhada de cada tipo:

| Tipo | Descricao |
|------|-----------|
| **Narrativo** | Historia envolvente sobre a marca. Usa frases sequenciais para contar uma narrativa emocional. Ideal para branding institucional. |
| **Contextual** | Conteudo relacionado ao contexto onde a tela esta instalada (ex: farmacia exibe saude, padaria exibe cafe). |
| **Geografico** | Baseado na localizacao fisica da tela. Exibe conteudo relevante para o bairro ou regiao. |
| **Editorial** | Estilo jornalistico. Simula uma materia ou noticia patrocinada, com tom informativo. |
| **Impacto Total** | Formato premium fullwidth. Ocupa toda a tela com maximo impacto visual. Ideal para lancamentos. |

### A3. Campos do Publidoor no Tutorial
Explicar os campos: Frase Principal, Frase Secundaria, Descricao e Imagem da Exibicao (300x250px).

---

## Parte B — Corrigir Exibicao das Imagens nos Ad Slots do Site

### Problema Identificado
A campanha "Institucional Fevereiro" tem o canal `ads` configurado com `slot_type: home_top`. Isso faz com que a imagem apareca APENAS no Super Banner do topo. Os demais slots (retangulo, arranha-ceu, pop-up, etc.) nao encontram nenhum asset porque o `slot_type` nao corresponde.

### Solucao
Alterar a logica do `fetchCampaign360Ad` em `useAdUnit.ts` para que, quando um `slot_type` especifico nao tiver match, o sistema ainda exiba o asset como fallback se nenhum outro anuncio estiver disponivel para aquele slot. Assim, a campanha "Institucional Fevereiro" aparecera em TODOS os slots vazios do site.

**Logica atualizada:**
1. Primeiro: buscar campanhas 360 cujo `slot_type` no config do canal `ads` corresponda exatamente ao slot solicitado.
2. Se nao encontrar: buscar qualquer campanha 360 ativa com canal `ads` habilitado (independente do slot_type) e usar o primeiro asset disponivel.

Isso garante que campanhas cadastradas aparecam em todo o site, preenchendo qualquer posicao vazia.

---

## Arquivos a Editar

1. **`src/pages/admin/campaigns/CampaignsTutorial.tsx`** — Adicionar 2 novas secoes (Ciclos + Publidoor tipos) entre as partes existentes.
2. **`src/hooks/useAdUnit.ts`** — Ajustar `fetchCampaign360Ad` para fallback global quando nao houver match exato de slot.

## Detalhes Tecnicos

### Tutorial (CampaignsTutorial.tsx)
- Inserir nova secao "Parte 2B — Ciclos de Distribuicao" apos a Parte 2 atual, com 4 StepCards detalhando criacao, status, confirmacao e exemplos.
- Inserir subsecao dentro da Parte 1 (Passo 5 - Canais) expandindo o bloco do Publidoor com uma tabela visual dos 5 tipos de exibicao.
- Renumerar as partes existentes (Parte 2 vira Parte 3, Parte 3 vira Parte 4).

### Fallback de Ads (useAdUnit.ts)
- Na funcao `fetchCampaign360Ad`, apos o loop que busca match exato de `slot_type`, adicionar um segundo loop que ignora o filtro de slot e retorna o primeiro asset de campanha 360 disponivel.
- Isso funciona como "preenchimento automatico" — qualquer slot vazio mostra a campanha de maior prioridade.

