import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChannelSelector } from './ChannelSelector';
import { BatchAssetUploader } from './BatchAssetUploader';
import type { 
  CampaignFormData, 
  CampaignStatus,
  ChannelType,
  AdsChannelConfig,
  PublidoorChannelConfig,
  WebStoriesChannelConfig,
  PushChannelConfig,
  NewsletterChannelConfig,
  ExitIntentChannelConfig,
  LoginPanelChannelConfig,
  CampaignAsset,
} from '@/types/campaigns-unified';

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CampaignForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CampaignFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CampaignFormData>({
    defaultValues: {
      name: initialData?.name || '',
      advertiser: initialData?.advertiser || '',
      description: initialData?.description || '',
      status: initialData?.status || 'draft',
      starts_at: initialData?.starts_at || '',
      ends_at: initialData?.ends_at || '',
      priority: initialData?.priority || 0,
      cta_text: initialData?.cta_text || '',
      cta_url: initialData?.cta_url || '',
      frequency_cap_per_day: initialData?.frequency_cap_per_day || 0,
      enabledChannels: initialData?.enabledChannels || [],
      adsConfig: initialData?.adsConfig || {},
      publidoorConfig: initialData?.publidoorConfig || {},
      webstoriesConfig: initialData?.webstoriesConfig || {},
      pushConfig: initialData?.pushConfig || {},
      newsletterConfig: initialData?.newsletterConfig || {},
      exitIntentConfig: initialData?.exitIntentConfig || {},
      loginPanelConfig: initialData?.loginPanelConfig || {},
      assets: initialData?.assets || [],
    },
  });

  // Channel states
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(
    initialData?.enabledChannels || []
  );
  const [adsConfig, setAdsConfig] = useState<Partial<AdsChannelConfig>>(
    initialData?.adsConfig || { slot_type: 'home_top', size: '970x250', sort_order: 0, link_target: '_blank' }
  );
  const [publidoorConfig, setPublidoorConfig] = useState<Partial<PublidoorChannelConfig>>(
    initialData?.publidoorConfig || { type: 'narrativo', phrase_1: '' }
  );
  const [webstoriesConfig, setWebstoriesConfig] = useState<Partial<WebStoriesChannelConfig>>(
    initialData?.webstoriesConfig || { story_type: 'external' }
  );
  const [pushConfig, setPushConfig] = useState<Partial<PushChannelConfig>>(
    initialData?.pushConfig || { title: '', body: '', action_url: '', target_audience: 'all' }
  );
  const [newsletterConfig, setNewsletterConfig] = useState<Partial<NewsletterChannelConfig>>(
    initialData?.newsletterConfig || { subject: '', preview_text: '', target_list: '' }
  );
  const [exitIntentConfig, setExitIntentConfig] = useState<Partial<ExitIntentChannelConfig>>(
    initialData?.exitIntentConfig || { hero_type: 'publidoor', cta_text: 'Continuar navegando', priority_type: 'commercial' }
  );
  const [loginPanelConfig, setLoginPanelConfig] = useState<Partial<LoginPanelChannelConfig>>(
    initialData?.loginPanelConfig || { display_type: 'publidoor' }
  );

  // Asset states
  const [adsAssetUrl, setAdsAssetUrl] = useState('');
  const [publidoorAssetUrl, setPublidoorAssetUrl] = useState('');
  const [storyAssetUrl, setStoryAssetUrl] = useState('');
  const [adsAltText, setAdsAltText] = useState('');
  const [publidoorAltText, setPublidoorAltText] = useState('');
  const [storyAltText, setStoryAltText] = useState('');

  const status = watch('status');

  const handleFormSubmit = handleSubmit((data) => {
    // Build assets array
    const assets: CampaignFormData['assets'] = [];
    
    if (selectedChannels.includes('ads') && adsAssetUrl) {
      assets.push({
        asset_type: 'banner',
        file_url: adsAssetUrl,
        alt_text: adsAltText,
        channel_type: 'ads',
        format_key: adsConfig.slot_type,
      });
    }
    
    if (selectedChannels.includes('publidoor') && publidoorAssetUrl) {
      assets.push({
        asset_type: 'publidoor',
        file_url: publidoorAssetUrl,
        alt_text: publidoorAltText,
        channel_type: 'publidoor',
      });
    }
    
    if (selectedChannels.includes('webstories') && storyAssetUrl) {
      assets.push({
        asset_type: 'story_cover',
        file_url: storyAssetUrl,
        alt_text: storyAltText,
        channel_type: 'webstories',
      });
    }

    onSubmit({
      ...data,
      enabledChannels: selectedChannels,
      adsConfig,
      publidoorConfig,
      webstoriesConfig,
      pushConfig,
      newsletterConfig,
      exitIntentConfig,
      loginPanelConfig,
      assets,
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Block 1: Common Data */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Campanha</CardTitle>
          <CardDescription>Informações básicas da campanha publicitária</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                placeholder="Ex: Black Friday 2026"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="advertiser">Anunciante *</Label>
              <Input
                id="advertiser"
                {...register('advertiser', { required: 'Anunciante é obrigatório' })}
                placeholder="Nome do anunciante"
              />
              {errors.advertiser && (
                <p className="text-xs text-destructive">{errors.advertiser.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição interna da campanha"
              rows={2}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as CampaignStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="ended">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="starts_at">Data Início</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register('starts_at')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">Data Fim</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                {...register('ends_at')}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">Texto do CTA</Label>
              <Input
                id="cta_text"
                {...register('cta_text')}
                placeholder="Saiba mais"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cta_url">URL do CTA</Label>
              <Input
                id="cta_url"
                type="url"
                {...register('cta_url')}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                min={0}
                {...register('priority', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Maior número = maior prioridade
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_cap_per_day">Limite de Exibição/Dia</Label>
              <Input
                id="frequency_cap_per_day"
                type="number"
                min={0}
                {...register('frequency_cap_per_day', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                0 = sem limite
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Canais de Exibição</CardTitle>
          <CardDescription>
            Selecione onde a campanha será exibida e configure cada canal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChannelSelector
            selectedChannels={selectedChannels}
            onChannelsChange={setSelectedChannels}
            adsConfig={adsConfig}
            onAdsConfigChange={setAdsConfig}
            publidoorConfig={publidoorConfig}
            onPublidoorConfigChange={setPublidoorConfig}
            webstoriesConfig={webstoriesConfig}
            onWebstoriesConfigChange={setWebstoriesConfig}
            pushConfig={pushConfig}
            onPushConfigChange={setPushConfig}
            newsletterConfig={newsletterConfig}
            onNewsletterConfigChange={setNewsletterConfig}
            exitIntentConfig={exitIntentConfig}
            onExitIntentConfigChange={setExitIntentConfig}
            loginPanelConfig={loginPanelConfig}
            onLoginPanelConfigChange={setLoginPanelConfig}
            adsAssetUrl={adsAssetUrl}
            onAdsAssetChange={(url, alt) => {
              setAdsAssetUrl(url);
              if (alt) setAdsAltText(alt);
            }}
            publidoorAssetUrl={publidoorAssetUrl}
            onPublidoorAssetChange={(url, alt) => {
              setPublidoorAssetUrl(url);
              if (alt) setPublidoorAltText(alt);
            }}
            storyAssetUrl={storyAssetUrl}
            onStoryAssetChange={(url, alt) => {
              setStoryAssetUrl(url);
              if (alt) setStoryAltText(alt);
            }}
          />
        </CardContent>
      </Card>

      {/* Block 3: Batch Asset Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Criativos</CardTitle>
          <CardDescription>
            Arraste imagens para auto-atribuição por dimensões oficiais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BatchAssetUploader
            onAssetsUploaded={(assets) => {
              // Add uploaded assets to form state
              assets.forEach(asset => {
                const channel = asset.channel_type;
                if (channel === 'ads') {
                  setAdsAssetUrl(asset.file_url);
                } else if (channel === 'publidoor') {
                  setPublidoorAssetUrl(asset.file_url);
                } else if (channel === 'webstories') {
                  setStoryAssetUrl(asset.file_url);
                }
              });
            }}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Campanha'}
        </Button>
      </div>
    </form>
  );
}
