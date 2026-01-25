import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminTenant } from "@/hooks/useAdminTenant";
import { Skeleton } from "@/components/ui/skeleton";

export function TenantSelector() {
  const { tenantId, availableSites, selectedSite, selectTenant, isLoading } = useAdminTenant();

  if (isLoading) {
    return <Skeleton className="h-9 w-[180px]" />;
  }

  if (availableSites.length === 0) {
    return null;
  }

  // Don't show if only one site
  if (availableSites.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{availableSites[0].name}</span>
      </div>
    );
  }

  return (
    <Select value={tenantId || ""} onValueChange={selectTenant}>
      <SelectTrigger className="w-[180px]">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Selecione um site" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {availableSites.map((site) => (
          <SelectItem key={site.id} value={site.id}>
            {site.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
