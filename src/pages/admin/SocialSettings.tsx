import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocialAccounts, PLATFORM_LABELS, PLATFORM_ICONS, SocialPlatform } from "@/hooks/useSocialAccounts";
import { Save, Info } from "lucide-react";

const DEFAULT_TEMPLATES: Record<SocialPlatform, string> = {
  facebook: `📰 {meta_title}

{meta_description}

🔗 Leia mais: {link}

{hashtags}`,
  instagram: `📰 {meta_title}

{meta_description}

📍 {city}

{hashtags}

🔗 Link na bio`,
  x: `📰 {meta_title}

{link}

{hashtags}`,
  linkedin: `📰 {meta_title}

{meta_description}

Leia a matéria completa no Conexão na Cidade.

{link}`,
  telegram: `📰 <b>{meta_title}</b>

{meta_description}

🔗 <a href="{link}">Leia mais</a>`,
  tiktok: `📰 {meta_title}

{hashtags}`,
  youtube: `📰 {meta_title}

{meta_description}`,
  pinterest: `📰 {meta_title}

{meta_description}

{hashtags}`,
  whatsapp: `📰 *{meta_title}*

{meta_description}

🔗 {link}`,
};

export default function SocialSettings() {
  const { accounts, isLoading, upsertAccount, toggleAccount, getAccount } = useSocialAccounts();
  const [activeTab, setActiveTab] = useState<SocialPlatform>('facebook');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações de Redes Sociais</h1>
        <p className="text-muted-foreground">
          Configure credenciais e templates para cada plataforma
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="flex items-start gap-3 pt-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre as credenciais</p>
            <p>
              As credenciais de API são armazenadas de forma segura no backend e nunca são expostas no frontend.
              Para configurar uma nova rede, você precisará obter os tokens de acesso nas plataformas de desenvolvedores de cada rede social.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SocialPlatform)}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="gap-1">
              <span>{PLATFORM_ICONS[key as SocialPlatform]}</span>
              <span className="hidden lg:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(PLATFORM_LABELS).map((platform) => (
          <TabsContent key={platform} value={platform}>
            <PlatformSettings 
              platform={platform as SocialPlatform} 
              account={getAccount(platform as SocialPlatform)}
              onSave={(data) => upsertAccount.mutate({ platform: platform as SocialPlatform, ...data })}
              onToggle={(enabled) => toggleAccount.mutate({ platform: platform as SocialPlatform, enabled })}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface PlatformSettingsProps {
  platform: SocialPlatform;
  account: ReturnType<typeof useSocialAccounts>['accounts'] extends (infer T)[] | undefined ? T : never;
  onSave: (data: { is_active?: boolean; settings?: Record<string, unknown> }) => void;
  onToggle: (enabled: boolean) => void;
}

function PlatformSettings({ platform, account, onSave, onToggle }: PlatformSettingsProps) {
  const [template, setTemplate] = useState(
    (account?.settings?.template as string) ?? DEFAULT_TEMPLATES[platform]
  );
  const [hashtags, setHashtags] = useState(
    ((account?.settings?.hashtags as string[]) ?? []).join(' ')
  );
  const [mode, setMode] = useState<'auto' | 'review'>(
    (account?.settings?.mode as 'auto' | 'review') ?? 'auto'
  );
  const [utmSource, setUtmSource] = useState(
    (account?.settings?.utm_source as string) ?? platform
  );
  const [utmMedium, setUtmMedium] = useState(
    (account?.settings?.utm_medium as string) ?? 'social'
  );
  const [utmCampaign, setUtmCampaign] = useState(
    (account?.settings?.utm_campaign as string) ?? 'news_share'
  );

  const handleSave = () => {
    onSave({
      is_active: account?.is_active ?? false,
      settings: {
        template,
        hashtags: hashtags.split(' ').filter(h => h.trim()),
        mode,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      },
    });
  };

  const charLimit = platform === 'x' ? 280 : 2200;

  return (
    <div className="space-y-6 mt-4">
      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {PLATFORM_ICONS[platform]} {PLATFORM_LABELS[platform]}
            </span>
            <Switch
              checked={account?.is_active ?? false}
              onCheckedChange={onToggle}
            />
          </CardTitle>
          <CardDescription>
            {account?.is_active 
              ? 'Esta rede está ativa e publicações serão feitas automaticamente'
              : 'Ative para habilitar publicações automáticas nesta rede'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Modo de Publicação</CardTitle>
          <CardDescription>
            Defina se posts devem ser publicados automaticamente ou aguardar revisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={mode} onValueChange={(v) => setMode(v as 'auto' | 'review')}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automático</SelectItem>
              <SelectItem value="review">Aguardar revisão</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Template */}
      <Card>
        <CardHeader>
          <CardTitle>Template de Legenda</CardTitle>
          <CardDescription>
            Use placeholders: {'{meta_title}'}, {'{meta_description}'}, {'{category}'}, {'{tags}'}, {'{link}'}, {'{hashtags}'}, {'{city}'}, {'{date}'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className={`text-xs mt-1 ${template.length > charLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {template.length} / {charLimit} caracteres
            </p>
          </div>
          
          <div>
            <Label htmlFor="hashtags">Hashtags Padrão</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#conexaonacidade #matao #noticias"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separe por espaços. Serão usadas onde {'{hashtags}'} aparecer no template.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* UTM */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros UTM</CardTitle>
          <CardDescription>
            Configure os parâmetros de rastreamento para links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="utm_source">utm_source</Label>
              <Input
                id="utm_source"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="utm_medium">utm_medium</Label>
              <Input
                id="utm_medium"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="utm_campaign">utm_campaign</Label>
              <Input
                id="utm_campaign"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Info */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Credenciais de API</CardTitle>
          <CardDescription>
            Para configurar as credenciais de API desta rede, entre em contato com o administrador do sistema.
            As credenciais são gerenciadas de forma segura no backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {platform === 'facebook' && 'Requer: Page Access Token, Page ID'}
            {platform === 'instagram' && 'Requer: Instagram Business Account ID, Access Token'}
            {platform === 'x' && 'Requer: API Key, API Secret, Access Token, Access Token Secret'}
            {platform === 'linkedin' && 'Requer: Client ID, Client Secret, Access Token, Organization ID'}
            {platform === 'telegram' && 'Requer: Bot Token, Channel ID'}
            {platform === 'tiktok' && 'Requer: TikTok Business API credentials'}
            {platform === 'youtube' && 'Requer: YouTube Data API credentials, OAuth2 tokens'}
            {platform === 'pinterest' && 'Requer: Pinterest API credentials'}
            {platform === 'whatsapp' && 'Modo assistido: copie e cole manualmente'}
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
