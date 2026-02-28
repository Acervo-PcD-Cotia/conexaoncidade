import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  MapPin, Search, Bot, Shield, Star, BarChart3, Building2, 
  CheckCircle2, ArrowRight, Zap, Globe, MessageSquare, 
  Clock, ChevronRight, Sparkles, TrendingUp, Users, QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ───────── HERO ───────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="container relative z-10 grid gap-10 md:grid-cols-2 items-center">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          <motion.div variants={fadeIn}>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Novo: Presença em IA Generativa
            </Badge>
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Sua empresa encontrada no{' '}
            <span className="text-primary">Google</span>, Maps e{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">IA</span>
          </motion.h1>
          <motion.p variants={fadeIn} className="text-lg text-muted-foreground max-w-lg">
            Cadastro inteligente que coloca seu negócio na frente dos concorrentes — no Google, no ChatGPT e no Bing.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 text-base font-bold shadow-lg">
              <Link to="/voce-no-google/cadastro">
                Cadastrar minha empresa grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 text-base">
              <a href="#como-funciona">
                Ver como funciona
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
          <motion.div variants={fadeIn} className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Grátis para sempre</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> SEO automático</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Schema.org</span>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto max-w-md w-full"
        >
          {/* Mock Google Maps card */}
          <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-white/80" />
              <span className="text-white text-sm font-medium">padaria perto de mim</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Padaria Sabor & Arte</p>
                  <div className="flex items-center gap-1 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-muted-foreground ml-1">(127)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Rua das Flores, 123 · Cotia, SP
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" /> Aberto agora</Badge>
                <Badge variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> WhatsApp</Badge>
              </div>
              <div className="h-32 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary animate-bounce" />
              </div>
            </div>
          </div>
          {/* AI bubble */}
          <div className="absolute -bottom-4 -left-4 rounded-xl border bg-card shadow-lg p-3 max-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">ChatGPT</span>
            </div>
            <p className="text-xs text-muted-foreground">
              "A Padaria Sabor & Arte em Cotia é uma das melhores avaliadas..."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── COMO FUNCIONA ───────── */
function HowItWorksSection() {
  const steps = [
    { icon: Building2, title: 'Preencha os dados', desc: 'Cadastre nome, endereço, horários, fotos e serviços da sua empresa em 5 minutos.' },
    { icon: Zap, title: 'Publicamos com SEO', desc: 'Geramos automaticamente Schema.org, meta tags e URL otimizada para buscadores.' },
    { icon: Globe, title: 'Apareça em todo lugar', desc: 'Sua empresa fica visível no Google, Google Maps, ChatGPT, Gemini e Bing.' },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeIn} className="text-2xl md:text-3xl font-bold text-foreground">
            Como funciona?
          </motion.h2>
          <motion.p variants={fadeIn} className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Em 3 passos simples, sua empresa ganha presença digital profissional.
          </motion.p>
        </motion.div>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((s, i) => (
            <motion.div key={i} variants={fadeIn}>
              <Card className="relative border-none shadow-md hover:shadow-lg transition-shadow bg-card h-full">
                <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow">
                  {i + 1}
                </div>
                <CardContent className="pt-8 pb-6 px-6 flex flex-col items-start gap-3">
                  <s.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── BENEFÍCIOS ───────── */
function BenefitsSection() {
  const benefits = [
    { icon: MapPin, title: 'Google Maps', desc: 'Sua empresa aparece com endereço, rotas e avaliações no Google Maps.' },
    { icon: Bot, title: 'ChatGPT & Gemini', desc: 'Dados estruturados que alimentam respostas de IAs generativas.' },
    { icon: Shield, title: 'Schema.org automático', desc: 'JSON-LD LocalBusiness gerado sem você precisar programar nada.' },
    { icon: Star, title: 'Avaliações e reputação', desc: 'Colete avaliações de clientes e construa autoridade online.' },
    { icon: TrendingUp, title: 'Presença em diretórios', desc: 'Perfil otimizado que ajuda a aparecer em buscas locais.' },
    { icon: BarChart3, title: 'Painel de gestão', desc: 'Acompanhe visualizações, cliques e leads no seu dashboard.' },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeIn} className="text-2xl md:text-3xl font-bold text-foreground">
            Por que cadastrar sua empresa?
          </motion.h2>
        </motion.div>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map((b, i) => (
            <motion.div key={i} variants={fadeIn}>
              <Card className="h-full border hover:border-primary/30 transition-colors group">
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── PLANOS ───────── */
function PlansSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      desc: 'Para quem está começando',
      features: ['Perfil básico', 'SEO automático', 'Schema.org LocalBusiness', 'Até 5 fotos', 'Link para WhatsApp'],
      cta: 'Cadastrar grátis',
      popular: false,
    },
    {
      name: 'Profissional',
      price: annual ? 'R$ 49' : 'R$ 59',
      period: '/mês',
      desc: 'Para empresas que querem crescer',
      features: [
        'Tudo do Gratuito', 'Até 20 fotos + vídeo', 'Badge "Verificado"', 'Destaque nas buscas', 
        'Painel de estatísticas', 'Responder avaliações', 'Suporte prioritário',
      ],
      cta: 'Começar agora',
      popular: true,
    },
    {
      name: 'Premium',
      price: annual ? 'R$ 99' : 'R$ 119',
      period: '/mês',
      desc: 'Máxima visibilidade',
      features: [
        'Tudo do Profissional', 'Fotos ilimitadas', 'QR Code personalizado', 'Relatórios avançados',
        'FAQ personalizado', 'Integração Google Meu Negócio', 'Destaque na home', 'Gestor de conta dedicado',
      ],
      cta: 'Falar com consultor',
      popular: false,
    },
  ];

  return (
    <section id="planos" className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10">
          <motion.h2 variants={fadeIn} className="text-2xl md:text-3xl font-bold text-foreground">
            Planos para cada negócio
          </motion.h2>
          <motion.div variants={fadeIn} className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Anual <Badge variant="secondary" className="ml-1 text-xs">-17%</Badge>
            </span>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeIn}>
              <Card className={`h-full flex flex-col relative ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow">Mais popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${plan.popular ? '' : 'variant-outline'}`} variant={plan.popular ? 'default' : 'outline'}>
                    <Link to="/voce-no-google/cadastro">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── DEPOIMENTOS ───────── */
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Maria Santos',
      city: 'Cotia, SP',
      text: 'Depois de cadastrar minha loja aqui, comecei a receber clientes que me acharam pelo Google Maps. Fantástico!',
      avatar: 'MS',
    },
    {
      name: 'Carlos Oliveira',
      city: 'Vargem Grande Paulista, SP',
      text: 'O ChatGPT passou a recomendar minha oficina mecânica para quem perguntava sobre serviços na região.',
      avatar: 'CO',
    },
    {
      name: 'Ana Paula Lima',
      city: 'Embu das Artes, SP',
      text: 'Meu restaurante saiu do anonimato. As avaliações na plataforma me ajudaram a conquistar credibilidade.',
      avatar: 'AL',
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeIn} className="text-2xl md:text-3xl font-bold text-foreground">
            Quem já está no Google
          </motion.h2>
        </motion.div>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto"
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeIn}>
              <Card className="h-full border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── CTA FINAL ───────── */
function FinalCTASection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
      <div className="container text-center space-y-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeIn} className="text-2xl md:text-3xl font-bold">
            Comece agora — é grátis
          </motion.h2>
          <motion.p variants={fadeIn} className="text-primary-foreground/80 max-w-lg mx-auto">
            Mais de 500 empresas da região já estão aparecendo no Google e em IAs generativas.
          </motion.p>
          <motion.div variants={fadeIn}>
            <Button asChild size="lg" variant="secondary" className="gap-2 text-base font-bold mt-4 shadow-lg">
              <Link to="/voce-no-google/cadastro">
                Cadastrar minha empresa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── MAIN ───────── */
export default function VoceNoGoogle() {
  return (
    <>
      <Helmet>
        <title>Você no Google — Cadastre sua empresa grátis | Conexão na Cidade</title>
        <meta name="description" content="Cadastre sua empresa e apareça no Google, Google Maps, ChatGPT e Gemini. SEO local otimizado com Schema.org automático. Grátis!" />
        <meta property="og:title" content="Você no Google — Sua empresa encontrada no Google, Maps e IA" />
        <meta property="og:description" content="Cadastro inteligente com SEO local, Schema.org e presença em IA generativa." />
        <link rel="canonical" href="https://conexaonacidade.com.br/voce-no-google" />
      </Helmet>

      <main>
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <PlansSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
    </>
  );
}
