# Guia Atualizado do Portal Conexão na Cidade — Guia Comercial

> Versão 1.0 • Fevereiro 2026 • Baseado na análise do modelo EmCotia

---

## 1. Resumo Executivo

O Guia Comercial do Portal Conexão na Cidade é um **hub regional de descoberta de negócios**, projetado para conectar empresas locais a clientes que buscam serviços por intenção ("serviço + bairro/cidade"). Inspirado no modelo EmCotia — que monetiza visibilidade local com páginas indexáveis por empresa, blog SEO orientado a busca local, e planos escalonados — o Conexão na Cidade evolui esse modelo com: mapa interativo Leaflet, formulário de lead integrado, painel de estatísticas para o empresário, FAQ estruturada para IA/Google, e schema.org robusto. O objetivo é ser a **primeira resposta do Google** quando alguém busca "serviço em [cidade/bairro]" na região atendida pelo portal.

---

## 2. Mapa de Funcionalidades (EmCotia → Conexão na Cidade)

| Funcionalidade EmCotia | Adaptação no Conexão | Prioridade | SEO/Conversão |
|---|---|---|---|
| Página dedicada por empresa com nome + categoria + cidade | ✅ Já existe (`BusinessDetailPage`). Melhorar: incluir FAQ e "Regiões atendidas" como blocos obrigatórios | Alta | URL `/guia/empresa/{slug}` indexável; schema.org LocalBusiness |
| Categorias como páginas-pilar (`/tipo-empresa/[slug]`) | ✅ Já existe (`GuiaCategoriaPage`). Melhorar: adicionar conteúdo editorial (H2 "O que é", listagem + mapa) | Alta | Cada categoria vira landing page orgânica |
| Blog com artigos "quanto custa", "como escolher" em [cidade] | Criar seção de blog associada ao Guia com interlinking automático (blog → categoria → empresa) | Alta | Captura long-tail; CTA para cadastro integrado |
| "Negócios em Destaque" (vitrine na home) | ✅ Já existe (grid com badge Premium). Melhorar: carrossel rotativo com planos Pro/Premium | Média | Incentiva upgrade; aumenta CTR |
| Planos escalonados (free → pago com mais benefícios) | ✅ Já existe (`GuiaPlanosPage` com Gratuito/Pro/Premium). Melhorar: adicionar benefício "sem anúncios de terceiros" no Premium | Média | Diferencial de monetização |
| WhatsApp como CTA principal | ✅ Já existe (botão proeminente). Melhorar: tracking de cliques já implementado | Alta | Conversão direta; 2 cliques máx. |
| Chat/atendimento online | Recomenda-se implementar: widget WhatsApp flutuante na home do Guia com mensagem pré-preenchida | Baixa | Reduz fricção para novos anunciantes |
| Contadores de visualizações por empresa | ✅ Já existe (`view_count` + `useIncrementBusinessViews`). Exibir na página como prova social | Média | Credibilidade; incentivo ao anunciante |
| Galeria de fotos | ✅ Já existe (grid de imagens). Melhorar: lightbox/modal para visualização ampliada | Baixa | Engajamento visual |
| Formulário de lead | ✅ Já existe (`useCreateLead`). Funcional e integrado | Alta | Conversão direta para o anunciante |
| Breadcrumbs estruturados | ✅ Já existe na `BusinessDetailPage`. Adicionar também nas categorias | Média | SEO de navegação |
| FAQ orientada a busca local | Implementar: campo `faq` (JSON) no cadastro, renderizado com schema.org FAQPage | Alta | Rich snippets no Google |

---

## 3. Guia Atualizado do Portal Conexão na Cidade

### 3.1 Visão Geral e Para Quem É

O **Guia Comercial** é o diretório de negócios do Portal Conexão na Cidade. Ele atende:

- **Empresários e prestadores de serviço** que querem ser encontrados por clientes da região
- **Consumidores** que buscam serviços confiáveis por categoria e localização
- **Profissionais autônomos** que precisam de uma vitrine digital sem custo inicial

**Proposta de valor**: Página própria, indexável pelo Google, com mapa, formulário de contato, WhatsApp direto e estatísticas de visualização — tudo integrado ao maior portal de notícias da região.

---

### 3.2 Como Funciona (Passo a Passo)

