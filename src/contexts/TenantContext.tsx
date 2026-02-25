import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

const TENANT_CACHE_KEY = "cached_tenant_id";

interface TenantContextType {
  currentTenantId: string | null;
  setCurrentTenantId: (id: string | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTenantId, setCurrentTenantIdState] = useState<string | null>(() => {
    // Try to restore from cache immediately for faster initial render
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TENANT_CACHE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper to also persist to localStorage
  const setCurrentTenantId = (id: string | null) => {
    setCurrentTenantIdState(id);
    if (id) {
      localStorage.setItem(TENANT_CACHE_KEY, id);
    } else {
      localStorage.removeItem(TENANT_CACHE_KEY);
    }
  };

  useEffect(() => {
    const fetchDefaultTenant = async () => {
      // For anonymous users on public routes, use cached or skip DB calls entirely
      if (!user) {
        const cached = localStorage.getItem(TENANT_CACHE_KEY);
        if (cached) {
          setCurrentTenantIdState(cached);
        } else {
          // Fetch first site once and cache it — no auth queries needed
          try {
            const { data: fallbackSite } = await supabase
              .from("sites")
              .select("id")
              .limit(1)
              .maybeSingle();
            if (fallbackSite?.id) {
              setCurrentTenantId(fallbackSite.id);
            } else {
              setCurrentTenantIdState(null);
            }
          } catch {
            setCurrentTenantIdState(null);
          }
        }
        setIsLoading(false);
        return;
      }

      // Authenticated user — use cached value while validating
      const cached = localStorage.getItem(TENANT_CACHE_KEY);
      if (cached) {
        setCurrentTenantIdState(cached);
      }
      setIsLoading(true);

      try {
        // Check user's site assignment directly (skip role check for speed)
        const { data: siteUser } = await supabase
          .from("site_users")
          .select("site_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (siteUser?.site_id) {
          setCurrentTenantId(siteUser.site_id);
          setIsLoading(false);
          return;
        }

        // Fallback - get first available site
        const { data: fallbackSite } = await supabase
          .from("sites")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (fallbackSite?.id) {
          setCurrentTenantId(fallbackSite.id);
        } else {
          setCurrentTenantIdState(null);
        }
      } catch (error) {
        console.error("Error in tenant context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ currentTenantId, setCurrentTenantId, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    // Return a fallback for components that might be used outside the provider
    return {
      currentTenantId: null,
      setCurrentTenantId: () => {},
      isLoading: false,
    };
  }
  return context;
}
