import { useQuery } from "@tanstack/react-query";

interface CurrencyData {
  value: number;
  change: number;
}

interface MarketData {
  dolar: CurrencyData;
  euro: CurrencyData;
}

export function useMarketData() {
  return useQuery({
    queryKey: ["market-data-fiat"],
    queryFn: async (): Promise<MarketData> => {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL");
        
        if (!res.ok) {
          throw new Error("Failed to fetch market data");
        }
        
        const data = await res.json();
        
        return {
          dolar: {
            value: parseFloat(data.USDBRL?.bid || "0"),
            change: parseFloat(data.USDBRL?.pctChange || "0"),
          },
          euro: {
            value: parseFloat(data.EURBRL?.bid || "0"),
            change: parseFloat(data.EURBRL?.pctChange || "0"),
          },
        };
      } catch (error) {
        console.error("Error fetching market data:", error);
        // Return fallback data
        return {
          dolar: { value: 5.38, change: 0.15 },
          euro: { value: 6.28, change: 0.22 },
        };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    retry: 2,
  });
}
