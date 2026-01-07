import { TrendingUp, TrendingDown, Cloud, DollarSign } from "lucide-react";

// Mock data - will be replaced with real API data
const marketData = {
  dolar: { value: 5.38, change: 0.5 },
  euro: { value: 6.28, change: 0.2 },
  bovespa: { value: 128500, change: 1.2 },
  weather: { temp: 24, description: "Parcialmente nublado", city: "São Paulo" },
};

export function MarketDataBar() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
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

  return (
    <div className="border-b bg-card">
      <div className="container flex items-center justify-between py-2 text-xs">
        <div className="flex items-center gap-4 overflow-x-auto md:gap-6">
          {/* Dollar */}
          <div className="flex shrink-0 items-center gap-2">
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
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
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
          <div className="hidden shrink-0 items-center gap-2 md:flex">
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

          {/* Date */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <span className="text-muted-foreground capitalize">{today}</span>
          </div>
        </div>

        {/* Weather */}
        <div className="flex shrink-0 items-center gap-2">
          <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">{marketData.weather.temp}°C</span>
          <span className="hidden text-muted-foreground sm:inline">
            {marketData.weather.description}
          </span>
        </div>
      </div>
    </div>
  );
}
