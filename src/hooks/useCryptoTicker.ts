import { useQuery } from "@tanstack/react-query";

interface CryptoData {
  value: number | null;
  change: number | null;
}

interface CryptoTickerData {
  bitcoin: CryptoData;
  ethereum: CryptoData;
  isLoading: boolean;
  error: Error | null;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

async function fetchCryptoPrices(): Promise<{ bitcoin: CryptoData; ethereum: CryptoData }> {
  try {
    const response = await fetch(
      `${COINGECKO_API}?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch crypto prices");
    }
    
    const data = await response.json();
    
    return {
      bitcoin: {
        value: data.bitcoin?.brl ?? null,
        change: data.bitcoin?.brl_24h_change ?? null,
      },
      ethereum: {
        value: data.ethereum?.brl ?? null,
        change: data.ethereum?.brl_24h_change ?? null,
      },
    };
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return {
      bitcoin: { value: null, change: null },
      ethereum: { value: null, change: null },
    };
  }
}

export function useCryptoTicker(): CryptoTickerData {
  const { data, isLoading, error } = useQuery({
    queryKey: ["crypto-ticker"],
    queryFn: fetchCryptoPrices,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    retry: 2,
  });

  return {
    bitcoin: data?.bitcoin ?? { value: null, change: null },
    ethereum: data?.ethereum ?? { value: null, change: null },
    isLoading,
    error: error as Error | null,
  };
}