1. **Acesse** `/guia/cadastrar` e faça login (ou crie uma conta)
2. **Preencha** o formulário em 4 etapas: Identificação → Localização → Contato → Detalhes
3. **Aguarde aprovação** (equipe verifica dados básicos)
4. **Sua página fica ativa** em `/guia/empresa/{seu-slug}`
5. **Acompanhe resultados** no Painel do Empresário (`/guia/anunciante`)
6. **Faça upgrade** a qualquer momento para mais visibilidade

---

### 3.3 Como Cadastrar um Negócio (Checklist)

Antes de iniciar, tenha em mãos:

- [ ] Nome oficial ou fantasia do negócio
- [ ] Categoria principal (ex.: Restaurante, Advocacia, Salão de Beleza)
- [ ] Cidade e bairros de atuação
- [ ] Número de WhatsApp comercial
- [ ] Descrição curta (até 160 caracteres) — aparece nas listagens
- [ ] Descrição completa (com subtítulos H2/H3) — aparece na página da empresa
- [ ] Tags de serviço (ex.: "limpeza de sofá", "corte feminino", "pizza artesanal")
- [ ] Logo em alta resolução (mín. 400×400px, formato quadrado)
- [ ] Foto de capa (mín. 1200×400px, formato paisagem)
- [ ] Até 3 fotos para galeria (plano Gratuito) ou mais (planos pagos)
- [ ] Horários de funcionamento por dia da semana

---

### 3.4 Padrão da Página da Empresa (Template de Blocos)

Toda página de empresa renderiza os seguintes blocos, nesta ordem:

| Bloco | Obrigatório | Plano Mínimo |
|---|---|---|
| 1. Barra de cor da categoria | Sim | Gratuito |
| 2. Breadcrumb (Home > Guia > Categoria > Empresa) | Sim | Gratuito |
| 3. Hero (foto de capa + gradient overlay) | Sim (fallback gradiente) | Gratuito |
| 4. Logo + Nome + Selo Verificado + Badge de Plano | Sim | Gratuito |
| 5. Tagline / Descrição curta | Sim | Gratuito |
| 6. Categoria + Avaliação + Cidade + Status (aberto/fechado) | Sim | Gratuito |
| 7. Barra de contato rápido (WhatsApp, Ligar, Como chegar) | Sim | Gratuito |
| 8. Abas: Sobre · Horários · Serviços · Avaliações · Promoções | Sim | Gratuito |
| 9. Descrição completa (com HTML sanitizado) | Recomendado | Gratuito |
| 10. Galeria de fotos | Recomendado | Gratuito (3) / Pro (10) / Premium (∞) |
| 11. Mapa interativo (Leaflet) | Automático se lat/lng preenchidos | Gratuito |
| 12. Regiões atendidas (lista de bairros/cidades) | Recomendado | Gratuito |
| 13. FAQ do negócio (schema FAQPage) | Recomendado | Gratuito |
| 14. Sidebar: Formulário de lead ("Solicitar orçamento") | Sim | Gratuito |
| 15. Sidebar: Card de contato (WhatsApp, telefone, site, redes) | Sim | Gratuito |
| 16. Sidebar: Horário resumido | Sim | Gratuito |
| 17. Tags de serviço | Recomendado | Gratuito |
| 18. Schema.org JSON-LD (LocalBusiness) | Automático | Gratuito |
| 19. Sem anúncios de terceiros na página | — | Premium |

---

### 3.5 Categorias e Tags (Regras)

**Categorias** são pré-definidas pelo portal (ex.: Restaurantes, Advocacia, Saúde, Beleza, Construção, Automotivo, Educação, Pets, Tecnologia, etc.). Cada categoria tem:

- Slug indexável: `/guia/categoria/{slug}`
- Ícone e cor associados
- Página-pilar com conteúdo editorial

**Regras de categorias**:
- Cada empresa tem **1 categoria principal** (obrigatória)
- Subcategorias opcionais podem ser adicionadas como tags
- Novas categorias só são criadas pela equipe editorial

**Tags de serviço**:
- Formato livre, separadas por vírgula
- Padronização: minúsculas, sem acentos desnecessários, termos de busca real
- Exemplos bons: `limpeza de sofá`, `corte masculino`, `pizza artesanal`
- Exemplos ruins: `melhor da cidade`, `promoção`, `barato`
- Limite: 15 tags por empresa

---

### 3.6 Conteúdo / Blog (Regras Editoriais)

Artigos do blog do Guia seguem a metodologia SEO Genome do portal:

