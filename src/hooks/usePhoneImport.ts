import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Phone } from './usePhoneChooser';

export interface ParsedPhoneData {
  name: string;
  brand: string;
  price_detected: number | null;
  specs: {
    ram: string;
    storage: string;
    display: string;
    battery: string;
    camera: string;
    processor: string;
  };
  suggested_scores: {
    camera: number;
    battery: number;
    gaming: number;
  };
  price_range: 'budget' | 'mid' | 'premium' | 'flagship';
  ideal_for: string;
  strengths: string[];
  considerations: string[];
  use_cases: string[];
}

export interface PhoneFormData {
  name: string;
  brand: string;
  price_min: number;
  price_max: number;
  price_range: 'budget' | 'mid' | 'premium' | 'flagship';
  image_url: string;
  ideal_for: string;
  strengths: string[];
  considerations: string[];
  use_cases: string[];
  gaming_score: number;
  camera_score: number;
  battery_score: number;
  is_active: boolean;
}

export interface OfferFormData {
  store_name: string;
  affiliate_url: string;
  price: number | null;
  original_price: number | null;
  priority: number;
  is_active: boolean;
}

interface CsvRow {
  name: string;
  brand: string;
  price_min?: number;
  price_max?: number;
  price_range?: string;
  ram?: string;
  storage?: string;
  camera_score?: number;
  battery_score?: number;
  gaming_score?: number;
  ideal_for?: string;
  offer_store?: string;
  affiliate_url?: string;
  offer_price?: number;
  offer_priority?: number;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Brand normalization map
const BRAND_MAP: Record<string, string> = {
  'apple': 'Apple',
  'iphone': 'Apple',
  'samsung': 'Samsung',
  'galaxy': 'Samsung',
  'motorola': 'Motorola',
  'moto': 'Motorola',
  'xiaomi': 'Xiaomi',
  'redmi': 'Xiaomi',
  'poco': 'Xiaomi',
  'realme': 'Realme',
  'oppo': 'Oppo',
  'oneplus': 'OnePlus',
  'one plus': 'OnePlus',
  'google': 'Google',
  'pixel': 'Google',
  'asus': 'Asus',
  'tcl': 'TCL',
  'lg': 'LG',
  'huawei': 'Huawei',
  'honor': 'Honor',
  'nothing': 'Nothing',
  'infinix': 'Infinix',
  'tecno': 'Tecno',
};

export function usePhoneImport() {
  const queryClient = useQueryClient();
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Normalize brand name
  const normalizeBrand = (brand: string): string => {
    const normalized = brand.toLowerCase().trim();
    return BRAND_MAP[normalized] || brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  // Normalize model name
  const normalizeName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\+\/]/g, '');
  };

  // Check for duplicates
  const checkDuplicate = async (brand: string, name: string): Promise<Phone | null> => {
    const normalizedBrand = normalizeBrand(brand);
    const normalizedName = normalizeName(name).toLowerCase();

    const { data } = await supabase
      .from('phone_catalog')
      .select('*')
      .ilike('brand', normalizedBrand)
      .order('created_at', { ascending: false });

    if (!data) return null;

    // Find similar names
    const match = data.find(phone => {
      const phoneName = normalizeName(phone.name).toLowerCase();
      // Check if names are very similar (contain each other or high similarity)
      return phoneName === normalizedName || 
             phoneName.includes(normalizedName) || 
             normalizedName.includes(phoneName);
    });

    return match as Phone | null;
  };

  // Parse text using AI
  const parseText = useMutation({
    mutationFn: async (text: string): Promise<ParsedPhoneData> => {
      setIsParsing(true);
      try {
        const { data, error } = await supabase.functions.invoke('phone-parse-specs', {
          body: { type: 'text', content: text }
        });

        if (error) throw error;
        return data;
      } finally {
        setIsParsing(false);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao analisar texto');
    }
  });

  // Parse URL
  const parseUrl = useMutation({
    mutationFn: async (url: string): Promise<ParsedPhoneData> => {
      setIsParsing(true);
      try {
        // Try to fetch the URL content
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error('Não foi possível acessar a URL. Copie e cole as especificações na aba "Importar por Texto".');
        }

        const html = await response.text();
        
        // Extract useful content from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove scripts and styles
        doc.querySelectorAll('script, style').forEach(el => el.remove());
        
        // Get title
        const title = doc.querySelector('title')?.textContent || '';
        
        // Get meta description
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Get product info (common selectors)
        const productName = doc.querySelector('[data-testid="product-title"], .product-title, h1')?.textContent || '';
        
        // Get price
        const priceText = doc.querySelector('[data-testid="price"], .price, .product-price')?.textContent || '';
        
        // Get specs sections
        const specsSection = doc.querySelector('.specs, .specifications, .product-specs, [data-testid="specs"]');
        const specsText = specsSection?.textContent || '';
        
        // Combine extracted content
        const content = `
          Título: ${title}
          Produto: ${productName}
          Descrição: ${metaDesc}
          Preço: ${priceText}
          Especificações: ${specsText}
        `.trim();

        if (content.length < 50) {
          throw new Error('Não foi possível extrair informações suficientes. Copie e cole as especificações na aba "Importar por Texto".');
        }

        // Send to AI for parsing
        const { data, error } = await supabase.functions.invoke('phone-parse-specs', {
          body: { type: 'url', content }
        });

        if (error) throw error;
        return data;
      } finally {
        setIsParsing(false);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao analisar URL');
    }
  });

  // Convert parsed data to form data
  const parsedToFormData = (parsed: ParsedPhoneData): PhoneFormData => {
    // Estimate price range
    const priceRangeMap: Record<string, { min: number; max: number }> = {
      budget: { min: 500, max: 999 },
      mid: { min: 1000, max: 2499 },
      premium: { min: 2500, max: 4999 },
      flagship: { min: 5000, max: 10000 },
    };

    const range = priceRangeMap[parsed.price_range] || priceRangeMap.mid;
    const detectedPrice = parsed.price_detected;

    return {
      name: parsed.name,
      brand: parsed.brand,
      price_min: detectedPrice ? Math.round(detectedPrice * 0.9) : range.min,
      price_max: detectedPrice ? Math.round(detectedPrice * 1.1) : range.max,
      price_range: parsed.price_range,
      image_url: '',
      ideal_for: parsed.ideal_for,
      strengths: parsed.strengths,
      considerations: parsed.considerations,
      use_cases: parsed.use_cases,
      gaming_score: parsed.suggested_scores.gaming,
      camera_score: parsed.suggested_scores.camera,
      battery_score: parsed.suggested_scores.battery,
      is_active: true,
    };
  };

  // Create phone
  const createPhone = useMutation({
    mutationFn: async (phone: PhoneFormData) => {
      const { data, error } = await supabase
        .from('phone_catalog')
        .insert({
          name: normalizeName(phone.name),
          brand: normalizeBrand(phone.brand),
          price_min: phone.price_min,
          price_max: phone.price_max,
          price_range: phone.price_range,
          image_url: phone.image_url || null,
          ideal_for: phone.ideal_for,
          strengths: phone.strengths,
          considerations: phone.considerations,
          use_cases: phone.use_cases,
          gaming_score: phone.gaming_score,
          camera_score: phone.camera_score,
          battery_score: phone.battery_score,
          is_active: phone.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      toast.success('Smartphone cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cadastrar smartphone');
    }
  });

  // Create phone with offers
  const createPhoneWithOffers = useMutation({
    mutationFn: async ({ phone, offers }: { phone: PhoneFormData; offers: OfferFormData[] }) => {
      // Create phone first
      const { data: phoneData, error: phoneError } = await supabase
        .from('phone_catalog')
        .insert({
          name: normalizeName(phone.name),
          brand: normalizeBrand(phone.brand),
          price_min: phone.price_min,
          price_max: phone.price_max,
          price_range: phone.price_range,
          image_url: phone.image_url || null,
          ideal_for: phone.ideal_for,
          strengths: phone.strengths,
          considerations: phone.considerations,
          use_cases: phone.use_cases,
          gaming_score: phone.gaming_score,
          camera_score: phone.camera_score,
          battery_score: phone.battery_score,
          is_active: phone.is_active,
        })
        .select()
        .single();

      if (phoneError) throw phoneError;

      // Create offers if any
      if (offers.length > 0) {
        const offersToInsert = offers.map(offer => ({
          phone_id: phoneData.id,
          store: offer.store_name,
          affiliate_url: offer.affiliate_url,
          price: offer.price,
          priority: offer.priority,
          is_active: offer.is_active,
        }));

        const { error: offersError } = await supabase
          .from('phone_offers')
          .insert(offersToInsert);

        if (offersError) {
          console.error('Error creating offers:', offersError);
          // Don't throw, phone was created successfully
          toast.warning('Smartphone criado, mas houve erro ao criar ofertas');
        }
      }

      return phoneData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers'] });
      toast.success('Smartphone e ofertas cadastrados com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cadastrar smartphone');
    }
  });

  // Import CSV
  const importCsv = async (
    rows: CsvRow[], 
    updateExisting: boolean = false
  ): Promise<ImportResult> => {
    setIsImporting(true);
    const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

    try {
      for (const row of rows) {
        try {
          if (!row.name || !row.brand) {
            result.errors.push(`Linha inválida: nome e marca são obrigatórios`);
            result.skipped++;
            continue;
          }

          const normalizedBrand = normalizeBrand(row.brand);
          const normalizedName = normalizeName(row.name);

          // Check for duplicate
          const existing = await checkDuplicate(normalizedBrand, normalizedName);

          if (existing) {
            if (updateExisting) {
              // Update existing phone
              const { error } = await supabase
                .from('phone_catalog')
                .update({
                  price_min: row.price_min || existing.price_min,
                  price_max: row.price_max || existing.price_max,
                  price_range: row.price_range as any || existing.price_range,
                  camera_score: row.camera_score || existing.camera_score,
                  battery_score: row.battery_score || existing.battery_score,
                  gaming_score: row.gaming_score || existing.gaming_score,
                  ideal_for: row.ideal_for || existing.ideal_for,
                })
                .eq('id', existing.id);

              if (error) {
                result.errors.push(`Erro ao atualizar ${normalizedName}: ${error.message}`);
                result.skipped++;
              } else {
                result.updated++;
              }
            } else {
              result.skipped++;
            }
            continue;
          }

          // Create new phone
          const { data: phoneData, error: phoneError } = await supabase
            .from('phone_catalog')
            .insert({
              name: normalizedName,
              brand: normalizedBrand,
              price_min: row.price_min || 1000,
              price_max: row.price_max || 2000,
              price_range: (row.price_range as any) || 'mid',
              camera_score: row.camera_score || 3,
              battery_score: row.battery_score || 3,
              gaming_score: row.gaming_score || 3,
              ideal_for: row.ideal_for || 'Uso geral',
              strengths: [],
              considerations: [],
              use_cases: ['social'],
              is_active: true,
            })
            .select()
            .single();

          if (phoneError) {
            result.errors.push(`Erro ao criar ${normalizedName}: ${phoneError.message}`);
            result.skipped++;
            continue;
          }

          result.created++;

          // Create offer if present
          if (row.offer_store && row.affiliate_url) {
            const { error: offerError } = await supabase
              .from('phone_offers')
              .insert({
                phone_id: phoneData.id,
                store: row.offer_store,
                affiliate_url: row.affiliate_url,
                price: row.offer_price || null,
                priority: row.offer_priority || 1,
                is_active: true,
              });

            if (offerError) {
              console.error('Error creating offer:', offerError);
            }
          }
        } catch (rowError) {
          result.errors.push(`Erro na linha ${row.name}: ${(rowError as Error).message}`);
          result.skipped++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers'] });

      return result;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isParsing,
    isImporting,
    parseText,
    parseUrl,
    parsedToFormData,
    normalizeBrand,
    normalizeName,
    checkDuplicate,
    createPhone,
    createPhoneWithOffers,
    importCsv,
  };
}
