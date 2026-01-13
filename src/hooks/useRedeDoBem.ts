import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type HelpRequestType = "need_help" | "can_help" | "volunteer" | "donation";
export type HelpRequestStatus = "open" | "in_progress" | "resolved";

export interface HelpRequest {
  id: string;
  user_id: string;
  type: HelpRequestType;
  category: string;
  title: string;
  description: string | null;
  neighborhood: string | null;
  status: HelpRequestStatus;
  is_urgent: boolean;
  created_at: string;
  resolved_at: string | null;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface HelpResponse {
  id: string;
  request_id: string;
  user_id: string;
  message: string | null;
  created_at: string;
  responder?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useRedeDoBem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all help requests
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["help-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_help_requests")
        .select(`
          *,
          author:profiles!community_help_requests_user_id_fkey(full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HelpRequest[];
    },
    enabled: !!user,
  });

  // Create help request
  const createRequest = useMutation({
    mutationFn: async (data: {
      type: HelpRequestType;
      category: string;
      title: string;
      description?: string;
      neighborhood?: string;
      is_urgent?: boolean;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: result, error } = await supabase
        .from("community_help_requests")
        .insert({
          user_id: user.id,
          type: data.type,
          category: data.category,
          title: data.title,
          description: data.description || null,
          neighborhood: data.neighborhood || null,
          is_urgent: data.is_urgent || false,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-requests"] });
      toast({
        title: "Solicitação criada",
        description: "Sua solicitação foi publicada na Rede do Bem!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar solicitação",
        description: error.message,
      });
    },
  });

  // Respond to help request
  const respondToRequest = useMutation({
    mutationFn: async (data: { request_id: string; message?: string }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: result, error } = await supabase
        .from("community_help_responses")
        .insert({
          request_id: data.request_id,
          user_id: user.id,
          message: data.message || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-requests"] });
      toast({
        title: "Resposta enviada",
        description: "Obrigado por ajudar! O solicitante será notificado.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao responder",
        description: error.message,
      });
    },
  });

  // Update request status
  const updateStatus = useMutation({
    mutationFn: async (data: { id: string; status: HelpRequestStatus }) => {
      const { error } = await supabase
        .from("community_help_requests")
        .update({
          status: data.status,
          resolved_at: data.status === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-requests"] });
      toast({
        title: "Status atualizado",
        description: "O status da solicitação foi atualizado com sucesso.",
      });
    },
  });

  // Get stats
  const stats = {
    need_help: requests?.filter((r) => r.type === "need_help").length || 0,
    can_help: requests?.filter((r) => r.type === "can_help").length || 0,
    volunteer: requests?.filter((r) => r.type === "volunteer").length || 0,
    donation: requests?.filter((r) => r.type === "donation").length || 0,
    open: requests?.filter((r) => r.status === "open").length || 0,
    resolved: requests?.filter((r) => r.status === "resolved").length || 0,
  };

  return {
    requests,
    isLoading,
    error,
    stats,
    createRequest,
    respondToRequest,
    updateStatus,
  };
}
