import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accessibility, Shield, Heart, Users, ArrowRight, FileText } from "lucide-react";

export default function CensoPcdHome() {
  return (
    <>
      <Helmet>
        <title>Censo PcD Cotia - Mapeando a Inclusão</title>
        <meta name="description" content="Participe do Censo PcD Cotia e ajude a mapear as necessidades das Pessoas com Deficiência em nossa cidade." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero */}
        <section className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Accessibility className="h-4 w-4" />
              Iniciativa de Inclusão Social
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Censo PcD <span className="text-primary">Cotia</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ajude a mapear as necessidades das Pessoas com Deficiência e TEA em Cotia. 
              Sua participação é fundamental para construir políticas públicas mais inclusivas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link to="/censo-pcd/participar">
                  Participar do Censo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="container py-12">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Saúde</h3>
                <p className="text-sm text-muted-foreground">
                  Identificamos demandas por especialistas e terapias para melhorar o acesso à saúde.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Educação</h3>
                <p className="text-sm text-muted-foreground">
                  Mapeamos necessidades de apoio escolar e tecnologias assistivas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Assistência</h3>
                <p className="text-sm text-muted-foreground">
                  Identificamos famílias que precisam de benefícios e suporte social.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* eBook */}
        <section className="container py-12">
          <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
              <FileText className="h-16 w-16 shrink-0" />
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">eBook Gratuito</h3>
                <p className="opacity-90">
                  Ao concluir o censo, você recebe automaticamente o eBook oficial com informações 
                  sobre direitos, recursos e contatos úteis para PcD em Cotia.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Apoio */}
        <section className="container py-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Apoio Institucional</p>
          <p className="text-sm">
            Portal Conexão na Cidade • Impacto Social PcD Cotia • AB Soluções • Illúmina Inovação & Inclusão
          </p>
        </section>
      </div>
    </>
  );
}
