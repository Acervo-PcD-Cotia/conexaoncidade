/**
 * TenantScope: Multi-tenant helper for scoped queries
 * Automatically detects and applies tenant_id filtering
 */

import { supabase } from "@/integrations/supabase/client";

export interface TenantContext {
  tenantId: string | null;
  isMultiTenant: boolean;
}

/**
 * Get current tenant context from user session
 * Uses the TenantContext provider or discovers from database
 */
export async function getCurrentTenantContext(): Promise<TenantContext> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { tenantId: null, isMultiTenant: false };
    }

    // Check JWT custom claims first
    const appMetadata = user.app_metadata;
    if (appMetadata?.tenant_id) {
      return { tenantId: appMetadata.tenant_id as string, isMultiTenant: true };
    }

    // Try to get tenant from profiles table (if it has tenant_id)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Check if profile has tenant_id property
      const profileData = profile as Record<string, unknown> | null;
      if (profileData && 'tenant_id' in profileData && profileData.tenant_id) {
        return { tenantId: profileData.tenant_id as string, isMultiTenant: true };
      }
    } catch {
      // profiles table might not have tenant_id column
    }

    return { tenantId: null, isMultiTenant: false };
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return { tenantId: null, isMultiTenant: false };
  }
}

/**
 * Build insert data with tenant_id if applicable
 */
export function withTenantInsert<T extends Record<string, unknown>>(
  data: T,
  tenantId: string | null
): T & { tenant_id?: string } {
  if (tenantId) {
    return { ...data, tenant_id: tenantId };
  }
  return data;
}

/**
 * Apply tenant filter to a query builder
 * This is a type helper - actual filtering happens in hooks
 */
export function getTenantFilter(tenantId: string | null): { 
  column: 'tenant_id';
  value: string;
} | null {
  if (!tenantId) return null;
  return { column: 'tenant_id', value: tenantId };
}

/**
 * Detect the correct inbox table name
 */
export async function detectInboxTable(): Promise<'syndication_inbox' | 'syndication_items'> {
  try {
    const { error } = await supabase
      .from('syndication_inbox')
      .select('id')
      .limit(0);
    
    // If no error, table exists
    if (!error) {
      return 'syndication_inbox';
    }
  } catch {
    // Ignore
  }
  
  return 'syndication_items';
}
