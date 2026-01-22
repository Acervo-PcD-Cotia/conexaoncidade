import { Radio, Tv, Mic2, MessageSquare, Video, Users, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function LiveStudioPromo() {
  const handleContactClick = () => {
    window.open(
      "mailto:contato@conexaonacidade.com.br?subject=Solicitar Acesso ao Live Studio&body=Olá! Gostaria de solicitar acesso ao Live Studio para transmitir ao vivo.",
      "_blank"
    );
  };

  return (
    <>
      <Helmet>
        <title>Live Studio - Web Rádio e Web TV | Conexão na Cidade</title>
        <meta 
          name="description" 
          content="Transmita ao vivo para toda a comunidade de Cotia e região. O Live Studio é a central de transmissão da Web Rádio e Web TV do portal Conexão na Cidade." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-red-500/5 via-background to-background">
        {/* Hero Section */}
        <section className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-full text-sm font-medium">
              <Radio className="h-4 w-4 animate-pulse" />
              Web Rádio & Web TV
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Live <span className="text-red-600">Studio</span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transmita ao vivo para toda a comunidade de Cotia e região! 
              O Live Studio é nossa central de transmissão para Web Rádio e Web TV do portal.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/ao-vivo">
                <Button size="lg" variant="outline" className="gap-2">
                  <Tv className="h-5 w-5" />
                  Assistir Transmissões
                </Button>
              </Link>
              <Button 
                size="lg" 
                className="gap-2 bg-red-600 hover:bg-red-700"
                onClick={handleContactClick}
              >
                <Mic2 className="h-5 w-5" />
                Solicitar Acesso
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">O que você pode fazer no Studio</h2>
            <p className="text-muted-foreground mt-2">Ferramentas profissionais para suas transmissões</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                  <Radio className="h-7 w-7 text-red-600" />
                </div>
                <CardTitle className="text-lg">Transmita ao Vivo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Conecte sua câmera e microfone para transmitir em tempo real. 
                  Suporte para múltiplos participantes via WebRTC.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Chat em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Interaja com seu público através do chat ao vivo. 
                  Responda perguntas e crie engajamento com a audiência.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <Video className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Gravação Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Todas as transmissões são gravadas automaticamente para replay. 
                  Conteúdo convertido em podcast para alcançar mais pessoas.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Become a Host Section */}
        <section className="container py-12">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-2xl">
            <CardContent className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mx-auto">
                <Users className="h-8 w-8" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold">
                Quer ser um apresentador?
              </h3>
              
              <p className="text-white/90 max-w-xl mx-auto">
                Se você tem conteúdo relevante para a comunidade de Cotia, 
                entre em contato conosco para solicitar acesso ao Live Studio. 
                Nossa equipe avaliará sua proposta.
              </p>

              <div className="pt-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="gap-2 bg-white text-red-600 hover:bg-white/90"
                  onClick={handleContactClick}
                >
                  <Mail className="h-5 w-5" />
                  Solicitar Acesso ao Studio
                </Button>
              </div>

              <p className="text-sm text-white/70 pt-2">
                Acesso gratuito para produtores de conteúdo local
              </p>
            </CardContent>
          </Card>
        </section>

        {/* What We Broadcast Section */}
        <section className="container py-12 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">O que transmitimos</h2>
            <p className="text-muted-foreground mt-2">Conteúdo produzido pela comunidade, para a comunidade</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: "📰", label: "Notícias Locais", desc: "Cobertura de eventos e acontecimentos" },
              { icon: "🎙️", label: "Entrevistas", desc: "Conversas com personalidades locais" },
              { icon: "🎵", label: "Programas Musicais", desc: "Músicas e cultura regional" },
              { icon: "💬", label: "Debates", desc: "Discussões sobre temas relevantes" },
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold">{item.label}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
