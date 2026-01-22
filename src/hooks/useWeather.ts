import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temp: number;
  description: string;
  city: string;
}

// Map weather codes to descriptions (Open-Meteo WMO codes)
function mapWeatherCode(code: number): string {
  const weatherMap: Record<number, string> = {
    0: "Céu limpo",
    1: "Parcialmente nublado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina",
    51: "Chuvisco leve",
    53: "Chuvisco",
    55: "Chuvisco intenso",
    56: "Chuvisco gelado",
    57: "Chuvisco gelado",
    61: "Chuva leve",
    63: "Chuva",
    65: "Chuva forte",
    66: "Chuva gelada",
    67: "Chuva gelada",
    71: "Neve leve",
    73: "Neve",
    75: "Neve forte",
    77: "Granizo",
    80: "Pancadas leves",
    81: "Pancadas",
    82: "Pancadas fortes",
    85: "Neve leve",
    86: "Neve forte",
    95: "Tempestade",
    96: "Tempestade com granizo",
    99: "Tempestade forte",
  };
  
  return weatherMap[code] || "Variável";
}

export function useWeather() {
  return useQuery({
    queryKey: ["weather-cotia"],
    queryFn: async (): Promise<WeatherData> => {
      try {
        // Cotia-SP coordinates
        const lat = -23.6;
        const lon = -46.92;
        
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America/Sao_Paulo`
        );
        
        if (!res.ok) {
          throw new Error("Failed to fetch weather data");
        }
        
        const data = await res.json();
        
        return {
          temp: Math.round(data.current_weather?.temperature || 0),
          description: mapWeatherCode(data.current_weather?.weathercode || 0),
          city: "Cotia",
        };
      } catch (error) {
        console.error("Error fetching weather data:", error);
        // Return fallback data
        return {
          temp: 24,
          description: "Parcialmente nublado",
          city: "Cotia",
        };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000,
    retry: 2,
  });
}
