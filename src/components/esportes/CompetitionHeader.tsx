import { Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSearch } from "./TeamSearch";
import { LEAGUE_NAMES, BRAZILIAN_LEAGUES } from "@/types/football";
import { cn } from "@/lib/utils";

interface CompetitionHeaderProps {
  title: string;
  subtitle?: string;
  currentSerie?: "serie-a" | "serie-b";
  showSearch?: boolean;
  showBack?: boolean;
  backUrl?: string;
}

export function CompetitionHeader({ 
  title, 
  subtitle, 
  currentSerie,
  showSearch = true,
  showBack = false,
  backUrl = "/esportes/brasileirao"
}: CompetitionHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button asChild variant="ghost" size="icon">
            <Link to={backUrl}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary shrink-0" />
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {currentSerie && (
          <Tabs value={currentSerie}>
            <TabsList>
              <TabsTrigger value="serie-a" asChild>
                <Link to="/esportes/brasileirao/serie-a">Série A</Link>
              </TabsTrigger>
              <TabsTrigger value="serie-b" asChild>
                <Link to="/esportes/brasileirao/serie-b">Série B</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {showSearch && (
          <TeamSearch className="w-full sm:w-64" />
        )}
      </div>
    </header>
  );
}
