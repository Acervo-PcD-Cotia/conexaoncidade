import { useNavigate } from "react-router-dom";
import { Image, Calendar, CalendarClock, Link2, FolderTree, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useContentFixStats } from "../hooks/useContentFixStats";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, bgColor, onClick, isLoading }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
        bgColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", bgColor)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <p className={cn("text-2xl font-bold", color)}>{value}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FixStatsGrid() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useContentFixStats();

  const totalImageIssues = (stats?.missingImages || 0) + (stats?.invalidImages || 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Imagens com Problema"
        value={totalImageIssues}
        icon={Image}
        color="text-red-600"
        bgColor="bg-red-50 dark:bg-red-950/20"
        onClick={() => navigate("/admin/content-fix/images")}
        isLoading={isLoading}
      />
      <StatCard
        label="Datas Futuras"
        value={stats?.futureDates || 0}
        icon={Calendar}
        color="text-amber-600"
        bgColor="bg-amber-50 dark:bg-amber-950/20"
        onClick={() => navigate("/admin/content-fix/dates")}
        isLoading={isLoading}
      />
      <StatCard
        label="Sem Data Original"
        value={stats?.missingOriginalDate || 0}
        icon={CalendarClock}
        color="text-orange-600"
        bgColor="bg-orange-50 dark:bg-orange-950/20"
        onClick={() => navigate("/admin/content-fix/dates")}
        isLoading={isLoading}
      />
      <StatCard
        label="Sem Categoria"
        value={stats?.missingCategory || 0}
        icon={FolderTree}
        color="text-purple-600"
        bgColor="bg-purple-50 dark:bg-purple-950/20"
        onClick={() => navigate("/admin/content-fix/validator")}
        isLoading={isLoading}
      />
    </div>
  );
}
