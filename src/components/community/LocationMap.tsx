import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CommunityLocation } from "@/hooks/useCommunityLocations";

// Fix for default marker icons in Leaflet
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const accessibleIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "accessible-marker",
});

L.Marker.prototype.options.icon = defaultIcon;

interface LocationMapProps {
  locations: CommunityLocation[];
  onLocationClick?: (location: CommunityLocation) => void;
  className?: string;
}

const categoryColors: Record<string, string> = {
  business: "#3b82f6", // blue
  service: "#22c55e", // green
  event: "#a855f7", // purple
  support_pcd: "#ec4899", // pink
};

const categoryLabels: Record<string, string> = {
  business: "Comércio",
  service: "Serviço",
  event: "Evento",
  support_pcd: "Apoio PcD",
};

export function LocationMap({ locations, onLocationClick, className = "" }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Center on Cotia, SP
  const defaultCenter: [number, number] = [-23.6033, -46.9196];
  const defaultZoom = 13;

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, defaultZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for locations with coordinates
    const locationsWithCoords = locations.filter(
      (loc) => loc.lat !== null && loc.lng !== null
    );

    locationsWithCoords.forEach((location) => {
      if (location.lat === null || location.lng === null) return;

      const marker = L.marker([location.lat, location.lng], {
        icon: location.is_accessible ? accessibleIcon : defaultIcon,
      }).addTo(mapInstanceRef.current!);

      // Create popup content
      const categoryLabel = categoryLabels[location.category] || location.category;
      const accessibleBadge = location.is_accessible
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-700 ml-1">♿ Acessível</span>'
        : "";

      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <div class="flex items-center gap-1 mb-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style="background: ${categoryColors[location.category]}20; color: ${categoryColors[location.category]}">
              ${categoryLabel}
            </span>
            ${accessibleBadge}
          </div>
          <h3 class="font-semibold text-base">${location.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${location.address || "Endereço não informado"}</p>
          ${location.neighborhood ? `<p class="text-xs text-gray-500 mt-1">${location.neighborhood}</p>` : ""}
          ${
            location.accessibility_features && location.accessibility_features.length > 0
              ? `<div class="mt-2 flex flex-wrap gap-1">
                  ${location.accessibility_features
                    .map((f) => `<span class="text-xs bg-gray-100 px-1.5 py-0.5 rounded">${f}</span>`)
                    .join("")}
                </div>`
              : ""
          }
        </div>
      `);

      if (onLocationClick) {
        marker.on("click", () => onLocationClick(location));
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if there are locations
    if (locationsWithCoords.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    // Cleanup
    return () => {
      // Don't destroy the map on re-render, just clear markers
    };
  }, [locations, onLocationClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className={`h-[400px] w-full rounded-lg border ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

// Geocoding utility function
export async function geocodeAddress(address: string, city = "Cotia, SP, Brasil"): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      {
        headers: {
          "User-Agent": "ConexaoNaCidade/1.0",
        },
      }
    );

    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
