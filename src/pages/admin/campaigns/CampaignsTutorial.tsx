import { useNavigate } from 'react-router-dom';
import { campaignRoutes } from '@/lib/campaignRoutes';
import { ArrowLeft, Plus, Pencil, Settings, Eye, BarChart3, Image, Layers, Monitor, Megaphone, Smartphone, BookOpen, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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
                <li><strong>Super Banner</strong> — 970×250px (topo da home)</li>
                <li><strong>Home Ad</strong> — 728×90px (entre seções)</li>
                <li><strong>Retângulo</strong> — 300×250px (lateral)</li>
                <li><strong>Arranha-céu</strong> — 300×600px (sidebar / login)</li>
                <li><strong>Pop-up</strong> — 600×400px (modal)</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Megaphone className="h-4 w-4" /> Publidoor
              </div>
              <p>Distribui para telas digitais urbanas (vitrines). Selecione os <strong className="text-foreground">templates</strong> e <strong className="text-foreground">locais</strong> (locations) de exibição.</p>
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
          <p>Ao editar, o card <strong className="text-foreground">"Ciclos da Campanha"</strong> aparece acima do formulário. Ciclos permitem agrupar períodos de veiculação (ex: Semana 1, Semana 2) para controle granular de quando cada criativo é exibido.</p>
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
