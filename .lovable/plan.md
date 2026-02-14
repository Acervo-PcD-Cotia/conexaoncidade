

# Plano: Nomes Comerciais, Midia Kit e Tooltips nos Formatos Publicitarios

## 1. Problemas Identificados

### Nomes comerciais inconsistentes
- `AdsChannelForm.tsx`: Falta o formato **"Destaque Horizontal" (728x90)** no `SLOT_OPTIONS`. Tambem usa nomes tecnicos internos (`home_top`, `home_banner`, `super_banner`) sem consolidacao.
- `CampaignsTutorial.tsx`: Nao menciona os formatos 10-15 (Login, Banner Intro, Destaque Flutuante, Alerta Full Saida). Apenas cita "Exit-Intent, Login Panel, Push, Newsletter" genericamente sem detalhar.
- `CycleSelectorCard.tsx`: Usa `CHANNEL_LABELS` local incompleto (falta `banner_intro` e `floating_ad`).

### Midia Kit inexistente
- Nao existe nenhum componente de Midia Kit para download. Precisa ser criado do zero com os 15 formatos organizados para anunciantes.

### Tooltips com preview inexistentes
- Os selects de slot no `AdsChannelForm` nao tem tooltips visuais. Apenas mostram `label (size)` como texto simples.

---

## 2. Alteracoes Propostas

### A. Corrigir nomes comerciais nos formularios

**Arquivo: `src/components/admin/campaigns/AdsChannelForm.tsx`**
- Adicionar "Destaque Horizontal" (728x90) ao `SLOT_OPTIONS` com value `leaderboard`
- Adicionar mapeamento no `SLOT_TO_FORMAT`
- Adicionar formato `'leaderboard'` ao `FORMAT_DIMENSIONS` no `AdImageUploader.tsx`
- Consolidar nomes: remover duplicatas (`home_top`, `home_banner`, `super_banner` viram opcoes mais claras)

SLOT_OPTIONS atualizado:
```text
leaderboard     | Destaque Horizontal        | 728x90
super_banner    | Mega Destaque              | 970x250
rectangle       | Destaque Inteligente       | 300x250
skyscraper      | Painel Vertical            | 300x600
popup           | Alerta Comercial           | 580x400
```

**Arquivo: `src/components/admin/AdImageUploader.tsx`**
- Adicionar formato `'leaderboard'` com dimensoes 728x90

**Arquivo: `src/components/admin/campaigns/CycleSelectorCard.tsx`**
- Adicionar `banner_intro` e `floating_ad` ao `CHANNEL_LABELS` local

### B. Atualizar Tutorial com todos os 15 formatos

**Arquivo: `src/pages/admin/campaigns/CampaignsTutorial.tsx`**
- Adicionar secao "Bloco 04 -- Login & Experiencia Inicial" detalhando formatos 10-12
- Adicionar secao "Bloco 05 -- Banners de Experiencia" detalhando formatos 13-15
- Adicionar tabela de referencia rapida com todos os 15 formatos organizados por bloco
- Atualizar os badges de canais no overview para incluir Banner Intro e Destaque Flutuante

### C. Criar pagina de Midia Kit para download

**Novo arquivo: `src/pages/admin/campaigns/MediaKit.tsx`**
- Pagina acessivel pelo painel administrativo
- Exibe todos os 15 formatos organizados por bloco (Ads, Publidoor, WebStories, Login, Experiencia)
- Cada formato mostra: nome comercial, dimensao, descricao, onde aparece no site
- Botao para gerar PDF do Midia Kit usando jsPDF (ja instalado)
- Badge colorido por categoria
- Preview visual proporcional de cada formato (retangulo colorido com as proporcoes corretas)

**Arquivo: `src/App.tsx`**
- Adicionar rota `/spah/painel/campaigns/media-kit`

**Arquivo: `src/components/admin/AdminSidebar.tsx`**
- Adicionar link "Midia Kit" na secao de monetizacao

### D. Adicionar tooltips com preview visual nos selects de slot

**Arquivo: `src/components/admin/campaigns/AdsChannelForm.tsx`**
- Substituir `SelectItem` simples por versao com tooltip
- Cada opcao mostra ao passar o mouse:
  - Preview visual proporcional (retangulo colorido com dimensoes)
  - Nome comercial em negrito
  - Dimensao tecnica
  - Descricao curta ("O que e")
  - Localizacao no site ("Onde aparece")
- Usar componentes `Tooltip`/`TooltipContent` do Radix ja instalado
- Adicionar um mini-preview inline no proprio item do select (retangulo proporcional pequeno ao lado do texto)

**Novo arquivo: `src/components/admin/campaigns/SlotPreviewTooltip.tsx`**
- Componente reutilizavel que renderiza o tooltip com preview
- Recebe: nome, dimensao, descricao, localizacao, cor do badge
- Renderiza retangulo proporcional (max 120px largura) + info textual

---

## 3. Dados dos tooltips por formato

| Formato | O que e | Onde aparece |
|---------|---------|--------------|
| Destaque Horizontal | Faixa horizontal de visibilidade continua | Topo da Home, matérias, categorias |
| Mega Destaque | Banner de grande impacto visual | Abaixo do menu, inicio da Home |
| Destaque Inteligente | Formato focado em conversão | Meio de matérias, sidebar |
| Painel Vertical | Formato vertical de alta exposição | Lateral da Home e matérias |
| Alerta Comercial | Banner modal de impacto imediato | Pop-up controlado por tempo/scroll |
| Banner Intro | Banner de entrada pos-carregamento | Primeira dobra da Home |
| Destaque Flutuante | Banner lateral fixo na tela | Lateral direita/esquerda, fixo ao scroll |
| Alerta Full Saida | Banner de exit-intent fullscreen | Ao tentar sair do site |

---

## 4. Arquivos a criar (2)
1. `src/pages/admin/campaigns/MediaKit.tsx`
2. `src/components/admin/campaigns/SlotPreviewTooltip.tsx`

## 5. Arquivos a editar (6)
1. `src/components/admin/campaigns/AdsChannelForm.tsx` -- adicionar Destaque Horizontal + tooltips
2. `src/components/admin/AdImageUploader.tsx` -- formato leaderboard
3. `src/components/admin/campaigns/CycleSelectorCard.tsx` -- labels completos
4. `src/pages/admin/campaigns/CampaignsTutorial.tsx` -- blocos 04-05 + tabela referencia
5. `src/App.tsx` -- rota media-kit
6. `src/components/admin/AdminSidebar.tsx` -- link Midia Kit

## 6. O que NAO sera alterado
- Logica de campanhas existente
- Banco de dados
- Formatos ja implementados (01-15)
- Componentes de exibicao publica

