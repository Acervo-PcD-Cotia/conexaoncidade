import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Radio, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ActivationCTAsProps {
  variant?: "default" | "large";
}

export function ActivationCTAs({ variant = "default" }: ActivationCTAsProps) {
  const { user } = useAuth();
  
  const buttonSize = variant === "large" ? "lg" : "default";
  const buttonClass = variant === "large" 
    ? "text-lg px-8 py-6 h-auto" 
    : "";

  // For now, we show both CTAs - in the future this can check partner status
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      {user ? (
        <>
          {/* Already logged in - show activate button */}
          <Button 
            size={buttonSize} 
            className={`bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 ${buttonClass}`}
            asChild
          >
            <Link to="/admin/broadcast">
              <Radio className="h-5 w-5 mr-2" />
              Ativar minha Web Rádio / TV
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </>
      ) : (
        <>
          {/* Not logged in - show both options */}
          <Button 
            size={buttonSize} 
            className={`bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 ${buttonClass}`}
            asChild
          >
            <Link to="/comunidade">
              <Users className="h-5 w-5 mr-2" />
              Quero ser Parceiro e ganhar minha Rádio/TV
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
          
          <Button 
            size={buttonSize} 
            variant="outline"
            className={buttonClass}
            asChild
          >
            <Link to="/auth?redirect=/admin/broadcast">
              Já sou Parceiro - Ativar agora
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
