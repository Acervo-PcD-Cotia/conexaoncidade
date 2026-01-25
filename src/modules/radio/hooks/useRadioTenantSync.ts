import { useEffect } from "react";
import { useTenantContext } from "@/contexts/TenantContext";
import { setRadioTenantId } from "../apiClient";

/**
 * Hook to sync tenant ID with radio API client
 * Should be called once in a parent component that wraps radio pages
 */
export function useRadioTenantSync() {
  const { currentTenantId } = useTenantContext();

  useEffect(() => {
    setRadioTenantId(currentTenantId);
  }, [currentTenantId]);

  return { tenantId: currentTenantId };
}
