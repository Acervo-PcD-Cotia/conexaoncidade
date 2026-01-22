import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface TenantContextType {
  currentTenantId: string | null;
  setCurrentTenantId: (id: string | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDefaultTenant = async () => {
      if (!user) {
        setCurrentTenantId(null);
        setIsLoading(false);
        return;
      }

      try {
        // Try to get the user's primary site from site_users
        const { data: siteUser, error } = await supabase
          .from("site_users")
          .select("site_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching tenant:", error);
          // Fallback: try to get the first site
          const { data: site } = await supabase
            .from("sites")
            .select("id")
            .limit(1)
            .maybeSingle();
          
          setCurrentTenantId(site?.id || null);
        } else {
          setCurrentTenantId(siteUser?.site_id || null);
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
