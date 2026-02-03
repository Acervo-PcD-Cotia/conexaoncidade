import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';

interface WebStoriesViewerProps {
  storyId?: string;
  campaignId?: string;
  onClose?: () => void;
  className?: string;
}

interface Slide {
  id: string;
  file_url: string;
  alt_text?: string;
  duration?: number; // in seconds
}

interface Campaign {
  id: string;
  name: string;
  advertiser?: string;
  cta_text?: string;
  cta_url?: string;
  slides: Slide[];
}

const DEFAULT_SLIDE_DURATION = 5; // seconds

/**
 * WebStoriesViewer - Full screen viewer for WebStories campaigns
 * 
 * Features:
 * - 9:16 aspect ratio (1080x1920)
 * - Swipe/click navigation
 * - Progress bar
 * - "Patrocinado" badge
 * - CTA on last slide
 * - Event tracking: story_open, slide_view, story_complete, cta_click
 */
export function WebStoriesViewer({ storyId, campaignId, onClose, className }: WebStoriesViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['webstory-campaign', storyId, campaignId],
    queryFn: async () => {
      // If storyId provided, fetch specific story
      // Otherwise fetch campaign with webstories channel
      const query = supabase
        .from('campaigns_unified')
        .select(`
          id,
          name,
          advertiser,
          cta_text,
          cta_url,
          channels:campaign_channels!inner(
            channel_type,
            enabled
          ),
          assets:campaign_assets(
            id,
            file_url,
            alt_text,
            channel_type,
            format_key
          )
        `)
        .eq('status', 'active')
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`);

      if (campaignId) {
        query.eq('id', campaignId);
      }

      const { data, error } = await query.order('priority', { ascending: false }).limit(1).maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Check if webstories channel is enabled
      const hasWebStoriesChannel = data.channels?.some(
        (ch: { channel_type: string; enabled: boolean }) => 
          ch.channel_type === 'webstories' && ch.enabled
      );

      if (!hasWebStoriesChannel) return null;

      // Get webstories assets (1080x1920 or story format)
      const storyAssets = (data.assets as Array<{
        id: string;
        file_url: string;
        alt_text?: string | null;
        channel_type?: string | null;
        format_key?: string | null;
      }>)?.filter(
        (a) => a.channel_type === 'webstories' || a.format_key === '1080x1920'
      ) || [];

      if (storyAssets.length === 0) return null;

      const slides: Slide[] = storyAssets.map((asset) => ({
        id: asset.id,
        file_url: asset.file_url,
        alt_text: asset.alt_text || undefined,
        duration: DEFAULT_SLIDE_DURATION,
      }));

      return {
        id: data.id,
        name: data.name,
        advertiser: data.advertiser,
        cta_text: data.cta_text,
        cta_url: data.cta_url,
        slides,
      } as Campaign;
    },
    enabled: !!(storyId || campaignId) || true, // Also fetch random if no ID provided
    staleTime: 5 * 60 * 1000,
  });

  // Track story open
  useEffect(() => {
    if (campaign && !hasTrackedOpen) {
      trackCampaignEvent({
        campaignId: campaign.id,
        channelType: 'webstories',
        eventType: 'story_open',
        metadata: { totalSlides: campaign.slides.length },
      });
      setHasTrackedOpen(true);
    }
  }, [campaign, hasTrackedOpen]);

  // Track slide view
  useEffect(() => {
    if (campaign) {
      trackCampaignEvent({
        campaignId: campaign.id,
        channelType: 'webstories',
        eventType: 'slide_view',
        metadata: { slideIndex: currentSlide, slideId: campaign.slides[currentSlide]?.id },
      });
    }
  }, [campaign, currentSlide]);

  // Auto-progress timer
  useEffect(() => {
    if (!campaign || isPaused) return;

    const duration = (campaign.slides[currentSlide]?.duration || DEFAULT_SLIDE_DURATION) * 1000;
    const interval = 50; // Update progress every 50ms
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        if (currentSlide < campaign.slides.length - 1) {
          setCurrentSlide(prev => prev + 1);
          setProgress(0);
        } else {
          // Story complete
          trackCampaignEvent({
            campaignId: campaign.id,
            channelType: 'webstories',
            eventType: 'story_complete',
          });
          clearInterval(timer);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [campaign, currentSlide, isPaused]);

  const goToSlide = useCallback((index: number) => {
    if (!campaign) return;
    const clampedIndex = Math.max(0, Math.min(index, campaign.slides.length - 1));
    setCurrentSlide(clampedIndex);
    setProgress(0);
  }, [campaign]);

  const handlePrevious = () => goToSlide(currentSlide - 1);
  const handleNext = () => goToSlide(currentSlide + 1);

  const handleCTAClick = () => {
    if (!campaign?.cta_url) return;
    
    trackCampaignEvent({
      campaignId: campaign.id,
      channelType: 'webstories',
      eventType: 'cta_click',
      metadata: { cta_url: campaign.cta_url },
    });
    
    window.open(campaign.cta_url, '_blank');
  };

  const handleClose = () => {
    if (campaign) {
      // Track as click since 'close' is not in the enum
      trackCampaignEvent({
        campaignId: campaign.id,
        channelType: 'webstories',
        eventType: 'click',
        metadata: { action: 'close', lastSlideViewed: currentSlide },
      });
    }
    onClose?.();
  };

  if (isLoading || !campaign) {
    return null;
  }

  const isLastSlide = currentSlide === campaign.slides.length - 1;
  const currentSlideData = campaign.slides[currentSlide];

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black flex items-center justify-center",
        className
      )}
    >
      {/* Story container - 9:16 aspect ratio */}
      <div className="relative w-full h-full max-w-[430px] max-h-[932px] md:max-h-[90vh] bg-black overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {campaign.slides.map((_, index) => (
            <div 
              key={index}
              className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div 
                className="h-full bg-white transition-all duration-50 ease-linear"
                style={{ 
                  width: index < currentSlide ? '100%' : 
                         index === currentSlide ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black/50 text-white text-xs rounded font-medium">
              Patrocinado
            </span>
            {campaign.advertiser && (
              <span className="text-white/80 text-sm">{campaign.advertiser}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsPaused(p => !p)}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide image */}
        <img
          src={currentSlideData?.file_url}
          alt={currentSlideData?.alt_text || campaign.name}
          className="w-full h-full object-cover"
        />

        {/* Navigation areas */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
          onClick={handlePrevious}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
          onClick={handleNext}
        />

        {/* Navigation buttons (visible on hover) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-black/30 text-white hover:bg-black/50 rounded-full"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-black/30 text-white hover:bg-black/50 rounded-full"
            onClick={handleNext}
            disabled={isLastSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* CTA on last slide */}
        {isLastSlide && campaign.cta_url && (
          <div className="absolute bottom-8 left-4 right-4 z-20">
            <Button
              onClick={handleCTAClick}
              className="w-full h-12 text-lg font-semibold"
            >
              {campaign.cta_text || 'Saiba mais'}
            </Button>
          </div>
        )}

        {/* Slide counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <span className="text-white/60 text-sm">
            {currentSlide + 1} / {campaign.slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WebStoriesViewer;
