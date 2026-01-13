import { Link } from "react-router-dom";
import { Trophy, MessageSquare, Share2, ShieldCheck, UserPlus, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const POINT_ACTIONS = [
  { icon: BookOpen, label: "Criar publicação", points: 10, color: "text-blue-500" },
  { icon: MessageSquare, label: "Comentar", points: 5, color: "text-green-500" },
  { icon: Share2, label: "Compartilhar notícia", points: 5, color: "text-purple-500" },
  { icon: ShieldCheck, label: "Verificar no Check Fake News", points: 15, color: "text-emerald-500" },
  { icon: UserPlus, label: "Convidar novo membro", points: 20, color: "text-orange-500" },
];

export function GamificationCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Como ganhar pontos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {POINT_ACTIONS.slice(0, 4).map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${action.color}`} />
                  <span className="text-muted-foreground">{action.label}</span>
                </div>
                <span className="font-semibold text-primary">+{action.points}</span>
              </div>
            );
          })}
        </div>
        
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/comunidade/como-ganhar-pontos" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Ver todas as formas
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
