import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ChannelSelector } from './ChannelSelector';
import { BatchAssetUploader } from './BatchAssetUploader';
import { QuickGuideCard } from './QuickGuideCard';
import { FormatReferenceDialog } from './FormatReferenceDialog';
import { useCampaignFormReducer } from './useCampaignFormReducer';
import { AD_SLOTS } from '@/lib/adSlots';
import type { 
  CampaignFormData, 
  CampaignStatus,
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
  const isNewCampaign = !initialData?.name;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CampaignFormData>({
    defaultValues: {
      name: initialData?.name || '',
      advertiser: initialData?.advertiser || '',
      description: initialData?.description || '',
      starts_at: initialData?.starts_at || '',
      ends_at: initialData?.ends_at || '',
      priority: initialData?.priority || 0,
      cta_text: initialData?.cta_text || '',
      cta_url: initialData?.cta_url || '',
      frequency_cap_per_day: initialData?.frequency_cap_per_day || 0,
    },
  });

  const {
    state,
    setStatus,
    toggleChannel,
    setChannelConfig,
    setAsset,
    setValidationErrors,
  } = useCampaignFormReducer(initialData);

  const { status, selectedChannels, channelConfigs, assets, validationErrors } = state;

  // Watch form values for checklist
  const watchName = watch('name');
  const watchAdvertiser = watch('advertiser');
  const watchStartsAt = watch('starts_at');
  const watchEndsAt = watch('ends_at');
  const watchCtaUrl = watch('cta_url');

  // Build checklist items
  const checkItems = [
    { id: 'name', label: 'Nome e anunciante preenchidos', completed: !!(watchName?.trim() && watchAdvertiser?.trim()) },
    { id: 'period', label: 'Período definido', completed: !!(watchStartsAt && watchEndsAt) },
    { id: 'channels', label: 'Pelo menos 1 canal selecionado', completed: selectedChannels.length > 0 },
    { id: 'assets', label: 'Criativos vinculados', completed: Object.values(assets).some((a: any) => a?.url) },
    { id: 'cta', label: 'CTA com HTTPS válido', completed: !watchCtaUrl?.trim() || watchCtaUrl?.trim().startsWith('https://') },
    { id: 'cycle', label: 'Ciclo criado (se status ≠ pausada)', completed: status === 'paused' || status === 'draft' },
  ];

  // Validate channels before submit
  const validateChannels = (): string[] => {
    const errs: string[] = [];

    if (selectedChannels.includes('push')) {
      if (!channelConfigs.push.title?.trim()) errs.push('Push: Título é obrigatório');
      if (!channelConfigs.push.body?.trim()) errs.push('Push: Corpo da mensagem é obrigatório');
      const pushUrl = channelConfigs.push.action_url?.trim() || '';
      if (pushUrl && !pushUrl.startsWith('https://')) errs.push('Push: URL deve usar HTTPS');
    }

    if (selectedChannels.includes('newsletter')) {
      if (!channelConfigs.newsletter.subject?.trim()) errs.push('Newsletter: Assunto é obrigatório');
    }

    if (selectedChannels.includes('webstories')) {
      if (channelConfigs.webstories.story_type === 'external' && !channelConfigs.webstories.story_url?.trim()) {
        errs.push('WebStories: URL do story é obrigatória para tipo externo');
      }
    }

    if (selectedChannels.includes('exit_intent')) {
      if (!channelConfigs.exit_intent.cta_text?.trim()) errs.push('Exit-Intent: Texto do CTA é obrigatório');
    }

    return errs;
  };

  const handleFormSubmit = handleSubmit((data) => {
    const channelErrors = validateChannels();

    // Date validation
    if (data.starts_at && data.ends_at && data.ends_at < data.starts_at) {
      channelErrors.push('Data de fim não pode ser anterior à data de início');
    }

    // CTA URL validation
    const ctaUrl = data.cta_url?.trim() || '';
    if (ctaUrl && !ctaUrl.startsWith('https://')) {
      channelErrors.push('URL do CTA deve usar HTTPS');
    }

    if (channelErrors.length > 0) {
      setValidationErrors(channelErrors);
      return;
    }
    setValidationErrors([]);

    // Build assets array
    const formAssets: CampaignFormData['assets'] = [];

    if (selectedChannels.includes('ads') && assets.ads.url) {
      formAssets.push({
        asset_type: 'banner',
        file_url: assets.ads.url,
        alt_text: assets.ads.alt,
        channel_type: 'ads',
        format_key: channelConfigs.ads.slot_type,
      });
    }

    if (selectedChannels.includes('publidoor') && assets.publidoor.url) {
      formAssets.push({
        asset_type: 'publidoor',
        file_url: assets.publidoor.url,
        alt_text: assets.publidoor.alt,
        channel_type: 'publidoor',
      });
    }

    if (selectedChannels.includes('webstories') && assets.webstories.url) {
      formAssets.push({
        asset_type: 'story_cover',
        file_url: assets.webstories.url,
        alt_text: assets.webstories.alt,
        channel_type: 'webstories',
      });
    }

    if (selectedChannels.includes('exit_intent')) {
      if (assets.exitIntentHero.url) {
        formAssets.push({ asset_type: 'banner', file_url: assets.exitIntentHero.url, channel_type: 'exit_intent', format_key: 'exit_hero' });
      }
      if (assets.exitIntentSecondary1.url) {
        formAssets.push({ asset_type: 'banner', file_url: assets.exitIntentSecondary1.url, channel_type: 'exit_intent', format_key: 'exit_secondary_1' });
      }
      if (assets.exitIntentSecondary2.url) {
        formAssets.push({ asset_type: 'banner', file_url: assets.exitIntentSecondary2.url, channel_type: 'exit_intent', format_key: 'exit_secondary_2' });
      }
    }

    if (selectedChannels.includes('login_panel') && assets.loginPanel.url) {
      formAssets.push({
        asset_type: channelConfigs.login_panel.display_type === 'story' ? 'story_cover' : 'publidoor',
        file_url: assets.loginPanel.url,
        channel_type: 'login_panel',
        format_key: 'login_panel',
      });
    }

    onSubmit({
      ...data,
      status,
      enabledChannels: selectedChannels,
      adsConfig: channelConfigs.ads,
      publidoorConfig: channelConfigs.publidoor,
      webstoriesConfig: channelConfigs.webstories,
      pushConfig: channelConfigs.push,
      newsletterConfig: channelConfigs.newsletter,
      exitIntentConfig: channelConfigs.exit_intent,
      loginPanelConfig: channelConfigs.login_panel,
      bannerIntroConfig: channelConfigs.banner_intro,
      floatingAdConfig: channelConfigs.floating_ad,
      assets: formAssets,
    });
  });

  return (
    <div className="space-y-6">
      {/* Quick Guide */}
      <QuickGuideCard isNewCampaign={isNewCampaign} checkItems={checkItems} />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Block 1: Common Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dados da Campanha</CardTitle>
              <CardDescription>Informações básicas da campanha publicitária</CardDescription>
            </div>
            <FormatReferenceDialog />
          </div>
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
              <Label>Status</Label>
              <RadioGroup
                value={status}
                onValueChange={(value) => setStatus(value as CampaignStatus)}
                className="flex flex-wrap gap-3"
              >
                {[
                  { value: 'draft', label: 'Rascunho' },
                  { value: 'active', label: 'Ativa' },
                  { value: 'paused', label: 'Pausada' },
                  { value: 'ended', label: 'Encerrada' },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`status-${opt.value}`} />
                    <Label htmlFor={`status-${opt.value}`} className="font-normal cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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
            onToggleChannel={toggleChannel}
            channelConfigs={channelConfigs}
            onConfigChange={setChannelConfig}
            channelAssets={assets}
            onAssetChange={setAsset}
          />
        </CardContent>
      </Card>

      {/* Block 3: Batch Asset Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Criativos</CardTitle>
          <CardDescription>
            Arraste imagens para auto-atribuição por dimensões oficiais. Múltiplos formatos podem coexistir na mesma campanha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BatchAssetUploader
            existingAssets={assets as unknown as Record<string, { url?: string; alt?: string }>}
            onAssetsUploaded={(uploadedAssets) => {
              uploadedAssets.forEach(asset => {
                const channel = asset.channel_type;
                if (channel === 'ads') {
                  setAsset('ads', asset.file_url);
                } else if (channel === 'publidoor') {
                  setAsset('publidoor', asset.file_url);
                } else if (channel === 'webstories') {
                  setAsset('webstories', asset.file_url);
                } else if (channel === 'banner_intro') {
                  setAsset('bannerIntro', asset.file_url);
                } else if (channel === 'floating_ad') {
                  setAsset('floatingAd', asset.file_url);
                } else if (channel === 'exit_intent') {
                  setAsset('exitIntentHero', asset.file_url);
                } else if (channel === 'login_panel') {
                  setAsset('loginPanel', asset.file_url);
                }
              });
            }}
          />

          {/* Active Assets Summary - ordered by AD_SLOTS seq */}
          {(() => {
            const assetEntries = [
              { label: 'Ads (Banner)', url: assets.ads.url, seq: 1 },
              { label: 'Publidoor', url: assets.publidoor.url, seq: 6 },
              { label: 'WebStories', url: assets.webstories.url, seq: 9 },
              { label: 'Painel Login', url: assets.loginPanel.url, seq: 10 },
              { label: 'Banner Intro', url: assets.bannerIntro.url, seq: 13 },
              { label: 'Destaque Flutuante', url: assets.floatingAd.url, seq: 14 },
              { label: 'Exit-Intent (Hero)', url: assets.exitIntentHero.url, seq: 15 },
              { label: 'Exit-Intent (Sec. 1)', url: assets.exitIntentSecondary1.url, seq: 15 },
              { label: 'Exit-Intent (Sec. 2)', url: assets.exitIntentSecondary2.url, seq: 15 },
            ];

            const activeAssets = assetEntries
              .filter(a => a.url)
              .sort((a, b) => a.seq - b.seq);

            if (activeAssets.length === 0) return null;

            return (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {activeAssets.length} criativo(s) vinculado(s)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeAssets.map((asset) => (
                    <div key={asset.label} className="border rounded-lg p-2 space-y-1.5">
                      <div className="aspect-video bg-muted rounded overflow-hidden">
                        <img
                          src={asset.url}
                          alt={asset.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs font-medium truncate">{asset.label}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-700 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Vinculado
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" disabled={isLoading} onClick={handleFormSubmit}>
          {isLoading ? 'Salvando...' : 'Salvar Campanha'}
        </Button>
      </div>
    </div>
  );
}
