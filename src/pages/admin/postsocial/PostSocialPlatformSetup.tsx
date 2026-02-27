import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Info,
  ArrowLeft,
  Shield,
  Key,
  Smartphone,
  Globe,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PLATFORM_ICONS, PLATFORM_LABELS, PLATFORM_COLORS } from "@/types/postsocial";
import type { SocialPlatform } from "@/types/postsocial";
import { useSocialAccountsNew, useUpdateSocialAccount } from "@/hooks/usePostSocial";

// Platform setup steps
const PLATFORM_SETUP: Record<string, {
  title: string;
  description: string;
  icon: string;
  features: string[];
  requirements: { label: string; secretKey: string; helpUrl: string; description: string }[];
  setupSteps: string[];
  docsUrl: string;
}> = {
  instagram: {
    title: 'iSocial Post Instagram',
    description: 'Publique posts e stories de suas notícias direto no Instagram sem sair do painel.',
    icon: '📷',
    features: [
      'Publicação automática de posts no feed',
      'Suporte a imagens e carrosséis',
      'Legendas com hashtags automáticas',
      'Integração com o módulo Gera Post',
      'Agendamento de publicações',
    ],
    requirements: [
      {
        label: 'Meta Page Access Token',
        secretKey: 'META_PAGE_ACCESS_TOKEN',
        helpUrl: 'https://developers.facebook.com/docs/pages-api/getting-started',
        description: 'Token de acesso da página Facebook vinculada ao Instagram Business',
      },
      {
        label: 'Instagram Business ID',
        secretKey: 'INSTAGRAM_BUSINESS_ID',
        helpUrl: 'https://developers.facebook.com/docs/instagram-api/getting-started',
        description: 'ID da conta Instagram Business conectada à página Facebook',
      },
    ],
    setupSteps: [
      'Acesse o Meta Business Suite (business.facebook.com)',
      'Vincule sua conta Instagram Business à sua Página do Facebook',
      'Crie um app no Meta for Developers (developers.facebook.com)',
      'Adicione os produtos "Instagram Graph API" e "Pages API"',
      'Gere um Page Access Token com permissões: pages_manage_posts, instagram_basic, instagram_content_publish',
      'Copie o Token e o Instagram Business ID',
      'Cole as credenciais nas configurações abaixo',
    ],
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  facebook: {
    title: 'Facebook Post Automático',
    description: 'Publique suas postagens automaticamente em suas páginas do Facebook.',
    icon: '📘',
    features: [
      'Publicação automática em páginas',
      'Posts com link, imagem e texto',
      'Agendamento de publicações',
      'Publicação de posts agendados',
      'Integração com Auto Post',
    ],
    requirements: [
      {
        label: 'Meta Page Access Token',
        secretKey: 'META_PAGE_ACCESS_TOKEN',
        helpUrl: 'https://developers.facebook.com/docs/pages-api/getting-started',
        description: 'Token de acesso da página com permissão pages_manage_posts',
      },
      {
        label: 'Facebook Page ID',
        secretKey: 'META_PAGE_ID',
        helpUrl: 'https://www.facebook.com/help/1503421039731588',
        description: 'ID numérico da sua página do Facebook',
      },
    ],
    setupSteps: [
      'Acesse o Meta for Developers (developers.facebook.com)',
      'Crie ou selecione um app existente',
      'Adicione o produto "Pages API" ao app',
      'No Graph API Explorer, selecione sua página',
      'Gere um Page Access Token com permissão pages_manage_posts',
      'Para token de longa duração, troque o token no endpoint /oauth/access_token',
      'Copie o Page ID da sua página (Configurações > Sobre)',
      'Cole as credenciais abaixo',
    ],
    docsUrl: 'https://developers.facebook.com/docs/pages-api',
  },
  whatsapp: {
    title: 'iSocial Post WhatsApp',
    description: 'Compartilhe notícias em seus grupos de WhatsApp sem sair do painel do seu site.',
    icon: '💬',
    features: [
      'Envio automático para canais do WhatsApp Business',
      'Compartilhamento de links com preview',
      'Publicação automática ao publicar notícias',
      'Integração com Auto Post',
      'Suporte a texto formatado e imagens',
    ],
    requirements: [
      {
        label: 'WhatsApp Cloud API Token',
        secretKey: 'WHATSAPP_TOKEN',
        helpUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
        description: 'Token de acesso permanente da WhatsApp Cloud API',
      },
      {
        label: 'WhatsApp Phone Number ID',
        secretKey: 'WHATSAPP_PHONE_ID',
        helpUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
        description: 'ID do número de telefone registrado no WhatsApp Business',
      },
      {
        label: 'WhatsApp Channel ID (opcional)',
        secretKey: 'WHATSAPP_CHANNEL_ID',
        helpUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
        description: 'ID do canal do WhatsApp para distribuição em broadcast',
      },
    ],
    setupSteps: [
      'Acesse o Meta for Developers e crie/selecione um app',
      'Adicione o produto "WhatsApp" ao app',
      'Configure um número de telefone Business',
      'No painel do WhatsApp, copie o Phone Number ID',
      'Gere um token de acesso permanente (System User Token)',
      'Se usar Canais do WhatsApp, copie o Channel ID',
      'Cole as credenciais abaixo',
    ],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
  },
};

export default function PostSocialPlatformSetup() {
  const navigate = useNavigate();
  const { data: accounts } = useSocialAccountsNew();
  const updateAccount = useUpdateSocialAccount();
  
  const [activeTab, setActiveTab] = useState<string>('instagram');
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };
  
  const getAccountForPlatform = (platform: string) => {
    return accounts?.find(a => a.platform === platform && a.is_active);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/spah/painel/postsocial/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configurar Plataformas</h1>
          <p className="text-muted-foreground">
            Configure as APIs para publicação automática
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="instagram" className="gap-2">
            📷 Instagram
          </TabsTrigger>
          <TabsTrigger value="facebook" className="gap-2">
            📘 Facebook
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            💬 WhatsApp
          </TabsTrigger>
        </TabsList>
        
        {Object.entries(PLATFORM_SETUP).map(([platform, setup]) => (
          <TabsContent key={platform} value={platform} className="space-y-6">
            {/* Platform Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{setup.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{setup.title}</CardTitle>
                    <CardDescription className="mt-1">{setup.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Grátis
                      </Badge>
                      {getAccountForPlatform(platform) ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Conta Conectada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Não Configurado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Funcionalidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {setup.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Setup Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Como Configurar
                </CardTitle>
                <CardDescription>
                  Siga os passos abaixo para configurar a integração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-3">
                  {setup.setupSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
                
                <Separator />
                
                <Button variant="outline" size="sm" asChild>
                  <a href={setup.docsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentação Oficial
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            {/* API Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Credenciais da API
                </CardTitle>
                <CardDescription>
                  As credenciais são armazenadas de forma segura e criptografada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Para configurar as credenciais, entre em contato com o administrador do sistema 
                    ou use o painel de segredos do Lovable Cloud. As chaves abaixo precisam ser configuradas:
                  </AlertDescription>
                </Alert>
                
                {setup.requirements.map((req) => (
                  <div key={req.secretKey} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">{req.label}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(req.secretKey)}
                        title="Copiar nome do secret"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <code className="text-xs">{req.secretKey}</code>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <a href={req.helpUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver documentação
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Platform-specific notes */}
            {platform === 'instagram' && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <strong>Nota:</strong> O Instagram requer uma imagem para cada publicação. 
                  Use o módulo "Gera Post" para criar imagens padronizadas automaticamente. 
                  A conta deve ser do tipo Instagram Business vinculada a uma Página do Facebook.
                </AlertDescription>
              </Alert>
            )}
            
            {platform === 'whatsapp' && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>Nota:</strong> A integração utiliza a WhatsApp Cloud API (oficial). 
                  É necessário ter uma conta WhatsApp Business verificada. 
                  A publicação é feita via Canais do WhatsApp Business (broadcast).
                </AlertDescription>
              </Alert>
            )}
            
            {platform === 'facebook' && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                <Globe className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <strong>Nota:</strong> O Facebook e Instagram compartilham o mesmo 
                  Meta Page Access Token. Configure uma vez e ambas as plataformas funcionarão.
                  Certifique-se de que o token tenha permissão <code>pages_manage_posts</code>.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}