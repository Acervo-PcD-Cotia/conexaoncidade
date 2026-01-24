import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SsoNavigationOptions {
  openInNewTab?: boolean;
}

export function useSsoNavigation() {
  const [isLoading, setIsLoading] = useState(false);

  const navigateToGcotia = async (options: SsoNavigationOptions = { openInNewTab: true }) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("sso-start", {
        body: { targetApp: "gcotia" }
      });

      if (error) {
        console.error("SSO error:", error);
        throw new Error(error.message || "Erro ao iniciar SSO");
      }

      if (!data?.redirect_url) {
        throw new Error("URL de redirecionamento não recebida");
      }

      // Abrir em nova aba ou redirecionar
      if (options.openInNewTab) {
        window.open(data.redirect_url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = data.redirect_url;
      }
      
    } catch (error) {
      console.error("Erro ao iniciar SSO:", error);
      toast.error("Não foi possível acessar o Geração Cotia. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToApp = async (
    targetApp: string, 
    options: SsoNavigationOptions = { openInNewTab: true }
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("sso-start", {
        body: { targetApp }
      });

      if (error) {
        console.error("SSO error:", error);
        throw new Error(error.message || "Erro ao iniciar SSO");
      }

      if (!data?.redirect_url) {
        throw new Error("URL de redirecionamento não recebida");
      }

      if (options.openInNewTab) {
        window.open(data.redirect_url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = data.redirect_url;
      }
      
    } catch (error) {
      console.error("Erro ao iniciar SSO:", error);
      toast.error("Não foi possível acessar o aplicativo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    navigateToGcotia, 
    navigateToApp,
    isLoading 
  };
}
