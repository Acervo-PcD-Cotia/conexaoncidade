import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignRoutes } from '@/lib/campaignRoutes';
import {
  ArrowLeft, Plus, Pencil, Settings, Eye, BarChart3, Image, Layers, Monitor,
  Megaphone, Smartphone, BookOpen, CheckCircle2, AlertCircle, ArrowRight,
  RefreshCw, Calendar, Send, MapPin, FileText, Maximize, Sparkles,
  Target, Zap, DollarSign, ShieldCheck, ChevronDown, ChevronRight,
  Bell, Mail, Trophy, Medal, Award, Lightbulb, TrendingUp, Users,
  MousePointerClick, Rocket, Check, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

/* ── Reusable sub-components ── */

function TipBox({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' | 'pro' }) {
  const styles = {
    info: 'bg-primary/5 border-primary/20',
    warning: 'bg-destructive/10 border-destructive/20',
    pro: 'bg-accent/20 border-accent/40',
  };
  const icons = {
    info: <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />,
    warning: <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />,
    pro: <Lightbulb className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />,
  };
  return (
    <div className={cn('flex gap-3 p-4 rounded-xl text-sm border', styles[variant])}>
      {icons[variant]}
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

function ChannelTooltipCard({ label, icon: Icon, description, color }: { label: string; icon: React.ElementType; description: string; color: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg min-w-[100px]',
            color
          )}>
            <Icon className="h-7 w-7" />
            <span className="text-xs font-semibold text-center">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-sm">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StepAccordion({ step, title, icon: Icon, explanation, example, tip, commonError, totalSteps }: {
  step: number; title: string; icon: React.ElementType; explanation: React.ReactNode; example?: React.ReactNode; tip?: string; commonError?: string; totalSteps: number;
}) {
  const [open, setOpen] = useState(step === 1);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className={cn(
          'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
          open ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-card hover:bg-muted/50 border-border'
        )}>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
            {step}
          </div>
          <Icon className="h-5 w-5 text-primary shrink-0" />
          <span className="font-semibold text-foreground flex-1">{title}</span>
          <span className="text-[10px] text-muted-foreground mr-2">{step}/{totalSteps}</span>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-[52px] mt-2 space-y-3 pb-2">
          <div className="text-sm text-muted-foreground leading-relaxed">{explanation}</div>
          {example && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground text-xs flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Exemplo Prático</span>
              {example}
            </div>
          )}
          {tip && <TipBox variant="pro"><strong>Dica Estratégica:</strong> {tip}</TipBox>}
          {commonError && <TipBox variant="warning"><strong>Erro Comum:</strong> {commonError}</TipBox>}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function PackageCard({ tier, icon: Icon, color, items, recommended }: {
  tier: string; icon: React.ElementType; color: string; items: string[]; recommended?: boolean;
}) {
  return (
    <Card className={cn('relative overflow-hidden transition-all hover:shadow-lg', recommended && 'ring-2 ring-primary')}>
      {recommended && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          RECOMENDADO
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-6 w-6', color)} />
          {tier}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ── Main Component ── */

export default function CampaignsTutorial() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const checklistItems = [
    { id: 'name', label: 'Nome da campanha definido' },
    { id: 'dates', label: 'Datas de início e fim configuradas' },
    { id: 'cta', label: 'CTA (texto e URL) configurado' },
    { id: 'channel', label: 'Pelo menos um canal selecionado' },
    { id: 'asset', label: 'Criativos enviados para cada formato' },
    { id: 'link', label: 'Link de destino testado' },
    { id: 'preview', label: 'Preview revisado antes de ativar' },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const allCompleted = completedCount === checklistItems.length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl space-y-8">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-4 -mx-4 px-4 pt-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(campaignRoutes.unified())}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Guia Interativo — Campanhas 360°
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Aprenda, simule e crie campanhas multi-canal com confiança
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(campaignRoutes.new())} className="gap-2 shadow-md">
            <Rocket className="h-4 w-4" />
            Criar Minha Campanha Agora
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="estrategia" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto gap-1 p-1">
          <TabsTrigger value="estrategia" className="text-xs gap-1 data-[state=active]:shadow-sm"><Target className="h-3.5 w-3.5" /><span className="hidden sm:inline">Visão</span></TabsTrigger>
          <TabsTrigger value="passo" className="text-xs gap-1 data-[state=active]:shadow-sm"><Zap className="h-3.5 w-3.5" /><span className="hidden sm:inline">Passo a Passo</span></TabsTrigger>
          <TabsTrigger value="simulacao" className="text-xs gap-1 data-[state=active]:shadow-sm"><Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline">Simulação</span></TabsTrigger>
          <TabsTrigger value="dicas" className="text-xs gap-1 data-[state=active]:shadow-sm"><Lightbulb className="h-3.5 w-3.5" /><span className="hidden sm:inline">Dicas Pro</span></TabsTrigger>
          <TabsTrigger value="alertas" className="text-xs gap-1 data-[state=active]:shadow-sm"><AlertCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">Alertas</span></TabsTrigger>
          <TabsTrigger value="comercial" className="text-xs gap-1 data-[state=active]:shadow-sm"><DollarSign className="h-3.5 w-3.5" /><span className="hidden sm:inline">Comercial</span></TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs gap-1 data-[state=active]:shadow-sm"><ShieldCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Checklist</span></TabsTrigger>
        </TabsList>

        {/* ═══════ TAB 1: VISÃO ESTRATÉGICA ═══════ */}
        <TabsContent value="estrategia" className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                O que é uma Campanha Unificada?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Uma <strong className="text-foreground">Campanha Unificada</strong> permite ativar múltiplos canais
                (Banner, Publieditorial, Web Story, Push, Destaque) dentro de uma única estrutura centralizada,
                com controle de datas, prioridade, ciclos de distribuição e métricas integradas.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Canais Disponíveis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <ChannelTooltipCard icon={Monitor} label="Banner (Ads)" description="Exibe banners nas posições do site: topo, sidebar, meio de conteúdo e pop-ups controlados." color="border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400" />
              <ChannelTooltipCard icon={Megaphone} label="Publidoor" description="Distribui conteúdo para telas digitais urbanas com 5 formatos: Narrativo, Contextual, Geográfico, Editorial e Impacto Total." color="border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400" />
              <ChannelTooltipCard icon={Smartphone} label="WebStory" description="Cria stories verticais interativos para mobile com CTA personalizado e cor do botão configurável." color="border-pink-500/30 bg-pink-500/5 text-pink-600 dark:text-pink-400" />
              <ChannelTooltipCard icon={Bell} label="Push" description="Envia notificações push diretas ao dispositivo do usuário. Ideal para urgência e promoções relâmpago." color="border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400" />
              <ChannelTooltipCard icon={Mail} label="Newsletter" description="Envia e-mails segmentados com o criativo da campanha para a base de assinantes." color="border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <Separator />

          {/* Reference table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">15 Formatos Comerciais</h3>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">#</th>
                    <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Bloco</th>
                    <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Nome Comercial</th>
                    <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Dimensão</th>
                    <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Onde Aparece</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [1, 'Ads', 'Destaque Horizontal', '728×90', 'Topo Home / Matérias'],
                    [2, 'Ads', 'Mega Destaque', '970×250', 'Abaixo do menu'],
                    [3, 'Ads', 'Destaque Inteligente', '300×250', 'Meio matéria / Sidebar'],
                    [4, 'Ads', 'Painel Vertical', '300×600', 'Lateral Home'],
                    [5, 'Ads', 'Alerta Comercial', '580×400', 'Pop-up controlado'],
                    [6, 'Publidoor', 'Destaque Premium', '970×250', 'Telas urbanas'],
                    [7, 'Publidoor', 'Destaque Editorial', '300×250', 'Inline'],
                    [8, 'Publidoor', 'Painel Vertical', '300×600', 'Laterais'],
                    [9, 'WebStories', 'Story Premium', '1080×1920', 'Feed mobile'],
                    [10, 'Login', 'Login 01', '800×500', 'Hero login'],
                    [11, 'Login', 'Login 02', '200×500', 'Lateral login'],
                    [12, 'Login', 'Login 03', '400×500', 'Grid login'],
                    [13, 'Experiência', 'Banner Intro', '970×250', 'Primeira dobra Home'],
                    [14, 'Experiência', 'Destaque Flutuante', '300×600', 'Fixo scroll'],
                    [15, 'Experiência', 'Alerta Full Saída', '1280×720', 'Exit intent'],
                  ].map(([id, block, name, size, location]) => (
                    <tr key={String(id)} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{id}</td>
                      <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px]">{block}</Badge></td>
                      <td className="px-3 py-2 font-medium text-foreground">{name}</td>
                      <td className="px-3 py-2 font-mono text-xs">{size}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ═══════ TAB 2: PASSO A PASSO ═══════ */}
        <TabsContent value="passo" className="space-y-4">
          <div className="space-y-1 mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Passo a Passo Interativo
            </h2>
            <p className="text-sm text-muted-foreground">Clique em cada etapa para expandir os detalhes.</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 px-1">
            {[1,2,3,4,5].map(s => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">{s}</div>
                {s < 5 && <div className="flex-1 h-0.5 bg-primary/20 rounded" />}
              </div>
            ))}
          </div>

          <div className="space-y-3 mt-4">
            <StepAccordion step={1} title="Dados Básicos" icon={Pencil} totalSteps={5}
              explanation={<>
                <p>Preencha os campos essenciais: <strong className="text-foreground">Nome</strong>, <strong className="text-foreground">Anunciante</strong>, <strong className="text-foreground">Datas</strong>, <strong className="text-foreground">Prioridade</strong> (1-100) e <strong className="text-foreground">Status</strong>.</p>
                <p className="mt-2">A prioridade define a ordem de exibição quando há concorrência entre campanhas ativas.</p>
              </>}
              example={<>
                <p className="text-muted-foreground">Nome: <strong className="text-foreground">"Institucional Março 2026"</strong></p>
                <p className="text-muted-foreground">Anunciante: <strong className="text-foreground">Restaurante Sabor da Serra</strong></p>
                <p className="text-muted-foreground">Período: <strong className="text-foreground">01/03 a 31/03</strong> • Prioridade: <strong className="text-foreground">80</strong></p>
              </>}
              tip="Crie como Rascunho e só ative quando os criativos estiverem aprovados pelo cliente."
              commonError="Esquecer de definir a data de fim — campanha roda indefinidamente e consome impressões."
            />

            <StepAccordion step={2} title="CTA (Call-to-Action)" icon={MousePointerClick} totalSteps={5}
              explanation={<>
                <p>Configure a ação do clique: <strong className="text-foreground">texto do botão</strong>, <strong className="text-foreground">URL de destino</strong> e <strong className="text-foreground">limite de frequência</strong> (máx. exibições/dia/usuário).</p>
              </>}
              example={<>
                <p className="text-muted-foreground">Texto: <strong className="text-foreground">"Faça sua reserva"</strong></p>
                <p className="text-muted-foreground">URL: <strong className="text-foreground">https://sabor-da-serra.com/reservas</strong></p>
                <p className="text-muted-foreground">Frequência: <strong className="text-foreground">3x por dia</strong></p>
              </>}
              tip="CTAs com verbos de ação convertem 2x mais que textos genéricos como 'Clique aqui'."
              commonError="Não testar o link de destino — o cliente perde cliques com URLs quebradas."
            />

            <StepAccordion step={3} title="Canais de Distribuição" icon={Layers} totalSteps={5}
              explanation={<>
                <p>Marque os canais desejados. Cada um possui configurações específicas:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong className="text-foreground">Ads:</strong> Selecione formatos (728×90, 970×250, 300×250, etc.)</li>
                  <li><strong className="text-foreground">Publidoor:</strong> Escolha tipo de exibição e locais</li>
                  <li><strong className="text-foreground">WebStory:</strong> Configure título, CTA e cor</li>
                  <li><strong className="text-foreground">Push/Newsletter:</strong> Exigem confirmação manual por ciclo</li>
                </ul>
              </>}
              tip="Combine Banner (impacto visual) com Publieditorial (credibilidade) para máxima conversão."
              commonError="Ativar Push e Newsletter sem estratégia clara — isso gera cancelamentos de assinatura."
            />

            <StepAccordion step={4} title="Upload de Criativos" icon={Image} totalSteps={5}
              explanation={<>
                <p>Envie imagens para cada formato selecionado (JPG, PNG ou WebP — até 30MB). O texto alternativo é gerado automaticamente.</p>
              </>}
              example={<>
                <p className="text-muted-foreground">Formato: <strong className="text-foreground">Mega Destaque (970×250)</strong></p>
                <p className="text-muted-foreground">Arquivo: <strong className="text-foreground">banner-marco-restaurante.jpg</strong></p>
              </>}
              tip="Prepare os criativos em todas as dimensões antes de iniciar o cadastro — agiliza o processo."
              commonError="Enviar imagem com dimensão errada — o banner fica distorcido ou cortado."
            />

            <StepAccordion step={5} title="Revisão e Publicação" icon={CheckCircle2} totalSteps={5}
              explanation={<>
                <p>Revise todos os dados, canais e criativos. Clique em <strong className="text-foreground">"Criar Campanha"</strong>. Se o status for <strong className="text-foreground">Ativa</strong> e as datas forem válidas, a veiculação inicia automaticamente.</p>
              </>}
              tip="Use o dashboard de Métricas na primeira semana para ajustar a campanha em tempo real."
            />
          </div>

          <Separator className="my-4" />

          {/* Cycles mini-section */}
          <Card className="bg-muted/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Ciclos de Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Divida a campanha em fases (ex: "Lançamento", "Engajamento", "Reforço") com criativos e canais diferentes em cada ciclo.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Agendado</Badge>
                <Badge variant="secondary">Ativo</Badge>
                <Badge className="bg-green-600/90 text-white hover:bg-green-600">Concluído</Badge>
                <Badge variant="destructive">Cancelado</Badge>
              </div>
              <TipBox variant="warning">
                Ciclos com <strong>Push</strong> ou <strong>Newsletter</strong> exigem confirmação manual antes do envio.
              </TipBox>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ TAB 3: SIMULAÇÃO ═══════ */}
        <TabsContent value="simulacao" className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Simulação Real
          </h2>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-sm px-3 py-1">Caso Prático</Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Restaurante Sabor da Serra</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Objetivo:</strong> Aumentar reservas para o almoço</p>
                    <p><strong className="text-foreground">Período:</strong> 15 dias (01-15/03)</p>
                    <p><strong className="text-foreground">Investimento:</strong> Pacote Ouro</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">Canais Ativados:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="gap-1 text-xs"><Monitor className="h-3 w-3" /> Banner Home</Badge>
                      <Badge variant="secondary" className="gap-1 text-xs"><Megaphone className="h-3 w-3" /> Publidoor</Badge>
                      <Badge variant="secondary" className="gap-1 text-xs"><Bell className="h-3 w-3" /> Push</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Resultado Visual</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-muted/50 border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-semibold">Na Home</span>
                      </div>
                      <div className="bg-muted rounded border-2 border-dashed border-blue-500/30 h-16 flex items-center justify-center text-xs text-blue-500/60 font-mono">
                        Banner 970×250 — Mega Destaque
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Megaphone className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-xs font-semibold">Na Matéria</span>
                      </div>
                      <div className="bg-muted rounded border-2 border-dashed border-purple-500/30 h-12 flex items-center justify-center text-xs text-purple-500/60 font-mono">
                        Publidoor Editorial — 300×250
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-semibold">No Celular</span>
                      </div>
                      <div className="bg-muted rounded border-2 border-dashed border-orange-500/30 h-10 flex items-center justify-center text-xs text-orange-500/60 font-mono">
                        🔔 Sabor da Serra: Reserve sua mesa hoje!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <TipBox variant="pro">
            <strong>Resultado esperado:</strong> Com 3 canais combinados por 15 dias, estima-se alcance de
            <strong> 5.000+ impressões</strong> e <strong>200+ cliques</strong> no link de reservas.
          </TipBox>
        </TabsContent>

        {/* ═══════ TAB 4: DICAS PRO ═══════ */}
        <TabsContent value="dicas" className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Dicas Profissionais
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-5 space-y-2">
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">Dica #1</Badge>
                <p className="text-sm font-semibold text-foreground">Banner gera impacto. Publieditorial gera confiança.</p>
                <p className="text-xs text-muted-foreground">Combine os dois para equilibrar alcance e credibilidade na mesma campanha.</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-5 space-y-2">
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">Dica #2</Badge>
                <p className="text-sm font-semibold text-foreground">Push deve ser usado para urgência, não para branding.</p>
                <p className="text-xs text-muted-foreground">Notificações frequentes causam fadiga. Reserve para promoções relâmpago e novidades relevantes.</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-pink-500">
              <CardContent className="pt-5 space-y-2">
                <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/30 text-xs">Dica #3</Badge>
                <p className="text-sm font-semibold text-foreground">Use WebStory para público mobile.</p>
                <p className="text-xs text-muted-foreground">70% do tráfego vem do celular. Stories verticais capturam atenção no scroll rápido.</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-5 space-y-2">
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">Dica #4</Badge>
                <p className="text-sm font-semibold text-foreground">Ciclos mantêm a campanha fresca.</p>
                <p className="text-xs text-muted-foreground">Divida em fases com criativos diferentes para evitar fadiga visual do público.</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500 sm:col-span-2">
              <CardContent className="pt-5 space-y-2">
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">Dica #5</Badge>
                <p className="text-sm font-semibold text-foreground">Métricas na primeira semana são essenciais.</p>
                <p className="text-xs text-muted-foreground">Acompanhe o CTR nos primeiros 7 dias. Se estiver abaixo de 0,5%, troque o criativo ou ajuste o CTA imediatamente.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ TAB 5: ALERTAS ═══════ */}
        <TabsContent value="alertas" className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Alertas Inteligentes
          </h2>

          <div className="space-y-3">
            {[
              { title: 'Não publique campanha sem CTA definido', desc: 'Sem CTA, o clique não direciona para nenhum destino e você perde a conversão.' },
              { title: 'Verifique datas antes de ativar', desc: 'Campanha com data de fim no passado ou sem data configurada pode gerar comportamento inesperado.' },
              { title: 'Evite ativar todos os canais sem estratégia', desc: 'Cada canal exige criativos específicos. Ativar sem material resulta em slots vazios no site.' },
              { title: 'Teste o link de destino no celular', desc: 'Sites não responsivos perdem até 60% dos cliques vindos de mobile.' },
              { title: 'Push/Newsletter exigem confirmação', desc: 'Envios acidentais para toda a base podem gerar reclamações e descadastros em massa.' },
            ].map((alert, i) => (
              <Card key={i} className="border-l-4 border-l-destructive bg-destructive/5">
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{alert.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ═══════ TAB 6: COMERCIAL ═══════ */}
        <TabsContent value="comercial" className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Como Vender essa Campanha?
          </h2>
          <p className="text-sm text-muted-foreground">Use estes pacotes como referência ao apresentar propostas comerciais aos anunciantes.</p>

          <div className="grid sm:grid-cols-3 gap-4">
            <PackageCard
              tier="🥉 Bronze"
              icon={Medal}
              color="text-amber-700"
              items={['Banner Lateral (300×250)', '1 Post Social', 'Período: 7 dias', 'Relatório básico']}
            />
            <PackageCard
              tier="🥈 Prata"
              icon={Award}
              color="text-slate-500"
              items={['Banner Home (970×250)', 'Publieditorial inline', 'Período: 15 dias', 'Relatório de CTR']}
            />
            <PackageCard
              tier="🥇 Ouro"
              icon={Trophy}
              color="text-yellow-600"
              recommended
              items={['Banner Home + Lateral', 'Publieditorial + WebStory', 'Push Notification', 'Período: 30 dias', 'Relatório completo + Ciclos']}
            />
          </div>

          <TipBox variant="pro">
            <strong>Estratégia de upsell:</strong> Comece oferecendo Bronze para novos clientes. Após os primeiros resultados,
            apresente o upgrade para Prata ou Ouro com os dados reais de desempenho.
          </TipBox>
        </TabsContent>

        {/* ═══════ TAB 7: CHECKLIST ═══════ */}
        <TabsContent value="checklist" className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Checklist Final
          </h2>
          <p className="text-sm text-muted-foreground">Confirme todos os itens antes de ativar a campanha.</p>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{completedCount} de {checklistItems.length} concluídos</span>
                  <span className="font-semibold text-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="space-y-3">
                {checklistItems.map(item => (
                  <label key={item.id} className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    checklist[item.id] ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                  )}>
                    <Checkbox
                      checked={!!checklist[item.id]}
                      onCheckedChange={() => toggleCheck(item.id)}
                    />
                    <span className={cn(
                      'text-sm transition-all',
                      checklist[item.id] ? 'text-foreground line-through opacity-60' : 'text-foreground'
                    )}>
                      {item.label}
                    </span>
                    {checklist[item.id] && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </label>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {allCompleted
                    ? '✅ Tudo pronto! Sua campanha pode ser publicada com segurança.'
                    : '⚠️ Complete todos os itens antes de publicar.'}
                </p>
                <Button
                  onClick={() => navigate(campaignRoutes.new())}
                  disabled={!allCompleted}
                  className="gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Publicar Campanha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Bottom CTA ── */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Pronto para começar?</h3>
            <p className="text-sm text-muted-foreground">Crie sua primeira campanha multi-canal agora.</p>
          </div>
          <Button onClick={() => navigate(campaignRoutes.new())} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
