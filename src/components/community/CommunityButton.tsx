import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { useNavigate } from "react-router-dom";

export function CommunityButton() {
  const { user } = useAuth();
  const { hasAccess, shareProgress, isLoading } = useCommunity();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (hasAccess) {
      navigate("/comunidade");
    } else {
      // Redirecionar para página dedicada de desbloqueio
      navigate("/comunidade/desbloquear");
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick}
      className="gap-2 relative"
      disabled={isLoading}
    >
      <Users className="h-4 w-4" />
      <span className="hidden sm:inline">Comunidade</span>
      {user && !hasAccess && shareProgress > 0 && (
        <Badge 
          variant="secondary" 
          className="absolute -top-1 -right-1 h-5 min-w-5 text-[10px] p-0 flex items-center justify-center"
        >
          {shareProgress}/12
        </Badge>
      )}
    </Button>
  );
}
