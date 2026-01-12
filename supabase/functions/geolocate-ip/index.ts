import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache for IP lookups (lasts for function instance lifetime)
const geoCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get IP from headers (Cloudflare/proxy) or request
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    let ip = cfConnectingIp || realIp || (forwardedFor?.split(',')[0]?.trim()) || '';
    
    // For development/testing, allow passing IP in body
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.ip) {
          ip = body.ip;
        }
      } catch {
        // No body or invalid JSON, continue with detected IP
      }
    }

    // Remove IPv6 prefix if present
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    // Check if it's a local/private IP
    const isPrivateIp = ip === '' || 
      ip === '127.0.0.1' || 
      ip === 'localhost' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('::1');

    if (isPrivateIp) {
      console.log('Private/local IP detected, returning default location');
      return new Response(
        JSON.stringify({
          country_code: 'BR',
          country_name: 'Brasil',
          region_code: 'SP',
          region_name: 'São Paulo',
          city: 'São Paulo',
          is_default: true,
          ip: ip || 'local'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Check cache
    const cached = geoCache.get(ip);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`Cache hit for IP: ${ip}`);
      return new Response(
        JSON.stringify(cached.data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Use ip-api.com (free tier: 45 requests/minute)
    console.log(`Fetching geolocation for IP: ${ip}`);
    const geoResponse = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!geoResponse.ok) {
      throw new Error(`Geo API error: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    if (geoData.status === 'fail') {
      console.error('Geo API returned failure:', geoData.message);
      // Return default location for Brazil
      return new Response(
        JSON.stringify({
          country_code: 'BR',
          country_name: 'Brasil',
          region_code: 'SP',
          region_name: 'São Paulo',
          city: 'São Paulo',
          is_default: true,
          ip: ip,
          error: geoData.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const result = {
      country_code: geoData.countryCode || 'BR',
      country_name: geoData.country || 'Brasil',
      region_code: geoData.region || '',
      region_name: geoData.regionName || '',
      city: geoData.city || '',
      lat: geoData.lat,
      lon: geoData.lon,
      ip: ip,
      is_default: false
    };

    // Cache the result
    geoCache.set(ip, { data: result, timestamp: Date.now() });

    console.log(`Geolocation result for ${ip}:`, result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('Geolocate IP error:', error);
    
    // Return default location on error
    return new Response(
      JSON.stringify({
        country_code: 'BR',
        country_name: 'Brasil',
        region_code: 'SP',
        region_name: 'São Paulo',
        city: 'São Paulo',
        is_default: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});
