import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useTenantModulesConfig } from "@/hooks/useTenantModulesConfig";
import { useTenantProfileConfig } from "@/hooks/useTenantProfileConfig";
import { useUserTenantPreferences } from "@/hooks/useUserTenantPreferences";
import { useAuth } from "@/contexts/AuthContext";
import {
  PROFILE_DEFAULT_MODULES,
  type SystemModule,
  type UserProfile,
} from "@/types/profiles-modules";

interface ProfileModulesContextType {
  // Profile
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => Promise<void>;
  allowedProfiles: UserProfile[];

  // Modules
  enabledModules: SystemModule[];
  isModuleEnabled: (module: SystemModule) => boolean;

  // Onboarding
  showOnboarding: boolean;
  dismissOnboarding: () => Promise<void>;

  // State
  isLoading: boolean;
  isAuthenticated: boolean;
}

const ProfileModulesContext = createContext<ProfileModulesContextType | undefined>(
  undefined
);

export function ProfileModulesProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  // Hooks de dados
  const {
    enabledModules: tenantModules,
    isModuleEnabled: checkTenantModule,
    isLoading: modulesLoading,
  } = useTenantModulesConfig();

  const { allowedProfiles, defaultProfile, isLoading: profileConfigLoading } =
    useTenantProfileConfig();

  const {
    activeProfile: userActiveProfile,
    dismissedOnboarding,
    updateProfile,
    dismissOnboarding: dismissOnboardingMutation,
    isLoading: prefsLoading,
  } = useUserTenantPreferences();

  // Estado local para profile (otimistic update)
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  // Sync local profile com dados do servidor
  useEffect(() => {
    if (userActiveProfile && !localProfile) {
      setLocalProfile(userActiveProfile);
    }
  }, [userActiveProfile, localProfile]);

  const activeProfile = localProfile || userActiveProfile || defaultProfile;

  // Calcular módulos habilitados (tenant + default do perfil)
  const enabledModules = useMemo(() => {
    const modules = new Set<SystemModule>(tenantModules);

    // Se não há módulos configurados no tenant, usa defaults do perfil
    if (tenantModules.length === 0) {
      const defaultModules = PROFILE_DEFAULT_MODULES[activeProfile] || [];
      defaultModules.forEach((m) => modules.add(m));
    }

    return Array.from(modules);
  }, [tenantModules, activeProfile]);

  // Verificar se módulo está habilitado
  const isModuleEnabled = (module: SystemModule): boolean => {
    // Primeiro verifica módulos do tenant
    if (checkTenantModule(module)) return true;

    // Se não há módulos configurados, verifica defaults do perfil
    if (tenantModules.length === 0) {
      const defaultModules = PROFILE_DEFAULT_MODULES[activeProfile] || [];
      return defaultModules.includes(module);
    }

    return false;
  };

  // Atualizar perfil
  const setActiveProfile = async (profile: UserProfile) => {
    setLocalProfile(profile); // Optimistic update
    try {
      await updateProfile(profile);
    } catch (error) {
      setLocalProfile(null); // Reverter em caso de erro
      throw error;
    }
  };

  // Dispensar onboarding
  const dismissOnboarding = async () => {
    await dismissOnboardingMutation();
  };

  // Mostrar onboarding se: autenticado, não dispensou, e dados carregados
  const showOnboarding =
    isAuthenticated &&
    !dismissedOnboarding &&
    !prefsLoading &&
    !profileConfigLoading;

  const isLoading =
    authLoading || modulesLoading || profileConfigLoading || prefsLoading;

  const value: ProfileModulesContextType = {
    activeProfile,
    setActiveProfile,
    allowedProfiles,
    enabledModules,
    isModuleEnabled,
    showOnboarding,
    dismissOnboarding,
    isLoading,
    isAuthenticated,
  };

  return (
    <ProfileModulesContext.Provider value={value}>
      {children}
    </ProfileModulesContext.Provider>
  );
}

export function useProfileModules() {
  const context = useContext(ProfileModulesContext);
  if (context === undefined) {
    throw new Error(
      "useProfileModules must be used within a ProfileModulesProvider"
    );
  }
  return context;
}