**Tipos de artigo recomendados**:
- "Como escolher [serviço] em [cidade]"
- "Quanto custa [serviço] em [cidade/bairro]"
- "Melhores [categoria] em [cidade]" (lista com links para empresas cadastradas)
- "[Serviço] em [bairro]: o que saber antes de contratar"

**Regras**:
- Título: inclui **serviço + localização** (ex.: "Desentupidora em Cotia: preços e como escolher")
- H2s formatados como perguntas descritivas
- Primeiro parágrafo (lide) em **negrito**
- Interligação obrigatória: artigo → categoria → páginas de empresas
- Autor fixo: "Redação Conexão na Cidade"
- CTA ao final: "Encontre profissionais de [categoria] no Guia Comercial" com link para a categoria

---

### 3.7 Destaques e Vitrines (Regras)

| Tipo de destaque | Onde aparece | Quem pode |
|---|---|---|
| Carrossel "Em Destaque" | Home do Guia (`/guia`) | Premium |
| Badge "⭐ Premium" no card | Listagens e buscas | Premium |
| Badge "Pro" no card | Listagens e buscas | Pro |
| Prioridade na ordenação "Relevância" | Resultados de busca | Pro e Premium |
| Selo "Verificado" (✓) | Card e página da empresa | Pro e Premium (após verificação) |
| Integração com notícias (menção em matérias) | Artigos do portal | Premium |

---

### 3.8 Planos e Upgrades

| Recurso | Gratuito | Profissional (R$ XX,XX/mês) | Premium (R$ XX,XX/mês) |
|---|---|---|---|
| Listagem no Guia | ✅ | ✅ | ✅ |
| Perfil completo (página dedicada) | ✅ | ✅ | ✅ |
| Receber leads (formulário) | ✅ | ✅ | ✅ |
| WhatsApp direto | ✅ | ✅ | ✅ |
| Fotos no perfil | 3 fotos | 10 fotos | Ilimitado |
| Foto de capa personalizada | ❌ | ✅ | ✅ |
| Destaque em buscas | ❌ | ✅ | ✅ |
| Selo verificado | ❌ | ✅ | ✅ |
| Estatísticas avançadas (gráficos) | ❌ | ✅ | ✅ |
| Responder avaliações | ❌ | ✅ | ✅ |
| Cadastrar serviços com preço | 3 serviços | 10 serviços | Ilimitado |
| Promoções e cupons | ❌ | ✅ | ✅ |
| Destaque na home do Guia | ❌ | ❌ | ✅ |
| Banner na home e páginas | ❌ | ❌ | ✅ |
| Sem anúncios de terceiros na página | ❌ | ❌ | ✅ |
| Integração com notícias | ❌ | ❌ | ✅ |
| Suporte prioritário | ❌ | ❌ | ✅ |
| Consultoria SEO local | ❌ | ❌ | ✅ |

> **Nota**: preços são definidos pela equipe comercial. Os valores acima são placeholders.

---

### 3.9 Boas Práticas de SEO Local (Checklist)

- [ ] **Título da página** contém `{nome} em {cidade} | Guia Comercial` (< 60 caracteres)
- [ ] **Meta description** contém serviço + localização (< 160 caracteres)
- [ ] **H1 único** = nome da empresa
- [ ] **Descrição curta** na primeira dobra com palavras-chave de serviço + bairro
- [ ] **Tags de serviço** refletem termos reais de busca
- [ ] **FAQ** com 3-5 perguntas usando "serviço em [cidade]" no texto
- [ ] **Schema.org** LocalBusiness com `geo`, `openingHours`, `aggregateRating`, `sameAs`
- [ ] **Breadcrumbs** estruturados (Home > Guia > Categoria > Empresa)
- [ ] **Imagens** com `alt` descritivo: "Foto de [serviço] em [cidade] - [nome da empresa]"
- [ ] **Canonical** apontando para URL limpa
- [ ] **Lazy loading** em todas as imagens
- [ ] **Interlinks**: link da página da empresa para a categoria; link do blog para a empresa
- [ ] **Google Maps URL** preenchida para botão "Como chegar"
- [ ] **Lat/Lng** preenchidos para exibição do mapa Leaflet

---

### 3.10 Padrões de Qualidade (O que Reprova / Ajustes)

**Reprovação automática**:
- Nome com caracteres especiais ou CAPS LOCK total
- Descrição copiada de outro site (plágio)
- WhatsApp inválido ou inexistente
- Categoria inexistente ou genérica demais
- Imagens com marca d'água de outros portais

