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
    if (hasAccess) {
      // User has access - go directly to community
      navigate("/comunidade");
    } else {
      // User doesn't have access - show welcome modal (works for both logged in and not logged in)
      setShowWelcomeModal(true);
    }
  };

  const handleInviteValidate = async (code: string) => {
    if (user) {
      // User is logged in - validate and grant access directly
      await validateInviteCode(code);
      setShowWelcomeModal(false);
      navigate("/comunidade");
    } else {
      // User is NOT logged in - redirect to auth with invite code param
      setShowWelcomeModal(false);
      navigate(`/auth-comunidade?invite=${encodeURIComponent(code)}`);
    }
  };

  const handleQuizComplete = async () => {
    if (user) {
      // User is logged in - complete quiz and grant access directly
      await completeQuiz();
      setShowWelcomeModal(false);
      navigate("/comunidade");
    } else {
      // User is NOT logged in - redirect to auth with quiz completed param
      setShowWelcomeModal(false);
      navigate("/auth-comunidade?quiz_completed=true");
    }
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
