import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ConexaoAIConversation,
  ConexaoAIMessage,
  ConexaoAIContentDraft,
  ConexaoAIAutomation,
  ConexaoAIAutomationLog,
  ConexaoAIToolUsage,
  ContentDraftData,
} from "@/types/conexao-ai";
import type { Json } from "@/integrations/supabase/types";

// ============================================
// CONVERSATIONS
// ============================================

export function useConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conexao-ai-conversations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conexao_ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as ConexaoAIConversation[];
    },
    enabled: !!user,
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conexao-ai-conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      const { data, error } = await supabase
        .from('conexao_ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      return data as ConexaoAIConversation;
    },
    enabled: !!conversationId,
  });
}

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conexao-ai-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('conexao_ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ConexaoAIMessage[];
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (context: string = 'general') => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conexao_ai_conversations')
        .insert({
          user_id: user.id,
          context,
          title: 'Nova conversa',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ConexaoAIConversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conexao-ai-conversations'] });
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      conversationId,
      role,
      content,
      metadata = {},
    }: {
      conversationId: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('conexao_ai_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          metadata: metadata as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update conversation timestamp
      await supabase
        .from('conexao_ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return data as ConexaoAIMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['conexao-ai-messages', variables.conversationId] 
      });
      queryClient.invalidateQueries({ queryKey: ['conexao-ai-conversations'] });
    },
  });
}

// ============================================
// CONTENT DRAFTS
// ============================================

export function useContentDrafts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conexao-ai-drafts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conexao_ai_content_drafts')
        .select('*')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ConexaoAIContentDraft[];
    },
    enabled: !!user,
  });
}

export function useContentDraft(draftId: string | undefined) {
  return useQuery({
    queryKey: ['conexao-ai-draft', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      
      const { data, error } = await supabase
        .from('conexao_ai_content_drafts')
        .select('*')
        .eq('id', draftId)
        .single();
      
      if (error) throw error;
      return data as unknown as ConexaoAIContentDraft;
    },
    enabled: !!draftId,
  });
}

export function useCreateContentDraft() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      type = 'news',
      title,
      content,
    }: {
      type?: 'news' | 'pcd' | 'instagram' | 'facebook';
      title?: string;
      content: ContentDraftData;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conexao_ai_content_drafts')
        .insert({
          user_id: user.id,
          type,
          title,
          content: content as unknown as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as ConexaoAIContentDraft;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conexao-ai-drafts'] });
    },
  });
}

export function useUpdateContentDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      draftId,
      updates,
    }: {
      draftId: string;
      updates: {
        title?: string;
        content?: ContentDraftData;
        status?: 'draft' | 'published' | 'discarded';
        published_id?: string;
      };
    }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content as unknown as Json;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.published_id !== undefined) updateData.published_id = updates.published_id;
      
      const { data, error } = await supabase
        .from('conexao_ai_content_drafts')
        .update(updateData)
        .eq('id', draftId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as ConexaoAIContentDraft;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conexao-ai-draft', variables.draftId] });
      queryClient.invalidateQueries({ queryKey: ['conexao-ai-drafts'] });
    },
  });
}

// ============================================
// AUTOMATIONS
// ============================================

export function useAutomations() {
  return useQuery({
    queryKey: ['conexao-ai-automations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conexao_ai_automations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ConexaoAIAutomation[];
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      automationId,
      isActive,
    }: {
      automationId: string;
      isActive: boolean;
    }) => {
      const { data, error } = await supabase
        .from('conexao_ai_automations')
        .update({ is_active: isActive })
        .eq('id', automationId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as ConexaoAIAutomation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conexao-ai-automations'] });
    },
  });
}

export function useAutomationLogs(limit = 50) {
  return useQuery({
    queryKey: ['conexao-ai-automation-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conexao_ai_automation_logs')
        .select('*, conexao_ai_automations(name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as unknown as (ConexaoAIAutomationLog & { conexao_ai_automations: { name: string } | null })[];
    },
  });
}

// ============================================
// TOOL USAGE
// ============================================

export function useTrackToolUsage() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      toolId,
      toolName,
      inputData,
      outputData,
    }: {
      toolId: string;
      toolName: string;
      inputData: Record<string, unknown>;
      outputData: Record<string, unknown>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conexao_ai_tool_usage')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          tool_name: toolName,
          input_data: inputData as Json,
          output_data: outputData as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as ConexaoAIToolUsage;
    },
  });
}

export function useToolUsageStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conexao-ai-tool-usage-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conexao_ai_tool_usage')
        .select('tool_id, tool_name, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Aggregate by tool
      const stats = data.reduce((acc, item) => {
        if (!acc[item.tool_id]) {
          acc[item.tool_id] = {
            tool_id: item.tool_id,
            tool_name: item.tool_name,
            count: 0,
            last_used: item.created_at,
          };
        }
        acc[item.tool_id].count++;
        return acc;
      }, {} as Record<string, { tool_id: string; tool_name: string | null; count: number; last_used: string }>);
      
      return Object.values(stats);
    },
    enabled: !!user,
  });
}

// ============================================
// AI ASSISTANT HOOK
// ============================================

export function useSendToAssistant() {
  const addMessage = useAddMessage();
  
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => {
      // Add user message
      await addMessage.mutateAsync({
        conversationId,
        role: 'user',
        content: message,
      });
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('conexao-ai-assistant', {
        body: {
          message,
          conversation_id: conversationId,
        },
      });
      
      if (error) throw error;
      
      // Add assistant response
      await addMessage.mutateAsync({
        conversationId,
        role: 'assistant',
        content: data.message,
        metadata: { actions: data.actions || [] },
      });
      
      return data;
    },
  });
}

// ============================================
// CONTENT GENERATION HOOK
// ============================================

export function useGenerateContent() {
  return useMutation({
    mutationFn: async ({
      input,
      type,
      variants = ['news'],
    }: {
      input: string;
      type: 'theme' | 'draft' | 'url';
      variants?: ('news' | 'pcd' | 'instagram' | 'facebook')[];
    }) => {
      const { data, error } = await supabase.functions.invoke('conexao-ai-content', {
        body: { input, type, variants },
      });
      
      if (error) throw error;
      return data;
    },
  });
}
