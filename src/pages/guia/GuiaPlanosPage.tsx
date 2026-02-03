/**
 * Guia Comercial - Pricing Plans Page
 * Shows plan comparison and upgrade options
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

const features: PlanFeature[] = [
  { name: "Listagem no Guia", free: true, pro: true, premium: true },
  { name: "Perfil da Empresa", free: true, pro: true, premium: true },
  { name: "Receber Leads", free: true, pro: true, premium: true },
  { name: "WhatsApp Direto", free: true, pro: true, premium: true },
  { name: "Fotos no Perfil", free: "3 fotos", pro: "10 fotos", premium: "Ilimitado" },
  { name: "Destaque em Buscas", free: false, pro: true, premium: true },
  { name: "Selo Verificado", free: false, pro: true, premium: true },
  { name: "Estatísticas Avançadas", free: false, pro: true, premium: true },
  { name: "Responder Avaliações", free: false, pro: true, premium: true },
  { name: "Cadastrar Serviços", free: "3 serviços", pro: "10 serviços", premium: "Ilimitado" },
  { name: "Promoções e Cupons", free: false, pro: true, premium: true },
  { name: "Destaque na Home", free: false, pro: false, premium: true },
  { name: "Integração com Notícias", free: false, pro: false, premium: true },
  { name: "Suporte Prioritário", free: false, pro: false, premium: true },
  { name: "Consultoria SEO", free: false, pro: false, premium: true },
];

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Para começar sua presença online',
    price: 0,
    icon: Star,
    color: 'bg-muted',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Profissional',
    description: 'Para negócios que querem crescer',
    price: 49.90,
    icon: Zap,
    color: 'bg-blue-500',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Máxima visibilidade e conversão',
    price: 149.90,
    icon: Crown,
    color: 'bg-amber-500',
    popular: false,
  },
];

export default function GuiaPlanosPage() {
  return (
    <>
      <Helmet>
        <title>Planos e Preços | Guia Comercial</title>
        <meta
          name="description"
          content="Compare os planos do Guia Comercial e escolha o melhor para seu negócio. Comece grátis e faça upgrade quando quiser."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" className="mb-8" asChild>
            <Link to="/guia">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Guia
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para seu negócio. Comece gratuitamente e faça upgrade quando quiser.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`h-12 w-12 rounded-full ${plan.color} mx-auto mb-4 flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-bold">Grátis</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-muted-foreground">/mês</span>
                        </>
                      )}
                    </div>

                    <ul className="space-y-3 text-left">
                      {features.slice(0, 8).map((feature) => {
                        const value = feature[plan.id as keyof Omit<PlanFeature, 'name'>];
                        const isIncluded = value === true || typeof value === 'string';

                        return (
                          <li key={feature.name} className="flex items-center gap-2">
                            {isIncluded ? (
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={!isIncluded ? 'text-muted-foreground' : ''}>
                              {feature.name}
                              {typeof value === 'string' && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({value})
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <Link to={plan.id === 'free' ? '/guia/cadastrar' : '/guia/anunciante'}>
                        {plan.id === 'free' ? 'Começar Grátis' : 'Assinar Agora'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Full Feature Comparison */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Comparativo Completo de Recursos
            </h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Recurso</th>
                        <th className="text-center p-4 font-medium">Gratuito</th>
                        <th className="text-center p-4 font-medium bg-primary/5">Profissional</th>
                        <th className="text-center p-4 font-medium">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, i) => (
                        <tr key={feature.name} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                          <td className="p-4 font-medium">{feature.name}</td>
                          <td className="p-4 text-center">
                            <FeatureValue value={feature.free} />
                          </td>
                          <td className="p-4 text-center bg-primary/5">
                            <FeatureValue value={feature.pro} />
                          </td>
                          <td className="p-4 text-center">
                            <FeatureValue value={feature.premium} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h3 className="text-xl font-bold mb-4">Ainda tem dúvidas?</h3>
            <p className="text-muted-foreground mb-6">
              Fale conosco e tire suas dúvidas sobre qual plano é ideal para você
            </p>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://wa.me/5511999999999?text=Olá! Tenho dúvidas sobre os planos do Guia Comercial"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground mx-auto" />;
  }
  return <span className="text-sm">{value}</span>;
}
