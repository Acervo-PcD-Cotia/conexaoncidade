import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TeamBadge } from "./TeamBadge";
import { useTeamSearch } from "@/hooks/useFootball";
import { FootballTeam } from "@/types/football";
import { cn } from "@/lib/utils";

interface TeamSearchProps {
  className?: string;
  placeholder?: string;
}

export function TeamSearch({ className, placeholder = "Buscar time..." }: TeamSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: teams, isLoading } = useTeamSearch(debouncedQuery);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const handleSelect = useCallback((team: FootballTeam) => {
    navigate(`/esportes/brasileirao/serie-a/time/${team.slug}`);
    setQuery("");
    setIsOpen(false);
  }, [navigate]);
  
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      
      {isOpen && teams && teams.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1">
            {teams.map((team) => (
              <li key={team.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(team)}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                >
                  <TeamBadge 
                    name={team.name} 
                    logoUrl={team.logo_url} 
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium">{team.name}</p>
                    {team.stadium_city && (
                      <p className="text-xs text-muted-foreground">{team.stadium_city}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && query.length >= 2 && !isLoading && (!teams || teams.length === 0) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
          Nenhum time encontrado
        </div>
      )}
    </div>
  );
}
