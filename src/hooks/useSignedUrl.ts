import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SignedUrlResult {
  signedUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get a signed URL for private storage assets
 * Uses Edge Function to generate secure, time-limited URLs
 */
export function useSignedUrl(
  bucket: string,
  path: string | null | undefined,
  expiresIn: number = 3600
): SignedUrlResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['signed-url', bucket, path, expiresIn],
    queryFn: async () => {
      if (!path) return null;

      // Try Edge Function first
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
          'create-signed-url',
          {
            body: { bucket, path, expiresIn }
          }
        );

        if (!edgeError && edgeData?.signedUrl) {
          return edgeData.signedUrl;
        }
      } catch (e) {
        console.warn('Edge function not available, using direct storage API');
      }

      // Fallback to direct storage API
      const { data: urlData, error: storageError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (storageError) {
        throw new Error(`Failed to create signed URL: ${storageError.message}`);
      }

      return urlData?.signedUrl || null;
    },
    staleTime: (expiresIn / 2) * 1000, // Refresh at half the expiry time
    enabled: !!path,
    retry: 2,
  });

  return {
    signedUrl: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get multiple signed URLs at once
 */
export function useSignedUrls(
  bucket: string,
  paths: (string | null | undefined)[],
  expiresIn: number = 3600
) {
  const validPaths = paths.filter((p): p is string => !!p);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['signed-urls', bucket, validPaths, expiresIn],
    queryFn: async () => {
      if (validPaths.length === 0) return {};

      const results: Record<string, string> = {};

      // Batch create signed URLs
      const promises = validPaths.map(async (path) => {
        const { data: urlData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);
        
        if (urlData?.signedUrl) {
          results[path] = urlData.signedUrl;
        }
      });

      await Promise.all(promises);
      return results;
    },
    staleTime: (expiresIn / 2) * 1000,
    enabled: validPaths.length > 0,
  });

  return {
    signedUrls: data ?? {},
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Generate a signed URL on-demand (not cached)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Failed to create signed URL:', error);
    return null;
  }

  return data?.signedUrl || null;
}
