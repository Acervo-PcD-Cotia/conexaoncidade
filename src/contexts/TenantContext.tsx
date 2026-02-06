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
      // For anonymous users, clear tenant and finish quickly
      if (!user) {
        setCurrentTenantIdState(null);
        localStorage.removeItem(TENANT_CACHE_KEY);
        setIsLoading(false);
        return;
      }

      // Reset loading when user changes — use cached value while validating
      const cached = localStorage.getItem(TENANT_CACHE_KEY);
      if (cached) {
        // Use cached tenant immediately to prevent content flash
        setCurrentTenantIdState(cached);
        // Still mark as loading briefly to let downstream queries settle
        setIsLoading(true);
      } else {
        setIsLoading(true);
      }

      try {
        // Step 1: Check if user is super_admin (they can access any site)
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        const isSuperAdmin = roleData?.role === 'super_admin';

        // Step 2: Try to get user's site from site_users
        const { data: siteUser, error: siteUserError } = await supabase
          .from("site_users")
          .select("site_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (siteUser?.site_id) {
          // User has a site assignment, use it
          setCurrentTenantId(siteUser.site_id);
          setIsLoading(false);
          return;
        }

        // Step 3: Fallback - get first available site (especially for super_admin or new users)
        if (siteUserError || !siteUser?.site_id) {
          const { data: fallbackSite } = await supabase
            .from("sites")
            .select("id")
            .limit(1)
            .maybeSingle();

          if (fallbackSite?.id) {
            setCurrentTenantId(fallbackSite.id);
          } else {
            // No sites exist at all
            setCurrentTenantIdState(null);
          }
        }
      } catch (error) {
        console.error("Error in tenant context:", error);
        // On error, try to use cached value or null
        const cached = localStorage.getItem(TENANT_CACHE_KEY);
        if (!cached) {
          setCurrentTenantIdState(null);
        }
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
