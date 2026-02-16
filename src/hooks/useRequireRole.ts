import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "admin" | "editor" | "columnist" | "moderator" | "editor_chief" | "reporter" | "collaborator" | "commercial" | "financial";

type DeniedReason = 'not_authenticated' | 'not_authorized' | null;

export function useRequireRole(allowedRoles: AppRole[]) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [showDenied, setShowDenied] = useState<DeniedReason>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function checkRole() {
      if (isLoading) return;

      if (!user) {
        setShowDenied('not_authenticated');
        setCheckingRole(false);
        
        // Start countdown
        let countdown = 3;
        setRedirectCountdown(countdown);
        
        redirectTimerRef.current = setInterval(() => {
          countdown -= 1;
          setRedirectCountdown(countdown);
          
          if (countdown <= 0) {
            if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
            window.location.href = "https://conexaoncidade.lovable.app/spah";
          }
        }, 1000);
        
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          setShowDenied('not_authorized');
          setCheckingRole(false);
          
          // Start countdown
          let countdown = 3;
          setRedirectCountdown(countdown);
          
          redirectTimerRef.current = setInterval(() => {
            countdown -= 1;
            setRedirectCountdown(countdown);
            
            if (countdown <= 0) {
              if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
              window.location.href = "https://conexaoncidade.lovable.app/spah";
            }
          }, 1000);
          
          return;
        }

        const role = data.role as AppRole;
        setUserRole(role);

        // Super Admin tem acesso a TODAS as áreas
        if (role === "super_admin" || allowedRoles.includes(role)) {
          setHasAccess(true);
          setCheckingRole(false);
        } else {
          setShowDenied('not_authorized');
          setCheckingRole(false);
          
          // Start countdown
          let countdown = 3;
          setRedirectCountdown(countdown);
          
          redirectTimerRef.current = setInterval(() => {
            countdown -= 1;
            setRedirectCountdown(countdown);
            
            if (countdown <= 0) {
              if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
              window.location.href = "https://conexaoncidade.lovable.app/spah";
            }
          }, 1000);
        }
      } catch {
        setShowDenied('not_authorized');
        setCheckingRole(false);
        
        // Start countdown
        let countdown = 3;
        setRedirectCountdown(countdown);
        
        redirectTimerRef.current = setInterval(() => {
          countdown -= 1;
          setRedirectCountdown(countdown);
          
          if (countdown <= 0) {
            if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
            window.location.href = "https://conexaoncidade.lovable.app/spah";
          }
        }, 1000);
      }
    }

    checkRole();
    
    return () => {
      if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
    };
  }, [user, isLoading, navigate, allowedRoles]);

  return { hasAccess, checkingRole, userRole, showDenied, redirectCountdown };
}

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          setRole(null);
        } else {
          setRole(data.role as AppRole);
        }
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "super_admin" || role === "admin";
  const isEditor = isAdmin || role === "editor";
  
  return { role, loading, isSuperAdmin, isAdmin, isEditor };
}
