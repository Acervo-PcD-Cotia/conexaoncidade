import { useState, useEffect, useRef } from "react";
import { Send, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBroadcastChat, useSendChatMessage, BroadcastChatMessage } from "@/hooks/useBroadcast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BroadcastChatProps {
  broadcastId: string;
  isLive?: boolean;
  className?: string;
}

export default function BroadcastChat({ broadcastId, isLive = true, className }: BroadcastChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<BroadcastChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: initialMessages } = useBroadcastChat(broadcastId);
  const sendMessage = useSendChatMessage();

  // Initialize messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${broadcastId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "broadcast_chat_messages",
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        (payload) => {
          const newMessage = payload.new as BroadcastChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "broadcast_chat_messages",
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as BroadcastChatMessage;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            ).filter((msg) => !msg.is_deleted)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;

    await sendMessage.mutateAsync({
      broadcastId,
      message: message.trim(),
      userName: user.email?.split("@")[0] || "Usuário",
      userAvatarUrl: undefined,
    });

    setMessage("");
  };

  const pinnedMessages = messages.filter((msg) => msg.is_pinned);

  return (
    <div className={cn("flex flex-col bg-card rounded-lg border h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          Chat ao Vivo
          {isLive && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </h3>
        <p className="text-xs text-muted-foreground">
          {messages.length} mensagens
        </p>
      </div>

      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <div className="p-2 bg-primary/10 border-b">
          {pinnedMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 text-sm">
              <Pin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-primary">{msg.user_name}:</span>{" "}
                <span>{msg.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.filter((m) => !m.is_pinned).map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.user_avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {msg.user_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm">{msg.user_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        {user ? (
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              maxLength={500}
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            <a href="/auth" className="text-primary hover:underline">
              Faça login
            </a>{" "}
            para participar do chat
          </p>
        )}
      </form>
    </div>
  );
}
