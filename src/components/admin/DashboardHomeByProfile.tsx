import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Sparkles,
  Church,
  Radio,
  GraduationCap,
  Medal,
  PenLine,
  Calendar,
  Search,
  Zap,
  Video,
  Film,
  Link as LinkIcon,
  BookOpen,
  Users,
  Heart,
  Play,
  Target,
  TrendingUp,
  Briefcase,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { useProfileModules } from "@/contexts/ProfileModulesContext";
import {
  PROFILE_QUICK_ACTIONS,
  PROFILE_METADATA,
  type QuickActionCard,
} from "@/types/profiles-modules";

// Mapa de ícones para lookup dinâmico
const ICON_MAP: Record<string, LucideIcon> = {
  Newspaper,
  Sparkles,
  Church,
  Radio,
  GraduationCap,
  Medal,
  PenLine,
  Calendar,
  Search,
  Zap,
  Video,
  Film,
  Link: LinkIcon,
  BookOpen,
  Users,
  Heart,
  Play,
  Target,
  TrendingUp,
  Briefcase,
  Inbox,
};

export function DashboardHomeByProfile() {
  const { activeProfile, isModuleEnabled, isLoading } = useProfileModules();

  // Filtrar ações baseado nos módulos habilitados
  const filteredActions = useMemo(() => {
    const profileActions = PROFILE_QUICK_ACTIONS[activeProfile] || [];
    
    return profileActions.filter((action) => {
      if (!action.requiredModule) return true;
      return isModuleEnabled(action.requiredModule);
    });
  }, [activeProfile, isModuleEnabled]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-lg bg-muted mb-3" />
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const profileMeta = PROFILE_METADATA[activeProfile];
  const ProfileIcon = ICON_MAP[profileMeta.icon];

  return (
    <div className="space-y-4">
      {/* Header com perfil ativo */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "p-2 rounded-lg bg-gradient-to-br text-white",
            profileMeta.gradient
          )}
        >
          {ProfileIcon && <ProfileIcon className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            Modo {profileMeta.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            Próximos passos para você
          </p>
        </div>
      </div>

      {/* Cards de ações rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredActions.map((action, index) => (
          <QuickActionCardComponent
            key={action.id}
            action={action}
            index={index}
          />
        ))}
      </div>

      {/* Mensagem se não há ações */}
      {filteredActions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">Nenhuma ação disponível</h3>
            <p className="text-sm text-muted-foreground">
              Ative mais módulos nas configurações para ver ações aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuickActionCardComponent({
  action,
  index,
}: {
  action: QuickActionCard;
  index: number;
}) {
  const IconComponent = ICON_MAP[action.icon];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={action.href}>
        <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer h-full">
          <CardContent className="p-4">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                colorClasses[action.color] || colorClasses.blue
              )}
            >
              {IconComponent && <IconComponent className="h-5 w-5" />}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {action.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
