import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OverlayType = "logo" | "lower-third" | "ticker" | "banner" | "comment-highlight";
export type OverlayPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "bottom";

export interface Overlay {
  id: string;
  sessionId: string;
  type: OverlayType;
  name: string;
  isVisible: boolean;
  position: OverlayPosition;
  content: LowerThirdContent | TickerContent | LogoContent | BannerContent | CommentHighlightContent | Record<string, unknown>;
  style: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LowerThirdContent {
  name: string;
  title: string;
  subtitle?: string;
}

export interface TickerContent {
  text: string;
  speed?: number; // pixels per second
  loop?: boolean;
}

export interface LogoContent {
  imageUrl: string;
  width?: number;
  height?: number;
  opacity?: number;
}

export interface BannerContent {
  text: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CommentHighlightContent {
  author: string;
  message: string;
  avatarUrl?: string;
  platform?: string;
}

export interface UseStudioOverlaysReturn {
  // Data
  overlays: Overlay[];
  isLoading: boolean;
  error: string | null;
  
  // Active overlays
  visibleOverlays: Overlay[];
  
  // CRUD operations
  createOverlay: (overlay: Partial<Overlay>) => Promise<Overlay>;
  updateOverlay: (id: string, updates: Partial<Overlay>) => Promise<void>;
  deleteOverlay: (id: string) => Promise<void>;
  
  // Aliases for compatibility
  addOverlay: (overlay: Partial<Overlay>) => Promise<Overlay>;
  removeOverlay: (id: string) => Promise<void>;
  
  // Visibility controls
  showOverlay: (id: string) => Promise<void>;
  hideOverlay: (id: string) => Promise<void>;
  toggleOverlay: (id: string) => Promise<void>;
  hideAllOverlays: () => Promise<void>;
  
  // Quick actions
  showLowerThird: (content: LowerThirdContent, duration?: number) => Promise<void>;
  showTicker: (content: TickerContent) => Promise<void>;
  hideTicker: () => Promise<void>;
  showCommentHighlight: (content: CommentHighlightContent, duration?: number) => Promise<void>;
  
