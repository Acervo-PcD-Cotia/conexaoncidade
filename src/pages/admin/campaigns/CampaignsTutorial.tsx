import { useNavigate } from 'react-router-dom';
import { campaignRoutes } from '@/lib/campaignRoutes';
import { ArrowLeft, Plus, Pencil, Settings, Eye, BarChart3, Image, Layers, Monitor, Megaphone, Smartphone, BookOpen, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Calendar, Send, MapPin, FileText, Maximize, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function StepCard({ step, title, icon: Icon, children }: { step: number; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{step}</span>
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

function TipBox({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' }) {
  const isWarning = variant === 'warning';
  return (
    <div className={`flex gap-3 p-3 rounded-lg text-sm ${isWarning ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/5 border border-primary/20'}`}>
      {isWarning ? <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

function ChannelBadge({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <Badge variant="secondary" className="gap-1.5 py-1 px-2.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}

export default function CampaignsTutorial() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(campaignRoutes.unified())}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Tutorial — Campanhas Unificadas
          </h1>
          <p className="text-muted-foreground">
            Aprenda a cadastrar, editar e gerenciar campanhas multi-canal (Ads, Publidoor, WebStories e mais)
          </p>
        </div>
      </div>

      {/* Overview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold">O que são Campanhas Unificadas?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As <strong className="text-foreground">Campanhas Unificadas (360°)</strong> permitem gerenciar uma campanha publicitária em múltiplos canais simultaneamente a partir de um único cadastro. Em vez de configurar banners, publidoor e stories separadamente, você cria uma campanha central que distribui automaticamente os criativos para todos os canais selecionados.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <ChannelBadge label="Ads (Banners)" icon={Monitor} />
            <ChannelBadge label="Publidoor" icon={Megaphone} />
            <ChannelBadge label="WebStories" icon={Smartphone} />
            <ChannelBadge label="Push" icon={Megaphone} />
            <ChannelBadge label="Newsletter" icon={Megaphone} />
            <ChannelBadge label="Exit-Intent" icon={Layers} />
            <ChannelBadge label="Login Panel" icon={Monitor} />
            <ChannelBadge label="Banner Intro" icon={Monitor} />
            <ChannelBadge label="Destaque Flutuante" icon={Layers} />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ─── SECTION 1: CREATING ─── */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Parte 1 — Cadastrar Nova Campanha
        </h2>
        <p className="text-sm text-muted-foreground">Passo a passo para criar sua primeira campanha multi-canal.</p>
      </div>

      <div className="space-y-4">
        <StepCard step={1} title="Acessar a tela de Campanhas" icon={Layers}>
          <p>No menu lateral, acesse <strong className="text-foreground">Negócios → Campanhas</strong>. Na página inicial (Hub), clique em <strong className="text-foreground">"Campanhas Unificadas"</strong> para ver a lista de campanhas existentes.</p>
        </StepCard>

        <StepCard step={2} title="Criar nova campanha" icon={Plus}>
          <p>Clique no botão <strong className="text-foreground">"+ Nova Campanha"</strong> no canto superior direito. Você será direcionado para o formulário de criação.</p>
        </StepCard>

        <StepCard step={3} title="Preencher dados básicos" icon={Pencil}>
          <p>Preencha os campos obrigatórios:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-foreground">Nome da campanha</strong> — Ex: "Institucional Março 2026"</li>
            <li><strong className="text-foreground">Anunciante</strong> — Nome do cliente ou empresa</li>
            <li><strong className="text-foreground">Descrição</strong> — Resumo da campanha (opcional)</li>
            <li><strong className="text-foreground">Data de Início e Fim</strong> — Período de veiculação</li>
            <li><strong className="text-foreground">Prioridade</strong> — De 1 (baixa) a 100 (máxima); campanhas com maior prioridade aparecem primeiro</li>
            <li><strong className="text-foreground">Status</strong> — "Rascunho" para salvar sem ativar, ou "Ativa" para veicular imediatamente</li>
          </ul>
          <TipBox>
            Você pode criar como <strong>Rascunho</strong> e ativar depois, quando os criativos estiverem prontos.
          </TipBox>
        </StepCard>

        <StepCard step={4} title="Configurar CTA (Call-to-Action)" icon={ArrowRight}>
          <p>Defina a ação que será disparada ao clicar no anúncio:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-foreground">Texto do CTA</strong> — Ex: "Saiba mais", "Cadastre-se"</li>
            <li><strong className="text-foreground">URL do CTA</strong> — Link de destino (ex: site do anunciante)</li>
            <li><strong className="text-foreground">Limite de frequência</strong> — Máximo de exibições por dia por usuário</li>
          </ul>
        </StepCard>

        <StepCard step={5} title="Selecionar canais de distribuição" icon={Layers}>
          <p>Marque os canais onde a campanha será veiculada. Cada canal tem configurações específicas:</p>
          
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Monitor className="h-4 w-4" /> Ads (Banners)
              </div>
              <p>Exibe banners nas posições padrão do site. Selecione os <strong className="text-foreground">formatos desejados</strong>:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                <li><strong>Mega Destaque</strong> — 970×250px (topo da home, entre blocos)</li>
                <li><strong>Destaque Horizontal</strong> — 728×90px (topo de matérias e categorias)</li>
                <li><strong>Destaque Inteligente</strong> — 300×250px (meio do conteúdo, sidebar)</li>
                <li><strong>Painel Vertical</strong> — 300×600px (barra lateral, alto impacto)</li>
                <li><strong>Alerta Comercial</strong> — 580×400px (pop-up controlado)</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Megaphone className="h-4 w-4" /> Publidoor
              </div>
              <p>Distribui para telas digitais urbanas (vitrines). Selecione os <strong className="text-foreground">templates</strong> e <strong className="text-foreground">locais</strong> (locations) de exibição.</p>
              <p className="font-medium text-foreground pt-1">Campos do Publidoor:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                <li><strong>Frase Principal</strong> — Título de destaque exibido na tela</li>
                <li><strong>Frase Secundária</strong> — Complemento ou subtítulo</li>
                <li><strong>Descrição</strong> — Texto descritivo do anúncio</li>
                <li><strong>Imagem da Exibição</strong> — Criativo visual (300×250px recomendado)</li>
              </ul>
              <p className="font-medium text-foreground pt-2">Tipos de Exibição:</p>
              <div className="space-y-2 pt-1">
                <div className="flex gap-2 items-start text-xs">
                  <Badge variant="outline" className="shrink-0 gap-1"><BookOpen className="h-3 w-3" />Narrativo</Badge>
                  <span>História envolvente sobre a marca. Usa frases sequenciais para contar uma narrativa emocional. Ideal para branding institucional.</span>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <Badge variant="outline" className="shrink-0 gap-1"><Settings className="h-3 w-3" />Contextual</Badge>
                  <span>Conteúdo relacionado ao contexto do local (ex: farmácia exibe saúde, padaria exibe café da manhã).</span>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <Badge variant="outline" className="shrink-0 gap-1"><MapPin className="h-3 w-3" />Geográfico</Badge>
                  <span>Baseado na localização física da tela. Exibe conteúdo relevante para o bairro ou região.</span>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <Badge variant="outline" className="shrink-0 gap-1"><FileText className="h-3 w-3" />Editorial</Badge>
                  <span>Estilo jornalístico. Simula matéria ou notícia patrocinada, com tom informativo.</span>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <Badge variant="outline" className="shrink-0 gap-1"><Maximize className="h-3 w-3" />Impacto Total</Badge>
                  <span>Formato premium fullwidth. Ocupa toda a tela com máximo impacto visual. Ideal para lançamentos.</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Smartphone className="h-4 w-4" /> WebStories
              </div>
              <p>Cria stories verticais interativos para mobile. Configure o <strong className="text-foreground">título</strong>, <strong className="text-foreground">texto do CTA no story</strong> e a <strong className="text-foreground">cor do botão</strong>.</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Layers className="h-4 w-4" /> Exit-Intent, Login Panel, Push, Newsletter
              </div>
              <p>Canais complementares: modal ao sair da página, banner na tela de login, notificações push e envios por e-mail.</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Monitor className="h-4 w-4" /> Login (Formatos 10-12)
              </div>
              <p>Banners exibidos na tela de login do portal. Três formatos disponíveis:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                <li><strong>Login Formato 01</strong> — 800×500px (hero principal da tela de login)</li>
                <li><strong>Login Formato 02</strong> — 200×500px (banner vertical estreito)</li>
                <li><strong>Login Formato 03</strong> — 400×500px (banner médio em grid)</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Sparkles className="h-4 w-4" /> Experiência (Formatos 13-15)
              </div>
              <p>Banners de experiência do site com alto impacto visual:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                <li><strong>Banner Intro</strong> — 970×250px (primeira dobra da Home, pós-carregamento)</li>
                <li><strong>Destaque Flutuante</strong> — 300×600px (lateral fixo ao scroll)</li>
                <li><strong>Alerta Full Saída</strong> — 1280×720px (exit-intent fullscreen)</li>
              </ul>
            </div>
          </div>

          <TipBox variant="warning">
            Cada canal exige <strong>criativos (imagens)</strong> com dimensões específicas. Faça upload dos arquivos corretos na seção de Assets abaixo.
          </TipBox>
        </StepCard>

        <StepCard step={6} title="Upload de Assets (Criativos)" icon={Image}>
          <p>Na seção <strong className="text-foreground">"Assets da Campanha"</strong>, faça upload das imagens para cada formato:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Selecione o <strong className="text-foreground">canal</strong> e o <strong className="text-foreground">formato</strong> do criativo</li>
            <li>Faça upload da imagem (JPG, PNG ou WebP — máx. 30MB)</li>
            <li>O <strong className="text-foreground">texto alternativo (Alt)</strong> é gerado automaticamente, mas pode ser editado</li>
            <li>Repita para cada formato necessário</li>
          </ul>
          <TipBox>
            Você pode adicionar múltiplos assets para a mesma campanha — um para cada posição/formato do site.
          </TipBox>
        </StepCard>

        <StepCard step={7} title="Salvar a campanha" icon={CheckCircle2}>
          <p>Clique em <strong className="text-foreground">"Criar Campanha"</strong> (ou "Salvar Alterações" ao editar). A campanha será salva e você será redirecionado à lista de campanhas.</p>
          <p>Se o status for <strong className="text-foreground">"Ativa"</strong> e as datas estiverem dentro do período, os criativos começarão a ser exibidos automaticamente nos canais selecionados.</p>
        </StepCard>
      </div>

      <Separator />

      {/* ─── SECTION 2: EDITING ─── */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Pencil className="h-5 w-5 text-primary" />
          Parte 2 — Editar Campanha Existente
        </h2>
        <p className="text-sm text-muted-foreground">Como alterar dados, criativos ou canais de uma campanha já criada.</p>
      </div>

      <div className="space-y-4">
        <StepCard step={1} title="Localizar a campanha" icon={Eye}>
          <p>Na lista de <strong className="text-foreground">Campanhas Unificadas</strong>, use a <strong className="text-foreground">barra de busca</strong> para encontrar pelo nome ou anunciante. Use os filtros de <strong className="text-foreground">status</strong> e <strong className="text-foreground">canal</strong> para refinar.</p>
        </StepCard>

        <StepCard step={2} title="Abrir o editor" icon={Pencil}>
          <p>Clique no ícone de <strong className="text-foreground">três pontos (⋮)</strong> no card da campanha e selecione <strong className="text-foreground">"Editar"</strong>. Você também pode clicar em <strong className="text-foreground">"Métricas"</strong> para ver o desempenho.</p>
        </StepCard>

        <StepCard step={3} title="Modificar dados e canais" icon={Settings}>
          <p>No editor, você pode alterar qualquer campo:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Alterar datas, prioridade, CTA ou status</li>
            <li>Ativar ou desativar canais de distribuição</li>
            <li>Adicionar, substituir ou remover assets</li>
            <li>Ajustar configurações específicas de cada canal</li>
          </ul>
          <TipBox variant="warning">
            Alterar o status para <strong>"Pausada"</strong> interrompe imediatamente a exibição em todos os canais.
          </TipBox>
        </StepCard>

        <StepCard step={4} title="Gerenciar Ciclos" icon={Layers}>
          <p>Ao editar, o card <strong className="text-foreground">"Ciclos da Campanha"</strong> aparece acima do formulário. Veja a seção abaixo para detalhes completos.</p>
        </StepCard>
      </div>

      <Separator />

      {/* ─── SECTION 2B: DISTRIBUTION CYCLES ─── */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Parte 2B — Ciclos de Distribuição
        </h2>
        <p className="text-sm text-muted-foreground">Gerencie rodadas de exibição/envio dentro de uma campanha.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-3">
          <h3 className="font-semibold text-foreground">O que são Ciclos?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Ciclos</strong> são rodadas de exibição/envio dentro de uma campanha. Eles permitem dividir o período total em fases distintas — como "Semana 1", "Fase de Lançamento" ou "Reforço Final" — cada uma com seus próprios criativos e canais ativos.
          </p>
          <TipBox>
            <strong>Exemplo prático:</strong> Uma campanha de 30 dias pode ser dividida em 3 ciclos de 10 dias, cada um com criativos diferentes para manter a comunicação fresca e relevante.
          </TipBox>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <StepCard step={1} title="Criar um novo ciclo" icon={Plus}>
          <p>Na tela de edição da campanha, localize a seção <strong className="text-foreground">"Ciclos da Campanha"</strong> e clique em <strong className="text-foreground">"+ Novo Ciclo"</strong>.</p>
          <p>Preencha os campos:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-foreground">Nome do Ciclo</strong> — Ex: "Fase 1 - Lançamento"</li>
            <li><strong className="text-foreground">Data de Início</strong> — Quando o ciclo começa a veicular</li>
            <li><strong className="text-foreground">Data de Fim</strong> — Quando o ciclo encerra</li>
            <li><strong className="text-foreground">Canais ativos</strong> — Quais canais serão acionados neste ciclo específico</li>
          </ul>
        </StepCard>

        <StepCard step={2} title="Status dos ciclos" icon={Calendar}>
          <p>Cada ciclo possui um status independente:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="border-muted-foreground/30">Agendado</Badge>
            <Badge variant="secondary">Ativo</Badge>
            <Badge className="bg-green-600 text-white">Concluído</Badge>
            <Badge variant="destructive">Cancelado</Badge>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2 pt-2">
            <li><strong className="text-foreground">Agendado</strong> — Ciclo criado mas ainda não iniciou (aguardando data)</li>
            <li><strong className="text-foreground">Ativo</strong> — Ciclo em execução, exibindo/enviando criativos</li>
            <li><strong className="text-foreground">Concluído</strong> — Ciclo finalizado após atingir a data de fim</li>
            <li><strong className="text-foreground">Cancelado</strong> — Ciclo interrompido manualmente pelo administrador</li>
          </ul>
        </StepCard>

        <StepCard step={3} title="Confirmação obrigatória (Push/Newsletter)" icon={Send}>
          <p>Ciclos que incluem os canais <strong className="text-foreground">Push</strong> ou <strong className="text-foreground">Newsletter</strong> exigem <strong className="text-foreground">confirmação manual</strong> antes de serem ativados.</p>
          <TipBox variant="warning">
            Isso é uma medida de segurança para evitar envios acidentais de notificações ou e-mails em massa. O administrador precisa revisar e confirmar explicitamente antes que o envio seja disparado.
          </TipBox>
        </StepCard>

        <StepCard step={4} title="Caso de uso prático" icon={CheckCircle2}>
          <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-xs">
            <p className="font-medium text-foreground">Campanha "Institucional Março" — 30 dias, 3 ciclos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Ciclo 1 (dias 1-10):</strong> "Lançamento" — Ads + Publidoor + WebStories</li>
              <li><strong>Ciclo 2 (dias 11-20):</strong> "Engajamento" — Push + Newsletter + Ads</li>
              <li><strong>Ciclo 3 (dias 21-30):</strong> "Reforço Final" — Todos os canais com criativos atualizados</li>
            </ul>
            <p className="pt-1 text-muted-foreground">Cada ciclo pode ter seus próprios criativos e canais, permitindo uma estratégia de comunicação progressiva.</p>
          </div>
        </StepCard>
      </div>

      <Separator />

      {/* ─── SECTION 3: MANAGING ─── */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Parte 3 — Gerenciamento Avançado
        </h2>
        <p className="text-sm text-muted-foreground">Métricas, status e boas práticas.</p>
      </div>

      <div className="space-y-4">
        <StepCard step={1} title="Acompanhar métricas" icon={BarChart3}>
          <p>Acesse <strong className="text-foreground">⋮ → Métricas</strong> em qualquer campanha para ver o dashboard com:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Impressões e cliques por canal</li>
            <li>CTR (taxa de cliques) e tendências</li>
            <li>Breakdown por dispositivo e período</li>
          </ul>
        </StepCard>

        <StepCard step={2} title="Controle de status" icon={Settings}>
          <p>Os status disponíveis são:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="border-muted-foreground/30">Rascunho</Badge>
            <Badge variant="secondary">Ativa</Badge>
            <Badge variant="outline">Pausada</Badge>
            <Badge variant="destructive">Encerrada</Badge>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2 pt-2">
            <li><strong className="text-foreground">Rascunho</strong> — Campanha salva mas não veiculada</li>
            <li><strong className="text-foreground">Ativa</strong> — Veiculando nos canais selecionados (dentro do período)</li>
            <li><strong className="text-foreground">Pausada</strong> — Temporariamente suspensa</li>
            <li><strong className="text-foreground">Encerrada</strong> — Finalizada permanentemente</li>
          </ul>
        </StepCard>

        <StepCard step={3} title="Boas práticas" icon={CheckCircle2}>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Use <strong className="text-foreground">prioridade alta (80-100)</strong> para campanhas premium que devem aparecer primeiro</li>
            <li>Sempre preencha o <strong className="text-foreground">texto alternativo</strong> das imagens para acessibilidade</li>
            <li>Configure o <strong className="text-foreground">limite de frequência</strong> para evitar saturação do usuário</li>
            <li>Crie como <strong className="text-foreground">Rascunho</strong> primeiro, revise os criativos e só depois mude para <strong className="text-foreground">Ativa</strong></li>
            <li>Use o dashboard de <strong className="text-foreground">Métricas</strong> semanalmente para otimizar a campanha</li>
          </ul>
        </StepCard>
      </div>

      <Separator />

      {/* ─── REFERENCE TABLE ─── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Tabela de Referência — 15 Formatos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-muted">
                <th className="border px-3 py-2 text-left">#</th>
                <th className="border px-3 py-2 text-left">Bloco</th>
                <th className="border px-3 py-2 text-left">Nome Comercial</th>
                <th className="border px-3 py-2 text-left">Dimensão</th>
                <th className="border px-3 py-2 text-left">Onde Aparece</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 'Ads', 'Destaque Horizontal', '728×90', 'Topo da Home, matérias'],
                [2, 'Ads', 'Mega Destaque', '970×250', 'Abaixo do menu, Home'],
                [3, 'Ads', 'Destaque Inteligente', '300×250', 'Meio de matérias, sidebar'],
                [4, 'Ads', 'Painel Vertical', '300×600', 'Lateral da Home'],
                [5, 'Ads', 'Alerta Comercial', '580×400', 'Pop-up controlado'],
                [6, 'Publidoor', 'Destaque Premium', '970×250', 'Telas urbanas'],
                [7, 'Publidoor', 'Destaque Editorial', '300×250', 'Telas inline'],
                [8, 'Publidoor', 'Painel Vertical', '300×600', 'Telas laterais'],
                [9, 'WebStories', 'Story Premium', '1080×1920', 'Feed mobile'],
                [10, 'Login', 'Login Formato 01', '800×500', 'Tela de login — hero'],
                [11, 'Login', 'Login Formato 02', '200×500', 'Tela de login — lateral'],
                [12, 'Login', 'Login Formato 03', '400×500', 'Tela de login — grid'],
                [13, 'Experiência', 'Banner Intro', '970×250', 'Primeira dobra da Home'],
                [14, 'Experiência', 'Destaque Flutuante', '300×600', 'Lateral fixa ao scroll'],
                [15, 'Experiência', 'Alerta Full Saída', '1280×720', 'Exit-intent fullscreen'],
              ].map(([id, block, name, size, location]) => (
                <tr key={String(id)} className="border-b">
                  <td className="border px-3 py-1.5 font-mono text-xs">{id}</td>
                  <td className="border px-3 py-1.5"><Badge variant="secondary" className="text-[10px]">{block}</Badge></td>
                  <td className="border px-3 py-1.5 font-medium">{name}</td>
                  <td className="border px-3 py-1.5 font-mono text-xs">{size}</td>
                  <td className="border px-3 py-1.5 text-muted-foreground text-xs">{location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Separator />

      {/* CTA */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Pronto para começar?</h3>
            <p className="text-sm text-muted-foreground">Crie sua primeira campanha multi-canal agora.</p>
          </div>
          <Button onClick={() => navigate(campaignRoutes.new())} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
