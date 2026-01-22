import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Youtube, Facebook, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  platform: 'youtube' | 'facebook' | 'internal';
  author: string;
  message: string;
  timestamp: Date;
  avatarUrl?: string;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    platform: 'youtube',
    author: 'João Silva',
    message: 'Muito bom o conteúdo! 👏',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    platform: 'facebook',
    author: 'Maria Santos',
    message: 'Qual o tema de hoje?',
    timestamp: new Date(Date.now() - 45000),
  },
  {
    id: '3',
    platform: 'internal',
    author: 'Admin',
    message: 'Bem-vindos ao programa!',
    timestamp: new Date(Date.now() - 30000),
  },
];

const getPlatformIcon = (platform: ChatMessage['platform']) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="h-3 w-3 text-red-500" />;
    case 'facebook':
      return <Facebook className="h-3 w-3 text-blue-500" />;
    case 'internal':
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
      return 'border-l-primary';
  }
};

export function UnifiedChatPanel() {
  const [messages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | ChatMessage['platform']>('all');

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.platform === filter);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // Would send message to all platforms
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs */}
      <div className="shrink-0 flex gap-1 p-2 border-b border-zinc-800">
        <Badge 
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          Todos
        </Badge>
        <Badge 
          variant={filter === 'youtube' ? 'default' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => setFilter('youtube')}
        >
          <Youtube className="h-3 w-3" />
        </Badge>
        <Badge 
          variant={filter === 'facebook' ? 'default' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => setFilter('facebook')}
        >
          <Facebook className="h-3 w-3" />
        </Badge>
        <Badge 
          variant={filter === 'internal' ? 'default' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => setFilter('internal')}
        >
          <MessageCircle className="h-3 w-3" />
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "p-2 rounded-lg bg-zinc-800/50 border-l-2",
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
              <p className="text-sm text-zinc-100">{msg.message}</p>
            </div>
          ))}

          {filteredMessages.length === 0 && (
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="bg-zinc-800 border-zinc-700"
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
