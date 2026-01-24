import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Youtube, Facebook, MessageCircle, Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStudioOverlays } from "@/hooks/useStudioOverlays";
import { useExternalChatStatus } from "@/hooks/useExternalChatStatus";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  platform: 'youtube' | 'facebook' | 'internal' | 'illumina';
  author: string;
  message: string;
  timestamp: Date;
  avatarUrl?: string;
}

interface UnifiedChatPanelProps {
  sessionId?: string;
}

const getPlatformIcon = (platform: ChatMessage['platform']) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="h-3 w-3 text-red-500" />;
    case 'facebook':
      return <Facebook className="h-3 w-3 text-blue-500" />;
    case 'internal':
    case 'illumina':
      return <MessageCircle className="h-3 w-3 text-primary" />;
  }
};

const getPlatformColor = (platform: ChatMessage['platform']) => {
  switch (platform) {
    case 'youtube':
      return 'border-l-red-500';
    case 'facebook':
      return 'border-l-blue-500';
    case 'internal':
    case 'illumina':
      return 'border-l-primary';
  }
};

export function UnifiedChatPanel({ sessionId }: UnifiedChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | ChatMessage['platform']>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Host';
  
  const { showCommentHighlight } = useStudioOverlays(sessionId || '');
  const chatStatus = useExternalChatStatus(sessionId);

  // Fetch internal messages from illumina_chat_messages
  const fetchInternalMessages = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('illumina_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) {
        console.error('[UnifiedChatPanel] Internal fetch error:', error);
        return;
      }
      
      const internalMsgs: ChatMessage[] = (data || []).map((msg) => ({
        id: msg.id,
        platform: (msg.platform || 'internal') as ChatMessage['platform'],
        author: msg.user_name,
        message: msg.message,
        timestamp: new Date(msg.created_at),
        avatarUrl: msg.user_avatar_url || undefined,
      }));
      
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = internalMsgs.filter(m => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        return [...prev, ...newMsgs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    } catch (error) {
      console.error('[UnifiedChatPanel] Internal fetch error:', error);
    }
  }, [sessionId]);

  // Fetch YouTube chat messages
  const fetchYouTubeChat = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('conexao-chat-youtube', {
        body: { live_chat_id: sessionId },
      });
      
      if (error) throw error;
      
      const ytMessages: ChatMessage[] = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        platform: 'youtube' as const,
        author: msg.author,
        message: msg.message,
        timestamp: new Date(msg.timestamp),
        avatarUrl: msg.avatarUrl,
      }));
      
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = ytMessages.filter(m => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        return [...prev, ...newMsgs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    } catch (error) {
      console.error('[UnifiedChatPanel] YouTube fetch error:', error);
    }
  }, [sessionId]);

  // Fetch Facebook comments
  const fetchFacebookComments = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('conexao-chat-facebook', {
        body: { video_id: sessionId },
      });
      
      if (error) throw error;
      
      const fbMessages: ChatMessage[] = (data.comments || []).map((msg: any) => ({
        id: msg.id,
        platform: 'facebook' as const,
        author: msg.author,
        message: msg.message,
        timestamp: new Date(msg.timestamp),
        avatarUrl: msg.avatarUrl,
      }));
      
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = fbMessages.filter(m => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        return [...prev, ...newMsgs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    } catch (error) {
      console.error('[UnifiedChatPanel] Facebook fetch error:', error);
    }
  }, [sessionId]);

  // Initial load and polling for all chat sources
  useEffect(() => {
    if (!sessionId) return;
    
    setIsLoading(true);
    
    // Initial fetch from all sources
    Promise.all([
      fetchInternalMessages(),
      fetchYouTubeChat(),
      fetchFacebookComments()
    ]).finally(() => setIsLoading(false));
    
    // Poll external sources every 5 seconds
    const interval = setInterval(() => {
      fetchYouTubeChat();
      fetchFacebookComments();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId, fetchInternalMessages, fetchYouTubeChat, fetchFacebookComments]);

  // Subscribe to internal chat via Realtime using illumina_chat_messages
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`illumina-chat-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'illumina_chat_messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const newMsg = payload.new as any;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            platform: (newMsg.platform || 'internal') as ChatMessage['platform'],
            author: newMsg.user_name,
            message: newMsg.message,
            timestamp: new Date(newMsg.created_at),
            avatarUrl: newMsg.user_avatar_url,
          }].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.platform === filter || (filter === 'internal' && m.platform === 'illumina'));

  const handleSend = async () => {
    if (!newMessage.trim() || !sessionId) return;
    
    setIsSending(true);
    
    try {
      // Insert into illumina_chat_messages
      const { error } = await supabase
        .from('illumina_chat_messages')
        .insert({
          session_id: sessionId,
          message: newMessage.trim(),
          user_name: userName,
          user_id: user?.id,
          platform: 'illumina',
        });
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('[UnifiedChatPanel] Send error:', error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleHighlight = (msg: ChatMessage) => {
    showCommentHighlight({
      author: msg.author,
      message: msg.message,
      platform: msg.platform === 'illumina' ? 'internal' : msg.platform,
      avatarUrl: msg.avatarUrl,
    }, 8000);
    toast.success("Comentário destacado na tela!");
  };

  const getStatusIcon = (configured: boolean) => {
    if (configured) {
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    }
    return <AlertCircle className="h-3 w-3 text-yellow-500" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs with status indicators */}
      <div className="shrink-0 flex gap-1 p-2 border-b border-zinc-800">
        <Badge 
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          Todos
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={filter === 'youtube' ? 'default' : 'outline'}
              className="cursor-pointer gap-1"
              onClick={() => setFilter('youtube')}
            >
              <Youtube className="h-3 w-3" />
              {getStatusIcon(chatStatus.youtube.configured)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {chatStatus.youtube.configured 
              ? "YouTube conectado" 
              : "YouTube (modo demo - configure YOUTUBE_API_KEY)"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={filter === 'facebook' ? 'default' : 'outline'}
              className="cursor-pointer gap-1"
              onClick={() => setFilter('facebook')}
            >
              <Facebook className="h-3 w-3" />
              {getStatusIcon(chatStatus.facebook.configured)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {chatStatus.facebook.configured 
              ? "Facebook conectado" 
              : "Facebook (modo demo - configure FACEBOOK_ACCESS_TOKEN)"}
          </TooltipContent>
        </Tooltip>
        <Badge 
          variant={filter === 'internal' ? 'default' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => setFilter('internal')}
        >
          <MessageCircle className="h-3 w-3" />
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
          )}
          
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "group p-2 rounded-lg bg-zinc-800/50 border-l-2 relative",
                getPlatformColor(msg.platform)
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {getPlatformIcon(msg.platform)}
                <span className="text-xs font-medium text-zinc-300">
                  {msg.author}
                </span>
                <span className="text-[10px] text-zinc-500 ml-auto">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-zinc-100 pr-8">{msg.message}</p>
              
              {/* Highlight button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleHighlight(msg)}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Destacar na tela</TooltipContent>
              </Tooltip>
            </div>
          ))}

          {!isLoading && filteredMessages.length === 0 && (
            <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">
              Nenhuma mensagem ainda
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <Input
            placeholder="Enviar mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="bg-zinc-800 border-zinc-700"
            disabled={isSending}
          />
          <Button size="icon" onClick={handleSend} disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
