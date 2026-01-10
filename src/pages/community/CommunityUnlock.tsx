import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { CommunityWelcomeModal } from "@/components/community/CommunityWelcomeModal";

/**
 * CommunityUnlock page - Simplified to just show the fullscreen modal
 * This page acts as a redirect handler that displays the welcome modal
 */
export default function CommunityUnlock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    hasAccess, 
    isLoading,
    validateInviteCode,
    isUsingInvite,
    completeQuiz,
    isCompletingQuiz
  } = useCommunity();
  
  const [showModal, setShowModal] = useState(true);

  // Redirect if user already has access
  useEffect(() => {
    if (!isLoading && hasAccess) {
      navigate("/comunidade");
    }
  }, [hasAccess, isLoading, navigate]);

  const handleInviteValidate = async (code: string) => {
    if (user) {
      // User is logged in - validate and grant access directly
      await validateInviteCode(code);
      navigate("/comunidade");
    } else {
      // User is NOT logged in - redirect to auth with invite code param
      navigate(`/auth-comunidade?invite=${encodeURIComponent(code)}`);
    }
  };

  const handleQuizComplete = async () => {
    if (user) {
      // User is logged in - complete quiz and grant access directly
      await completeQuiz();
      navigate("/comunidade");
    } else {
      // User is NOT logged in - redirect to auth with quiz completed param
      navigate("/auth-comunidade?quiz_completed=true");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    navigate("/");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <CommunityWelcomeModal
      isOpen={showModal}
      onClose={handleClose}
      onInviteValidate={handleInviteValidate}
      onQuizComplete={handleQuizComplete}
      isValidatingInvite={isUsingInvite}
      isCompletingQuiz={isCompletingQuiz}
    />
  );
}
