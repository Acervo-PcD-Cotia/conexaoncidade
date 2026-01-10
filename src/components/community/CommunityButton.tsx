import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { useNavigate } from "react-router-dom";
import { CommunityWelcomeModal } from "./CommunityWelcomeModal";

export function CommunityButton() {
  const { user } = useAuth();
  const { 
    hasAccess, 
    shareProgress, 
    isLoading,
    validateInviteCode,
    isUsingInvite,
    completeQuiz,
    isCompletingQuiz 
  } = useCommunity();
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  const handleClick = () => {
    if (!user) {
      // User needs to login first, then we'll show the modal
      navigate("/auth?redirect=/comunidade/desbloquear");
      return;
    }
    
    if (hasAccess) {
      navigate("/comunidade");
    } else {
      // Open the welcome modal for users without access
      setShowWelcomeModal(true);
    }
  };

  const handleInviteValidate = async (code: string) => {
    await validateInviteCode(code);
    setShowWelcomeModal(false);
    navigate("/auth-comunidade");
  };

  const handleQuizComplete = async () => {
    await completeQuiz();
    setShowWelcomeModal(false);
    navigate("/auth-comunidade");
  };
  
  return (
    <>
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

      <CommunityWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onInviteValidate={handleInviteValidate}
        onQuizComplete={handleQuizComplete}
        isValidatingInvite={isUsingInvite}
        isCompletingQuiz={isCompletingQuiz}
      />
    </>
  );
}