**Ajustes solicitados antes de publicar**:
- Descrição curta maior que 160 caracteres → solicitar resumo
- Nenhuma tag de serviço → solicitar pelo menos 3
- Cidade não informada → obrigatória
- Logo em baixa resolução (< 200×200px) → solicitar imagem melhor

**Boas práticas aceitas**:
- Uso de emojis moderado na descrição
- Links para redes sociais próprias
- Menção a bairros específicos de atuação

---

### 3.11 Perguntas Frequentes (FAQ)

**1. O cadastro é realmente gratuito?**
Sim. O plano Gratuito inclui página dedicada, listagem no guia, WhatsApp direto e formulário de lead. Sem prazo de validade.

**2. Quanto tempo leva para minha empresa aparecer?**
Após o cadastro, a equipe verifica os dados em até 24 horas úteis. Após aprovação, sua página fica ativa imediatamente.

**3. Posso cadastrar mais de uma empresa?**
Sim. Cada empresa terá sua própria página e poderá ter um plano diferente.

**4. Como funciona o formulário de lead?**
Clientes interessados preenchem nome, telefone e mensagem diretamente na sua página. Você recebe os leads no Painel do Empresário.

**5. Qual a diferença entre o plano Gratuito e o Profissional?**
O Profissional oferece mais fotos, destaque em buscas, selo verificado, estatísticas avançadas e a possibilidade de cadastrar até 10 serviços com preço.

**6. O Premium remove anúncios da minha página?**
Sim. No plano Premium, sua página não exibe banners de terceiros, garantindo foco total no seu negócio.

**7. Como faço para aparecer no "Em Destaque" da home?**
O destaque na home é exclusivo do plano Premium. Contrate pelo Painel do Empresário ou fale conosco pelo WhatsApp.

**8. Posso editar minha página depois de publicada?**
Sim, a qualquer momento pelo Painel do Empresário (`/guia/anunciante`).

**9. Como os clientes me encontram?**
Pela busca interna do portal (nome, categoria, cidade), pelo Google (sua página é indexada com SEO otimizado) e por indicação via artigos do blog.

**10. Meus dados estão seguros?**
Sim. Dados de contato são exibidos apenas na sua página pública. Leads ficam protegidos no seu painel privado.

**11. Posso cancelar meu plano a qualquer momento?**
Sim. Ao cancelar, seu perfil retorna ao plano Gratuito sem perder dados.

**12. Como recebo avaliações?**
Clientes logados no portal podem avaliar seu negócio com nota e comentário. Nos planos Pro e Premium, você pode responder publicamente.

---

## 4. Templates Prontos

### 4.1 Template de Descrição Curta (até 160 caracteres)

```
[Serviço principal] em [Cidade/Bairro]. [Diferencial]. Atendimento via WhatsApp. [Complemento opcional].
```

**Exemplos**:
- "Desentupidora 24h em Cotia e região. Orçamento grátis. Atendimento via WhatsApp. Desde 2010."
- "Salão de beleza em Caucaia do Alto. Corte, coloração e tratamentos. Agende pelo WhatsApp."
- "Pizzaria artesanal no Centro de Cotia. Delivery e salão. Peça pelo WhatsApp."

---

### 4.2 Template de Descrição Completa (com H2/H3)

```html
<p><strong>[Nome da empresa] é referência em [serviço] em [cidade/bairro], oferecendo [principal benefício] para [público-alvo].</strong></p>

<h2>O que oferecemos?</h2>
<p>Descrição detalhada dos serviços, com menção a bairros e cidades atendidas. Incluir diferenciais como tempo de mercado, certificações ou equipamentos.</p>

<h2>Onde atuamos?</h2>
<p>Atendemos [cidade] e região, incluindo os bairros: [lista de bairros]. Também realizamos atendimento em [cidades vizinhas].</p>

<h2>Por que nos escolher?</h2>
<ul>
  <li>Diferencial 1 (ex.: Atendimento 24 horas)</li>
  <li>Diferencial 2 (ex.: Orçamento sem compromisso)</li>
  <li>Diferencial 3 (ex.: Equipe certificada)</li>
</ul>

<h2>Como entrar em contato?</h2>
<p>Fale conosco pelo WhatsApp para um atendimento rápido e personalizado. Também atendemos por telefone e e-mail.</p>
```

---

### 4.3 Template de FAQ (5 Perguntas)

