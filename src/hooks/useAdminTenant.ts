import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantContext } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";

interface Site {
  id: string;
  name: string;
  slug: string;
}

interface AdminTenantResult {
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  hasTenant: boolean;
  availableSites: Site[];
  selectedSite: Site | null;
  selectTenant: (id: string) => void;
}

const STORAGE_KEY = "admin_selected_tenant";

export function useAdminTenant(): AdminTenantResult {
  const { user } = useAuth();
  const { currentTenantId, setCurrentTenantId, isLoading: contextLoading } = useTenantContext();
  
  const [availableSites, setAvailableSites] = useState<Site[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available sites for the user
  useEffect(() => {
    const fetchSites = async () => {
      if (!user) {
        setAvailableSites([]);
        setIsLoadingSites(false);
        return;
      }

      try {
        setIsLoadingSites(true);
        setError(null);

        // First try to get site_ids where user is a member
        const { data: userSiteIds, error: userSitesError } = await supabase
          .from("site_users")
          .select("site_id")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (userSitesError) {
          console.error("Error fetching user sites:", userSitesError);
        }

        const siteIds = (userSiteIds || []).map(s => s.site_id);
        
        let sitesToUse: Site[] = [];

        if (siteIds.length > 0) {
          // Fetch sites by IDs
          const { data: sites, error: sitesError } = await supabase
            .from("sites")
            .select("id, name")
            .in("id", siteIds);

          if (!sitesError && sites) {
            sitesToUse = sites.map((s: { id: string; name: string }) => ({ 
              id: s.id, 
              name: s.name, 
              slug: s.name.toLowerCase().replace(/\s+/g, '-') 
            }));
          }
        }

        // Fallback: if no sites through membership, get any available site
        if (sitesToUse.length === 0) {
          const { data: allSites, error: allSitesError } = await supabase
            .from("sites")
            .select("id, name")
            .limit(10);

          if (allSitesError) {
            console.error("Error fetching all sites:", allSitesError);
            setError("Não foi possível carregar os sites disponíveis");
          } else if (allSites) {
            sitesToUse = allSites.map((s: { id: string; name: string }) => ({ 
              id: s.id, 
              name: s.name, 
              slug: s.name.toLowerCase().replace(/\s+/g, '-') 
            }));
          }
        }
        
        setAvailableSites(sitesToUse);
      } catch (err) {
        console.error("Error in fetchSites:", err);
        setError("Erro ao carregar sites");
      } finally {
        setIsLoadingSites(false);
      }
    };

    fetchSites();
  }, [user]);

  // Try to restore tenant from localStorage if not set
  useEffect(() => {
    if (!currentTenantId && availableSites.length > 0 && !contextLoading) {
      const storedTenantId = localStorage.getItem(STORAGE_KEY);
      
      // Check if stored tenant is in available sites
      if (storedTenantId && availableSites.some(s => s.id === storedTenantId)) {
        setCurrentTenantId(storedTenantId);
      } else if (availableSites.length === 1) {
        // Auto-select if only one site available
        setCurrentTenantId(availableSites[0].id);
        localStorage.setItem(STORAGE_KEY, availableSites[0].id);
      }
    }
  }, [currentTenantId, availableSites, contextLoading, setCurrentTenantId]);

  // Select a different tenant
  const selectTenant = useCallback((id: string) => {
    setCurrentTenantId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, [setCurrentTenantId]);

  // Get the currently selected site
  const selectedSite = useMemo(() => {
    return availableSites.find(s => s.id === currentTenantId) || null;
  }, [availableSites, currentTenantId]);

  const isLoading = contextLoading || isLoadingSites;
  const hasTenant = !!currentTenantId;

  return {
    tenantId: currentTenantId,
    isLoading,
    error,
    hasTenant,
    availableSites,
    selectedSite,
    selectTenant,
  };
}
