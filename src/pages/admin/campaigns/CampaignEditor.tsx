import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignForm } from '@/components/admin/campaigns/CampaignForm';
import { CycleSelectorCard } from '@/components/admin/campaigns/CycleSelectorCard';
import { 
  useCampaignUnified, 
  useCreateCampaignUnified, 
  useUpdateCampaignUnified 
} from '@/hooks/useCampaignsUnified';
import type { CampaignFormData, ChannelType, AdsChannelConfig, PublidoorChannelConfig, WebStoriesChannelConfig } from '@/types/campaigns-unified';

export default function CampaignEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: campaign, isLoading, error } = useCampaignUnified(id);
  const createMutation = useCreateCampaignUnified();
  const updateMutation = useUpdateCampaignUnified();

  const handleSubmit = (data: CampaignFormData) => {
    if (isEditing && id) {
      updateMutation.mutate(
        { id, data },
        { onSuccess: () => navigate('/admin/campaigns/unified') }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/admin/campaigns/unified'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/admin/campaigns/unified');
  };

  // Transform campaign data to form data
  const getInitialData = (): Partial<CampaignFormData> | undefined => {
    if (!campaign) return undefined;

    const enabledChannels: ChannelType[] = campaign.channels
      ?.filter(c => c.enabled)
      .map(c => c.channel_type) || [];

    const adsChannel = campaign.channels?.find(c => c.channel_type === 'ads');
    const publidoorChannel = campaign.channels?.find(c => c.channel_type === 'publidoor');
    const storiesChannel = campaign.channels?.find(c => c.channel_type === 'webstories');
    const pushChannel = campaign.channels?.find(c => c.channel_type === 'push');
    const newsletterChannel = campaign.channels?.find(c => c.channel_type === 'newsletter');
    const exitIntentChannel = campaign.channels?.find(c => c.channel_type === 'exit_intent');
    const loginPanelChannel = campaign.channels?.find(c => c.channel_type === 'login_panel');

    return {
      name: campaign.name,
      advertiser: campaign.advertiser,
      description: campaign.description,
      status: campaign.status,
      starts_at: campaign.starts_at,
      ends_at: campaign.ends_at,
      priority: campaign.priority,
      cta_text: campaign.cta_text,
      cta_url: campaign.cta_url,
      frequency_cap_per_day: campaign.frequency_cap_per_day,
      enabledChannels,
      adsConfig: adsChannel?.config as AdsChannelConfig | undefined,
      publidoorConfig: publidoorChannel?.config as PublidoorChannelConfig | undefined,
      webstoriesConfig: storiesChannel?.config as WebStoriesChannelConfig | undefined,
      pushConfig: pushChannel?.config as any,
      newsletterConfig: newsletterChannel?.config as any,
      exitIntentConfig: exitIntentChannel?.config as any,
      loginPanelConfig: loginPanelChannel?.config as any,
      assets: campaign.assets?.map(a => ({
        asset_type: a.asset_type,
        file_url: a.file_url,
        width: a.width,
        height: a.height,
        alt_text: a.alt_text,
        channel_type: a.channel_type,
        format_key: a.format_key,
      })) || [],
    };
  };

  if (isEditing && isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isEditing && error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Editar Campanha</h1>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center space-y-4">
          <p className="text-destructive font-medium">Erro ao carregar campanha</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message || 'Erro desconhecido'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const enabledChannels = campaign?.channels
    ?.filter(c => c.enabled)
    .map(c => c.channel_type) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Atualize os dados da campanha'
              : 'Configure uma campanha multi-canal'}
          </p>
        </div>
      </div>

      {/* Cycle Selector - Only show when editing */}
      {isEditing && id && enabledChannels.length > 0 && (
        <CycleSelectorCard 
          campaignId={id} 
          enabledChannels={enabledChannels}
        />
      )}

      {/* Form */}
      <CampaignForm
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
