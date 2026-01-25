import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantContext } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";

interface Site {
  id: string;
  name: string;
}

interface AdminTenantResult {
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  hasTenant: boolean;
  availableSites: Site[];
  selectedSite: Site | null;
  selectTenant: (id: string) => void;
  refetch: () => void;
}

const STORAGE_KEY = "admin_selected_tenant";

async function fetchUserRole(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
  return data?.role;
}

async function fetchAllSites() {
  const { data, error } = await supabase
    .from("sites")
    .select("id, name")
    .order("name");
  
  if (error) throw error;
  return data || [];
}

async function fetchUserSites(userId: string) {
  // First get site_ids where user is a member
  const { data: userSiteIds, error: userSitesError } = await supabase
    .from("site_users")
    .select("site_id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (userSitesError) throw userSitesError;

  const siteIds = (userSiteIds || []).map(s => s.site_id);
  
  if (siteIds.length === 0) {
    return [];
  }

  // Fetch sites by IDs
  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("id, name")
    .in("id", siteIds)
    .order("name");

  if (sitesError) throw sitesError;
  return sites || [];
}

export function useAdminTenant(): AdminTenantResult {
  const { user } = useAuth();
  const { currentTenantId, setCurrentTenantId, isLoading: contextLoading } = useTenantContext();
  
  const [error, setError] = useState<string | null>(null);

  // Fetch user role and sites with React Query for caching
  const { data: sitesData, isLoading: sitesLoading, refetch } = useQuery({
    queryKey: ["admin-available-sites", user?.id],
    queryFn: async () => {
      if (!user) return { sites: [], isSuperAdmin: false };
      
      try {
        setError(null);
        
        // Check if user is super_admin
        const role = await fetchUserRole(user.id);
        const isSuperAdmin = role === 'super_admin';
        
        let sites: Site[];
        
        if (isSuperAdmin) {
          // Super admin can see all sites
          sites = await fetchAllSites();
        } else {
          // Regular user: fetch via site_users
          sites = await fetchUserSites(user.id);
          
          // Fallback: if no sites through membership, try to get any available site
          if (sites.length === 0) {
            sites = await fetchAllSites();
          }
        }
        
        return { sites, isSuperAdmin };
      } catch (err) {
        console.error("Error fetching sites:", err);
        setError("Erro ao carregar sites. Tente novamente.");
        return { sites: [], isSuperAdmin: false };
      }
    },
    enabled: !!user,
    staleTime: 60_000, // Cache for 1 minute
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
  });

  const availableSites = sitesData?.sites || [];

  // Try to restore tenant from localStorage if not set
  useEffect(() => {
    if (!currentTenantId && availableSites.length > 0 && !contextLoading && !sitesLoading) {
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
  }, [currentTenantId, availableSites, contextLoading, sitesLoading, setCurrentTenantId]);

  // Select a different tenant
  const selectTenant = useCallback((id: string) => {
    setCurrentTenantId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, [setCurrentTenantId]);

  // Get the currently selected site
  const selectedSite = useMemo(() => {
    return availableSites.find(s => s.id === currentTenantId) || null;
  }, [availableSites, currentTenantId]);

  const isLoading = contextLoading || sitesLoading;
  const hasTenant = !!currentTenantId;

  return {
    tenantId: currentTenantId,
    isLoading,
    error,
    hasTenant,
    availableSites,
    selectedSite,
    selectTenant,
    refetch,
  };
}
