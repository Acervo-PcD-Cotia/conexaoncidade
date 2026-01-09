import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCommunityShares } from '@/hooks/useCommunityShares';
import { useAuth } from '@/contexts/AuthContext';

interface ShareButtonsProps {
  url: string;
  title: string;
  contentId?: string;
  contentType?: 'news' | 'project' | 'campaign' | 'story';
}

export function ShareButtons({ url, title, contentId, contentType = 'news' }: ShareButtonsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { registerShare } = useCommunityShares();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: 'facebook' | 'x' | 'linkedin' | 'whatsapp', shareUrl: string) => {
    window.open(shareUrl, '_blank');
    
    // Track share for community gamification if user is logged in and contentId is provided
    if (user && contentId) {
      registerShare({
        contentType,
        contentId,
        platform: platform === 'x' ? 'x' : platform,
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência',
      });
      
      // Track copy as share for community
      if (user && contentId) {
        registerShare({
          contentType,
          contentId,
          platform: 'copy',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível copiar o link',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">Compartilhar:</span>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleShare('facebook', shareLinks.facebook)}
        aria-label="Compartilhar no Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleShare('x', shareLinks.twitter)}
        aria-label="Compartilhar no Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleShare('linkedin', shareLinks.linkedin)}
        aria-label="Compartilhar no LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
        aria-label="Compartilhar no WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={copyToClipboard}
        aria-label="Copiar link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}