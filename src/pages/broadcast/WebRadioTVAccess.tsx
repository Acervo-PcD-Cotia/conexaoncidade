import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Radio, 
  Tv, 
  Users, 
  Bell, 
  MessageCircle, 
  Calendar, 
  CheckCircle, 
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Headphones,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const benefits = [
  {
    icon: Play,
    title: "Transmissões ao Vivo",
    description: "Acesso exclusivo a lives, entrevistas e cobertura de eventos locais em tempo real.",
  },
  {
    icon: Headphones,
    title: "Programação 24h",
    description: "Rádio e TV online com música, notícias e conteúdo de qualidade durante todo o dia.",
  },
  {
    icon: MessageCircle,
    title: "Chat da Comunidade",
    description: "Interaja com outros membros, faça perguntas e participe das discussões ao vivo.",
  },
  {
    icon: Bell,
    title: "Alertas de Lives",
    description: "Receba notificações quando novas transmissões começarem ou eventos importantes acontecerem.",
  },
];

const steps = [
  {
    number: "1",
    title: "Faça Login ou Cadastre-se",
    description: "Crie sua conta gratuita para começar.",
  },
  {
    number: "2",
    title: "Complete seu Perfil",
    description: "Preencha suas informações básicas e aceite os termos.",
  },
  {
    number: "3",
    title: "Aguarde Aprovação",
    description: "Nossa equipe analisará seu cadastro em até 24 horas.",
  },
];

const faqs = [
  {
    question: "Quanto tempo leva para meu acesso ser aprovado?",
    answer: "A aprovação geralmente acontece em até 24 horas úteis. Você receberá uma notificação por email assim que seu acesso for liberado.",
  },
  {
    question: "O acesso à WebRadioTV é gratuito?",
    answer: "Sim! O acesso básico é totalmente gratuito para membros aprovados da comunidade Conexão.",
  },
  {
    question: "Posso acessar de qualquer dispositivo?",
    answer: "Sim, nossa plataforma é responsiva e funciona em computadores, tablets e smartphones.",
  },
  {
    question: "Como faço para participar das lives?",
    answer: "Após a aprovação, você poderá interagir pelo chat durante as transmissões ao vivo.",
  },
];

export default function WebRadioTVAccess() {
  const whatsappUrl = "https://wa.me/5511999999999?text=Olá! Gostaria de solicitar acesso à WebRadioTV Conexão.";

  return (
    <>
      <Helmet>
        <title>WebRadioTV Conexão - Solicitar Acesso</title>
        <meta 
          name="description" 
          content="Solicite acesso à WebRadioTV Conexão e aproveite transmissões ao vivo, programação 24h e muito mais." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
          <div className="container relative py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 ring-4 ring-primary/20">
                  <div className="flex items-center gap-2">
                    <Radio className="h-8 w-8 text-primary" />
                    <Tv className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                WebRadioTV <span className="text-primary">Conexão</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Acesso liberado para perfis aprovados. Faça parte da nossa comunidade e 
                aproveite transmissões exclusivas, programação 24h e interação em tempo real.
              </p>
              
              {/* Badge */}
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                <Users className="h-4 w-4 mr-1.5" />
                +500 membros ativos
              </Badge>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="gap-2 h-12 px-8">
                  <Link to="/spah">
                    Quero meu acesso
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-8">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Falar no WhatsApp
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Benefícios Exclusivos</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Descubra tudo que você terá acesso ao se tornar um membro aprovado.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How to Get Access Section */}
        <section className="container py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Como Obter Acesso</h2>
              <p className="text-muted-foreground">
                Siga estes passos simples para liberar seu acesso à WebRadioTV.
              </p>
            </div>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-12 bg-primary/20 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="font-medium">
                Após a aprovação, você terá acesso imediato a todo o conteúdo!
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Perguntas Frequentes</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container py-16">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
            <Calendar className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-6">
              Solicite seu acesso agora e faça parte da comunidade WebRadioTV Conexão.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/spah">
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
