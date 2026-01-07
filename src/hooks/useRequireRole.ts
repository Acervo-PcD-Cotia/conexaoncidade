import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "editor" | "columnist" | "moderator";

export function useRequireRole(allowedRoles: AppRole[]) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    async function checkRole() {
      if (isLoading) return;

      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          navigate("/");
          return;
        }

        const role = data.role as AppRole;
        setUserRole(role);

        if (allowedRoles.includes(role)) {
          setHasAccess(true);
        } else {
          navigate("/");
        }
      } catch {
        navigate("/");
      } finally {
        setCheckingRole(false);
      }
    }

    checkRole();
  }, [user, isLoading, navigate, allowedRoles]);

  return { hasAccess, checkingRole, userRole };
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

  return { role, loading, isAdmin: role === "admin", isEditor: role === "admin" || role === "editor" };
}
