import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Bus } from "lucide-react";
import { TransporterRegistrationForm } from "@/components/transporte-escolar/TransporterRegistrationForm";
import { TransportDisclaimer } from "@/components/transporte-escolar/TransportDisclaimer";

export default function TransporteEscolarCadastrar() {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <>
        <Helmet>
          <title>Cadastro Enviado | Transporte Escolar Cotia</title>
        </Helmet>

        <div className="container py-16 max-w-lg">
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold">Cadastro Enviado!</h1>
              <p className="text-muted-foreground">
                Seu cadastro foi recebido e está em análise. 
                Entraremos em contato pelo WhatsApp informado em até 48 horas.
              </p>
              <div className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enquanto isso, você pode:
                </p>
                <div className="flex flex-col gap-2">
                  <Link to="/transporte-escolar">
                    <Button variant="outline" className="w-full">
                      Voltar à página inicial
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setSuccess(false)}
                    className="w-full"
                  >
                    Fazer novo cadastro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cadastrar Transporte Escolar | Cotia</title>
        <meta
          name="description"
          content="Cadastre seu serviço de transporte escolar em Cotia. Apareça para pais que buscam transporte para seus filhos."
        />
      </Helmet>

      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <Link to="/transporte-escolar">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Cadastrar Transporte Escolar</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Preencha o formulário abaixo para aparecer na busca de pais 
              que procuram transporte escolar em Cotia.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Como funciona:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Preencha seus dados e escolas atendidas</li>
              <li>2. Seu cadastro será analisado em até 48h</li>
              <li>3. Após aprovação, você aparecerá nas buscas</li>
              <li>4. Pais entrarão em contato pelo WhatsApp</li>
            </ul>
          </div>

          <TransporterRegistrationForm onSuccess={() => setSuccess(true)} />

          <TransportDisclaimer />
        </div>
      </div>
    </>
  );
}
