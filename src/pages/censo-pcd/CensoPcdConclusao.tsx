import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Download, MessageCircle, Home, Accessibility } from "lucide-react";
import { downloadCensoPcdEbook } from "@/lib/censoPcdEbook";
import { toast } from "sonner";

export default function CensoPcdConclusao() {
  const location = useLocation();
  const responseId = location.state?.responseId;
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [ebookDownloaded, setEbookDownloaded] = useState(false);

  const handleDownloadEbook = () => {
    downloadCensoPcdEbook();
    setEbookDownloaded(true);
    toast.success("eBook baixado com sucesso!");
  };

  const handleSendWhatsApp = () => {
    if (!whatsappNumber) {
      toast.error("Digite um número de WhatsApp");
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const fullNumber = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
    
    const ebookUrl = `${window.location.origin}/censo-pcd`;
    const message = encodeURIComponent(
      `📘 *Censo PcD Cotia*\n\n` +
      `Obrigado por participar do Censo PcD Cotia!\n\n` +
      `Acesse e baixe seu eBook oficial:\n${ebookUrl}\n\n` +
      `Juntos pela inclusão! 💙`
    );

    window.open(`https://wa.me/${fullNumber}?text=${message}`, "_blank");
    toast.success("WhatsApp aberto!");
  };

  return (
    <>
      <Helmet>
        <title>Obrigado! - Censo PcD Cotia</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Obrigado por participar!</h1>
            <p className="text-muted-foreground text-lg">
              Sua contribuição é fundamental para construir uma Cotia mais inclusiva.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <Accessibility className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Baixe seu eBook</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  O eBook contém informações sobre direitos, recursos e contatos úteis para PcD em Cotia.
                </p>
                <Button 
                  onClick={handleDownloadEbook} 
                  size="lg" 
                  className="h-14 px-8 text-lg w-full sm:w-auto"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Baixar eBook (PDF)
                </Button>
                {ebookDownloaded && (
                  <p className="text-sm text-green-600 mt-2">✓ Download realizado</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Receber no WhatsApp
              </h2>
              <p className="text-sm text-muted-foreground">
                Envie o link do eBook para seu WhatsApp ou de um familiar.
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="whatsapp" className="sr-only">Número do WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button onClick={handleSendWhatsApp} className="h-12 px-6">
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild variant="outline" className="h-12">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Portal Conexão na Cidade • Impacto Social PcD Cotia • AB Soluções • Illúmina
          </p>
        </div>
      </div>
    </>
  );
}