  // State
  isUpdating: boolean;
}

export function useStudioOverlays(sessionId: string): UseStudioOverlaysReturn {
  const queryClient = useQueryClient();
  const [activeTemporary, setActiveTemporary] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch overlays from database (using session metadata for now)
  // In production, this would be a dedicated overlays table
  const { data: overlays = [], isLoading, error } = useQuery({
    queryKey: ["studio-overlays", sessionId],
    queryFn: async () => {
      // For now, return local state since we don't have overlays table
      // This would be: supabase.from("illumina_overlays").select("*").eq("session_id", sessionId)
      const stored = localStorage.getItem(`studio-overlays-${sessionId}`);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!sessionId,
  });

  // Save overlays to local storage (would be database in production)
  const saveOverlays = useCallback((newOverlays: Overlay[]) => {
    localStorage.setItem(`studio-overlays-${sessionId}`, JSON.stringify(newOverlays));
    queryClient.setQueryData(["studio-overlays", sessionId], newOverlays);
  }, [sessionId, queryClient]);

  const visibleOverlays = overlays.filter((o: Overlay) => o.isVisible);

  const createOverlay = useCallback(async (overlay: Partial<Overlay>): Promise<Overlay> => {
    const newOverlay: Overlay = {
      id: crypto.randomUUID(),
      sessionId,
      type: overlay.type || "logo",
      name: overlay.name || "New Overlay",
      isVisible: overlay.isVisible ?? false,
      position: overlay.position || "bottom-left",
      content: overlay.content || {},
      style: overlay.style || {},
      sortOrder: overlay.sortOrder ?? overlays.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [...overlays, newOverlay];
    saveOverlays(updated);
    return newOverlay;
  }, [sessionId, overlays, saveOverlays]);

  const updateOverlay = useCallback(async (id: string, updates: Partial<Overlay>): Promise<void> => {
    const updated = overlays.map((o: Overlay) => 
      o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    saveOverlays(updated);
  }, [overlays, saveOverlays]);

  const deleteOverlay = useCallback(async (id: string): Promise<void> => {
    const updated = overlays.filter((o: Overlay) => o.id !== id);
    saveOverlays(updated);
    
    // Clear any timeout
    const timeout = activeTemporary.get(id);
    if (timeout) {
      clearTimeout(timeout);
      activeTemporary.delete(id);
    }
  }, [overlays, saveOverlays, activeTemporary]);

  const showOverlay = useCallback(async (id: string): Promise<void> => {
    await updateOverlay(id, { isVisible: true });
  }, [updateOverlay]);

  const hideOverlay = useCallback(async (id: string): Promise<void> => {
    await updateOverlay(id, { isVisible: false });
  }, [updateOverlay]);

  const toggleOverlay = useCallback(async (id: string): Promise<void> => {
    const overlay = overlays.find((o: Overlay) => o.id === id);
    if (overlay) {
      await updateOverlay(id, { isVisible: !overlay.isVisible });
    }
  }, [overlays, updateOverlay]);

  const hideAllOverlays = useCallback(async (): Promise<void> => {
    const updated = overlays.map((o: Overlay) => ({ ...o, isVisible: false }));
    saveOverlays(updated);
  }, [overlays, saveOverlays]);

  // Quick action: Show lower third with optional auto-hide
  const showLowerThird = useCallback(async (content: LowerThirdContent, duration?: number): Promise<void> => {
    const existingLowerThird = overlays.find((o: Overlay) => o.type === "lower-third");
    
    if (existingLowerThird) {
      await updateOverlay(existingLowerThird.id, {
        content,
        isVisible: true,
      });
      
      if (duration) {
        const existingTimeout = activeTemporary.get(existingLowerThird.id);
        if (existingTimeout) clearTimeout(existingTimeout);
        
        const timeout = setTimeout(() => {
          hideOverlay(existingLowerThird.id);
          activeTemporary.delete(existingLowerThird.id);
        }, duration);
        
        setActiveTemporary(new Map(activeTemporary.set(existingLowerThird.id, timeout)));
      }
    } else {
      const newOverlay = await createOverlay({
        type: "lower-third",
        name: "Lower Third",
        position: "bottom-left",
        content,
        isVisible: true,
      });
      
      if (duration) {
        const timeout = setTimeout(() => {
          hideOverlay(newOverlay.id);
        }, duration);
        
        setActiveTemporary(new Map(activeTemporary.set(newOverlay.id, timeout)));
      }
    }
  }, [overlays, createOverlay, updateOverlay, hideOverlay, activeTemporary]);

  // Quick action: Show ticker
  const showTicker = useCallback(async (content: TickerContent): Promise<void> => {
    const existingTicker = overlays.find((o: Overlay) => o.type === "ticker");
    
    if (existingTicker) {
      await updateOverlay(existingTicker.id, {
        content,
        isVisible: true,
      });
    } else {
      await createOverlay({
        type: "ticker",
        name: "Ticker",
        position: "bottom",
        content,
        isVisible: true,
      });
    }
  }, [overlays, createOverlay, updateOverlay]);

  // Quick action: Hide ticker
  const hideTicker = useCallback(async (): Promise<void> => {
    const existingTicker = overlays.find((o: Overlay) => o.type === "ticker");
    if (existingTicker) {
      await hideOverlay(existingTicker.id);
    }
  }, [overlays, hideOverlay]);

  // Quick action: Show comment highlight
  const showCommentHighlight = useCallback(async (content: CommentHighlightContent, duration = 8000): Promise<void> => {
    const newOverlay = await createOverlay({
      type: "comment-highlight",
      name: "Comment",
      position: "bottom-left",
      content,
      isVisible: true,
    });
    
    // Auto-hide and delete after duration
    const timeout = setTimeout(async () => {
      await deleteOverlay(newOverlay.id);
    }, duration);
    
    setActiveTemporary(new Map(activeTemporary.set(newOverlay.id, timeout)));
  }, [createOverlay, deleteOverlay, activeTemporary]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      activeTemporary.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    overlays,
    isLoading,
    error: error ? String(error) : null,
    visibleOverlays,
    createOverlay,
    updateOverlay,
    deleteOverlay,
    addOverlay: createOverlay,
    removeOverlay: deleteOverlay,
    showOverlay,
    hideOverlay,
    toggleOverlay,
    hideAllOverlays,
    showLowerThird,
    showTicker,
    hideTicker,
    showCommentHighlight,
    isUpdating: false,
  };
}