```
1. Qual o horário de atendimento da [nome]?
   Funcionamos de [dia] a [dia], das [hora] às [hora]. [Complemento: "Aos sábados com horário reduzido."]

2. [Nome] atende em quais bairros de [cidade]?
   Atendemos toda [cidade], com foco nos bairros [lista]. Também atendemos [cidades vizinhas].

3. Como solicitar um orçamento?
   Basta clicar no botão "WhatsApp" nesta página ou preencher o formulário de contato. Respondemos em até [X] horas.

4. Quais formas de pagamento são aceitas?
   Aceitamos [Pix, cartão, boleto, dinheiro]. Parcelamos em até [X]x no cartão.

5. A [nome] possui garantia nos serviços?
   Sim, oferecemos garantia de [período] em todos os serviços realizados.
```

---

### 4.4 Template de Post de Blog Local (Estrutura)

```markdown
# [Serviço] em [Cidade]: [Complemento informativo]

**Chapéu**: `[CIDADE] | [CATEGORIA]`

**[Lide em negrito com o resumo do artigo, mencionando serviço + cidade + benefício principal. Máximo 2 frases.]**

## O que é [serviço] e por que é importante em [cidade]?
[Parágrafo explicativo contextualizado à região]

## Como escolher [serviço] em [cidade/bairro]?
[Lista ou parágrafos com critérios de escolha]

## Quanto custa [serviço] em [cidade]?
[Faixa de preço com ressalva de que valores podem variar. NÃO inventar números.]

## Onde encontrar [serviço] em [cidade]?
[Menção ao Guia Comercial com links para a categoria e/ou empresas específicas]

> **Encontre profissionais de [categoria] verificados no [Guia Comercial do Conexão na Cidade](/guia/categoria/[slug]).**

---
*Autor: Redação Conexão na Cidade*
```

---

## 5. Checklist Final de Publicação

Antes de ativar/aprovar qualquer empresa no Guia, verificar:

- [ ] 1. Nome da empresa preenchido corretamente (sem CAPS LOCK, sem caracteres estranhos)
- [ ] 2. Categoria principal selecionada e coerente com o negócio
- [ ] 3. Cidade preenchida
- [ ] 4. WhatsApp válido e funcional
- [ ] 5. Descrição curta com até 160 caracteres, contendo serviço + localização
- [ ] 6. Descrição completa com pelo menos 1 parágrafo (recomendado: com H2s)
- [ ] 7. Pelo menos 3 tags de serviço relevantes
- [ ] 8. Logo em resolução aceitável (≥ 200×200px)
- [ ] 9. Foto de capa (se plano permitir) sem marca d'água de terceiros
- [ ] 10. Horários de funcionamento preenchidos
- [ ] 11. Slug gerado corretamente (sem caracteres especiais)
- [ ] 12. Schema.org LocalBusiness renderizando sem erros
- [ ] 13. Breadcrumb funcional (Home > Guia > Categoria > Empresa)
- [ ] 14. Botão WhatsApp abrindo com mensagem pré-preenchida
- [ ] 15. Formulário de lead funcional e salvando no banco
- [ ] 16. Mapa exibindo corretamente (se lat/lng preenchidos)
- [ ] 17. Página sem erros de console (verificar DevTools)
- [ ] 18. Meta title e description gerados automaticamente
- [ ] 19. Imagens com lazy loading e alt text
- [ ] 20. Empresa visível na listagem da categoria correta

---

## Apêndice: Melhorias Recomendadas (Roadmap)

| Melhoria | Impacto | Esforço | Status |
|---|---|---|---|
| Campo FAQ (JSON) no cadastro com schema FAQPage | Alto (rich snippets) | Médio | Recomendado |
| Lightbox para galeria de fotos | Baixo | Baixo | Recomendado |
| Widget WhatsApp flutuante na home do Guia | Médio (conversão anunciantes) | Baixo | Recomendado |
| Blog integrado ao Guia com interlinking automático | Alto (SEO long-tail) | Alto | Recomendado |
| Exibir `view_count` público na página da empresa | Médio (prova social) | Baixo | Recomendado |
| Página-pilar por categoria com conteúdo editorial | Alto (SEO) | Médio | Recomendado |
| "Sem anúncios" como benefício visível do Premium | Médio (monetização) | Baixo | Recomendado |
| Comparador de empresas da mesma categoria | Baixo | Alto | Futuro |
| Integração com Google Business Profile (importação) | Alto | Alto | Futuro |
