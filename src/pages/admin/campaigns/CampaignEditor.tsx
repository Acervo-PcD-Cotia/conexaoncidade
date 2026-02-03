import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignForm } from '@/components/admin/campaigns/CampaignForm';
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

  const { data: campaign, isLoading } = useCampaignUnified(id);
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
