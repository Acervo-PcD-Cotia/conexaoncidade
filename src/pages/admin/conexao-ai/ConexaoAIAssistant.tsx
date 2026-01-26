import { useState, useEffect } from "react";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIChat } from "@/components/conexao-ai/AIChat";
import {
  useConversations,
  useConversationMessages,
  useCreateConversation,
  useSendToAssistant,
} from "@/hooks/useConexaoAI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ConexaoAIAssistant() {
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const { data: messages, isLoading: loadingMessages } = useConversationMessages(
    selectedConversationId || undefined
  );
  const createConversation = useCreateConversation();
  const sendToAssistant = useSendToAssistant();

  // Auto-select first conversation or create new one
  useEffect(() => {
    if (!loadingConversations && conversations) {
      if (conversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(conversations[0].id);
      }
    }
  }, [conversations, loadingConversations, selectedConversationId]);

  const handleNewConversation = async () => {
    try {
      const newConversation = await createConversation.mutateAsync("general");
      setSelectedConversationId(newConversation.id);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversationId) {
      // Create a new conversation first
      try {
        const newConversation = await createConversation.mutateAsync("general");
        setSelectedConversationId(newConversation.id);
        await sendToAssistant.mutateAsync({
          conversationId: newConversation.id,
          message,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    } else {
      try {
        await sendToAssistant.mutateAsync({
          conversationId: selectedConversationId,
          message,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/conexao-ai")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Assistente Inteligente</h1>
          <p className="text-sm text-muted-foreground">
            Tire dúvidas sobre o Portal Conexão na Cidade
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 gap-4 pt-4 overflow-hidden">
        {/* Sidebar - Conversations */}
        <div className="hidden w-64 flex-shrink-0 flex-col rounded-lg border bg-card md:flex">
          <div className="flex items-center justify-between border-b p-3">
            <h2 className="text-sm font-medium">Conversas</h2>
            <Button variant="ghost" size="icon" onClick={handleNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md p-3 text-left text-sm transition-colors",
                      selectedConversationId === conversation.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="font-medium line-clamp-1">
                      {conversation.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conversation.updated_at), "dd MMM, HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma conversa ainda
                </p>
                <Button size="sm" onClick={handleNewConversation}>
                  Nova conversa
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col rounded-lg border bg-card overflow-hidden">
          {selectedConversationId || (!loadingConversations && conversations?.length === 0) ? (
            <AIChat
              messages={messages || []}
              onSendMessage={handleSendMessage}
              isLoading={sendToAssistant.isPending || loadingMessages}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Selecione ou inicie uma conversa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
