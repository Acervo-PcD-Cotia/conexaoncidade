import { Tv, Monitor, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BrBroadcast } from "@/hooks/useBrasileiraoNews";

interface WhereToWatchCardProps {
  broadcast: BrBroadcast;
  variant?: 'compact' | 'full';
  className?: string;
}

const CHANNEL_STYLES: Record<string, { bg: string; text: string }> = {
  // TV Aberta (green)
  'Globo': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
  'Band': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
  'Record': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
  'SBT': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
  // TV Fechada (blue)
  'SporTV': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
  'Premiere': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
  'ESPN': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
  'TNT Sports': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
  // Streaming (purple)
  'Globoplay': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
  'Prime Video': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
  'Star+': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
  'Paramount+': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
  'CazéTV': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
};

function getChannelStyle(channel: string) {
  return CHANNEL_STYLES[channel] || { 
    bg: 'bg-muted', 
    text: 'text-muted-foreground' 
  };
}

function ChannelBadge({ channel }: { channel: string }) {
  const style = getChannelStyle(channel);
  return (
    <Badge variant="secondary" className={cn(style.bg, style.text, "font-medium")}>
      {channel}
    </Badge>
  );
}

export function WhereToWatchCard({ broadcast, variant = 'full', className }: WhereToWatchCardProps) {
  const hasAnyBroadcast = 
    (broadcast.tv_open?.length ?? 0) > 0 || 
    (broadcast.tv_closed?.length ?? 0) > 0 || 
    (broadcast.streaming?.length ?? 0) > 0;

  if (!hasAnyBroadcast) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {broadcast.tv_open?.map((channel) => (
          <ChannelBadge key={channel} channel={channel} />
        ))}
        {broadcast.tv_closed?.map((channel) => (
          <ChannelBadge key={channel} channel={channel} />
        ))}
        {broadcast.streaming?.map((channel) => (
          <ChannelBadge key={channel} channel={channel} />
        ))}
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Tv className="h-4 w-4 text-primary" />
          Onde Assistir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {broadcast.tv_open && broadcast.tv_open.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">TV Aberta</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {broadcast.tv_open.map((channel) => (
                <ChannelBadge key={channel} channel={channel} />
              ))}
            </div>
          </div>
        )}

        {broadcast.tv_closed && broadcast.tv_closed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tv className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">TV por Assinatura</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {broadcast.tv_closed.map((channel) => (
                <ChannelBadge key={channel} channel={channel} />
              ))}
            </div>
          </div>
        )}

        {broadcast.streaming && broadcast.streaming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-medium text-muted-foreground">Streaming</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {broadcast.streaming.map((channel) => (
                <ChannelBadge key={channel} channel={channel} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
