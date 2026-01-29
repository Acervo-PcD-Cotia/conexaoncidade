import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, UserPlus, List, Shield, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  {
    icon: UserPlus,
    label: "Novo Usuário",
    description: "Adicionar membro à equipe",
    href: "/admin/users/new",
  },
  {
    icon: List,
    label: "Listar Usuários",
    description: "Ver todos os usuários",
    href: "/admin/users",
  },
  {
    icon: Shield,
    label: "Permissões",
    description: "Gerenciar papéis e acessos",
    href: "/admin/users/permissions",
  },
];

export function UserManagementPanel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30">
            <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold">Gestão de Usuários</h3>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md",
                "hover:bg-muted/50 transition-colors group"
              )}
            >
              <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {link.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
