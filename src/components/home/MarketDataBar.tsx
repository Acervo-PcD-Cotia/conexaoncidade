import { TrendingUp, TrendingDown, Cloud, DollarSign, MapPin, Calendar, Bitcoin } from "lucide-react";
import { useCryptoTicker } from "@/hooks/useCryptoTicker";

// Mock data for fiat currencies - will be replaced with real API data
const marketData = {
  dolar: { value: 5.38, change: 0.5 },
  euro: { value: 6.28, change: 0.2 },
  bovespa: { value: 128500, change: 1.2 },
  weather: { temp: 24, description: "Parcialmente nublado", city: "São Paulo" },
};

export function MarketDataBar() {
  const { bitcoin, ethereum, isLoading: cryptoLoading } = useCryptoTicker();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCrypto = (value: number | null) => {
    if (value === null) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const renderChange = (change: number | null) => {
    if (change === null) return <span className="text-muted-foreground">—</span>;
    
    return (
      <span
        className={`flex items-center gap-0.5 ${
          change >= 0 ? "text-market-up" : "text-market-down"
        }`}
      >
        {change >= 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="border-b bg-card">
      <div className="container flex items-center justify-between py-2 text-xs">
        {/* Left: Location + Date */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="hidden sm:inline">Região Metropolitana</span>
          </span>
          <span className="hidden items-center gap-1 text-muted-foreground md:flex">
            <Calendar className="h-3 w-3" />
            <span className="capitalize">{today}</span>
          </span>
        </div>

        {/* Center: Financial indicators */}
        <div className="flex items-center gap-3 overflow-x-auto md:gap-4 lg:gap-6">
          {/* Dollar */}
          <div className="flex shrink-0 items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">Dólar</span>
            <span className="font-semibold">{formatCurrency(marketData.dolar.value)}</span>
            <span
              className={`flex items-center gap-0.5 ${
                marketData.dolar.change >= 0 ? "text-market-up" : "text-market-down"
              }`}
            >
              {marketData.dolar.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(marketData.dolar.change).toFixed(2)}%
            </span>
          </div>

          {/* Euro */}
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <span className="font-medium">Euro</span>
            <span className="font-semibold">{formatCurrency(marketData.euro.value)}</span>
            <span
              className={`flex items-center gap-0.5 ${
                marketData.euro.change >= 0 ? "text-market-up" : "text-market-down"
              }`}
            >
              {marketData.euro.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(marketData.euro.change).toFixed(2)}%
            </span>
          </div>

          {/* Bovespa */}
          <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
            <span className="font-medium">Bovespa</span>
            <span className="font-semibold">{formatNumber(marketData.bovespa.value)}</span>
            <span
              className={`flex items-center gap-0.5 ${
                marketData.bovespa.change >= 0 ? "text-market-up" : "text-market-down"
              }`}
            >
              {marketData.bovespa.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(marketData.bovespa.change).toFixed(2)}%
            </span>
          </div>

          {/* Bitcoin */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Bitcoin className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">BTC</span>
            <span className="font-semibold">
              {cryptoLoading ? "..." : formatCrypto(bitcoin.value)}
            </span>
            {!cryptoLoading && renderChange(bitcoin.change)}
          </div>

          {/* Ethereum */}
          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <span className="text-base font-bold text-blue-500">Ξ</span>
            <span className="font-medium">ETH</span>
            <span className="font-semibold">
              {cryptoLoading ? "..." : formatCrypto(ethereum.value)}
            </span>
            {!cryptoLoading && renderChange(ethereum.change)}
          </div>
        </div>

        {/* Weather */}
        <div className="flex shrink-0 items-center gap-2">
          <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">{marketData.weather.temp}°C</span>
          <span className="hidden text-muted-foreground lg:inline">
            {marketData.weather.description}
          </span>
        </div>
      </div>
    </div>
  );
}
