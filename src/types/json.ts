/**
 * Centralized JSON typing utilities for Supabase JSONB fields
 * Prevents scattered casts and ensures type safety
 */

export type Json = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: Json | undefined } 
  | Json[];

/**
 * Convert any value to Json type for Supabase inserts/updates
 */
export const asJson = <T>(value: T): Json => value as unknown as Json;

/**
 * Convert Json from Supabase to a typed value with fallback
 */
export const fromJson = <T>(value: Json | null | undefined, fallback: T): T => 
  (value as unknown as T) ?? fallback;

/**
 * Parse a Json object with specific keys
 */
export const parseJsonObject = <T extends Record<string, unknown>>(
  value: Json | null | undefined,
  fallback: T
): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as unknown as T;
  }
  return fallback;
};

/**
 * Parse a Json array
 */
export const parseJsonArray = <T>(
  value: Json | null | undefined,
  fallback: T[]
): T[] => {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) {
    return value as unknown as T[];
  }
  return fallback;
};
