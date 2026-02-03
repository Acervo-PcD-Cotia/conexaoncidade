import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface InlineAdSlotProps {
  /** Position in the article (e.g., after paragraph 3) */
  position?: number;
  /** Category of the article for targeting */
  category?: string;
  className?: string;
}

/**
 * InlineAdSlot - For editorial insertion between paragraphs
 * 
 * Displays campaign creatives within article content.
 * Uses 300x250 (Retângulo Médio) format.
 * Labeled with "Conteúdo de Marca" badge.
 */
export function InlineAdSlot({ position = 1, category, className }: InlineAdSlotProps) {
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['inline-ad-campaign', position, category],
    queryFn: async () => {
      // Fetch active campaigns targeting inline/ads channel
      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`
          id,
          name,
          advertiser,
          cta_text,
          cta_url,
          priority,
          channels:campaign_channels!inner(
            channel_type,
            enabled,
            config
          ),
          assets:campaign_assets(
            id,
            file_url,
            alt_text,
            width,
            height,
            channel_type,
            format_key
          )
        `)
        .eq('status', 'active')
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Find campaign with ads channel and 300x250 asset
      for (const c of data || []) {
        const hasAdsChannel = c.channels?.some(
          (ch: { channel_type: string; enabled: boolean }) => 
            ch.channel_type === 'ads' && ch.enabled
        );
        
        if (hasAdsChannel) {
          const asset = c.assets?.find(
            (a: { format_key?: string; width?: number; height?: number }) => 
              a.format_key === '300x250' || (a.width === 300 && a.height === 250)
          );
          
          if (asset) {
            return {
              id: c.id,
              name: c.name,
              advertiser: c.advertiser,
              cta_text: c.cta_text,
              cta_url: c.cta_url,
              asset,
            };
          }
        }
      }
      
      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recordEvent = async (eventType: 'impression' | 'click') => {
    if (!campaign) return;
    
    try {
      await supabase.from('campaign_events').insert([{
        campaign_id: campaign.id,
        event_type: eventType,
        channel_type: 'ads',
        metadata: { position, category, format: '300x250' },
        session_id: getSessionId(),
      }]);
    } catch (error) {
      console.error('Failed to record event:', error);
    }
  };

  if (isLoading || !campaign) {
    return null;
  }

  return (
    <div 
      className={cn(
        "relative my-6 flex justify-center",
        className
      )}
    >
      <div className="relative inline-block">
        {/* Brand badge */}
        <div className="absolute -top-3 left-0 z-10">
          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
            Conteúdo de Marca
          </span>
        </div>
        
        {/* Ad container */}
        <div 
          className="w-[300px] h-[250px] bg-muted rounded overflow-hidden"
          onLoad={() => recordEvent('impression')}
        >
          {campaign.cta_url ? (
            <a
              href={campaign.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordEvent('click')}
              className="block w-full h-full"
            >
              <img
                src={campaign.asset.file_url}
                alt={campaign.asset.alt_text || campaign.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>
          ) : (
            <img
              src={campaign.asset.file_url}
              alt={campaign.asset.alt_text || campaign.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        
        {/* Advertiser name */}
        <p className="text-xs text-muted-foreground text-center mt-1">
          {campaign.advertiser}
        </p>
      </div>
    </div>
  );
}

// Generate/get session ID for tracking
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
