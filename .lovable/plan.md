
# Reestruturacao Completa - Campanhas 360

## Resumo Executivo

Este plano implementa 7 melhorias estruturais no modulo de Campanhas Unificadas: campanha demo automatica, ciclos explicados no tutorial, formatos numerados 1-15 no cadastro, guia rapido embutido, tutorial com busca e secao de upload, prevencao de duplicacao de criativos, e ordenacao consistente em todo o sistema.

---

## 1. Campanha Demo Automatica

**O que muda:** Ao abrir a listagem de campanhas, se nao existir campanha com nome contendo "MODELO", o sistema cria automaticamente uma campanha demo pausada.

**Onde:** `CampaignsUnified.tsx`

- Adicionar hook `useEffect` que verifica se ja existe campanha demo
- Se nao existir, chamar `useCreateCampaignUnified` com dados pre-definidos:
  - Nome: "MODELO -- Campanha Unificada (Exemplo)"
  - Anunciante: "Anunciante Demo (Exemplo)"
  - Status: "paused", Prioridade: 100
  - Todos os 9 canais ativados com textos placeholder
- No `CampaignCard.tsx`, adicionar badge "EXEMPLO" quando o nome contem "MODELO"

---

## 2. Guia Rapido no Cadastro (Toggle)

**O que muda:** Card colapsavel no topo do formulario de campanha com checklist automatico.

**Onde:** `CampaignForm.tsx`

- Adicionar estado `showGuide` (default: true para nova campanha, false para edicao)
- Card com titulo "Guia Rapido -- Como cadastrar" e botao Exibir/Ocultar
- Conteudo: 6 passos curtos + checklist automatico que valida em tempo real:
  - Nome e anunciante preenchidos
  - Periodo definido
  - Pelo menos 1 canal selecionado
  - Criativos vinculados
  - CTA com HTTPS valido
  - Ciclo criado (se status diferente de pausada)

---

## 3. Formatos Numerados 1-15 no Cadastro

**O que muda:** O `ChannelSelector` passa a exibir os 15 formatos oficiais como lista numerada com dimensoes e localizacao, na mesma ordem do tutorial.

**Onde:** Novo componente `FormatReferenceList.tsx` + integracao no `CampaignForm.tsx`

- Botao "Ver 15 Formatos Oficiais" que abre Dialog/modal
- Tabela identica a do tutorial (consumindo `AD_SLOTS` de `adSlots.ts`), com colunas: #, Bloco, Nome Comercial, Dimensao, Onde Aparece
- Cada canal no `ChannelSelector` passa a mostrar subtexto com dimensoes dos formatos correspondentes (ex: "Ads: 728x90, 970x250, 300x250, 300x600, 580x400")

---

## 4. Tutorial - Busca e Novas Secoes

**O que muda:** Campo de busca no topo do tutorial + secoes sobre Upload de Criativos e Ciclos detalhados.

**Onde:** `CampaignsTutorial.tsx`

- **Campo de busca:** Input no topo que filtra o conteudo das tabs por texto
- **Secao "Upload de Criativos"** na tab "Passo a Passo":
  - Quando usar (batch) vs quando nao usar (upload individual no bloco)
  - Passo a passo: arrastar imagens, auto-atribuicao, revisao, enviar
  - Aviso sobre duplicacao
- **Secao "Ciclos de Distribuicao" expandida** na tab "Passo a Passo":
  - O que sao ciclos (definicao)
  - Quando usar, exemplos praticos
  - Como criar o primeiro ciclo
  - Erros comuns (ciclo sem formato, sem periodo)

---

## 5. Prevencao de Duplicacao de Criativos

**O que muda:** Ao enviar criativo via batch que ja existe para o mesmo format_key, o sistema pergunta se quer substituir.

**Onde:** `BatchAssetUploader.tsx` + `CampaignForm.tsx`

- Antes de chamar `onAssetsUploaded`, verificar se ja existe asset ativo para o mesmo `format_key` no estado do formulario
- Se existir, mostrar Dialog de confirmacao: "Ja existe criativo para Mega Destaque (970x250). Substituir ou manter ambos?"
- Default: Substituir (atualiza o asset existente)
- Opcao: Manter ambos (adiciona como versao extra)

---

## 6. Ordenacao Consistente 1-15

**O que muda:** Chips de canais no CampaignCard e resumo de criativos seguem ordem `seq` do `AD_SLOTS`.

**Onde:** `CampaignCard.tsx`, `CampaignForm.tsx` (secao Active Assets Summary)

- Ordenar `enabledChannels` no card usando a ordem dos blocos de `AD_SLOTS`
- No resumo de criativos ativos, ordenar pela sequencia oficial (1-15)

---

## 7. CycleSelectorCard no Tutorial

**O que muda:** Secao de ciclos no tutorial ganha mais detalhes sobre campos, regras e wizard.

**Onde:** `CampaignsTutorial.tsx` (tab "Passo a Passo", secao Ciclos existente)

- Expandir card de Ciclos para incluir: campos do ciclo (nome, inicio/fim, frequencia, cap, canais/formatos, observacoes)
- Adicionar exemplos: "Ciclo 01 -- Semana 1", "Ciclo 02 -- Reforco"
- Alertas: "Sem ciclos = campanha nao agenda exibicao"

---

## Detalhes Tecnicos

### Arquivos a Criar
| Arquivo | Descricao |
|---------|-----------|
| `src/components/admin/campaigns/FormatReferenceDialog.tsx` | Modal com tabela dos 15 formatos |
| `src/components/admin/campaigns/QuickGuideCard.tsx` | Card colapsavel do guia rapido |

### Arquivos a Modificar
| Arquivo | Mudanca |
|---------|---------|
| `CampaignsUnified.tsx` | Logica de criacao automatica da campanha demo |
| `CampaignCard.tsx` | Badge "EXEMPLO", ordenacao de chips |
| `CampaignForm.tsx` | Integrar QuickGuideCard + FormatReferenceDialog + ordenacao de assets |
| `CampaignsTutorial.tsx` | Campo de busca, secoes Upload e Ciclos expandidas |
| `BatchAssetUploader.tsx` | Verificacao de duplicacao antes do upload |
| `CampaignEditor.tsx` | Passar `existingAssets` para CampaignForm para verificacao de duplicacao |

### Dependencias de Dados
- Todos os formatos ja estao definidos em `adSlots.ts` (fonte unica de verdade)
- Ciclos ja tem infraestrutura completa em `useCampaignCycles.ts` e `campaign_cycles` no banco
- Nenhuma alteracao de banco de dados necessaria

### Riscos e Mitigacoes
- **Campanha demo duplicada:** Usar verificacao por nome antes de criar; marcar com flag no campo description
- **Performance do filtro de busca no tutorial:** Filtro client-side simples, sem impacto
- **Duplicacao de criativos:** Verificacao no frontend apenas (estado do formulario), nao bloqueia no backend
