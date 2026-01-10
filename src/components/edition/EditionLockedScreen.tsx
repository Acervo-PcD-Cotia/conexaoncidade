import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Lock, 
  Sparkles, 
  Target, 
  Share2, 
  MessageCircle, 
  UserPlus,
  Trophy,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DigitalEdition } from "@/hooks/useDigitalEditions";
import { EditionAccessResult } from "@/hooks/useEditionAccess";

interface EditionLockedScreenProps {
  edition: DigitalEdition;
  accessCheck: EditionAccessResult;
}

export function EditionLockedScreen({ edition, accessCheck }: EditionLockedScreenProps) {
  const { user_points, required_points } = accessCheck;
  const progress = Math.min((user_points / required_points) * 100, 100);
  const pointsNeeded = Math.max(0, required_points - user_points);
  
  // Calculate approximate shares needed (10 points per share)
  const sharesNeeded = Math.ceil(pointsNeeded / 10);

  const pointsActivities = [
    { icon: Share2, label: "Compartilhar notícia", points: "+10 pts" },
    { icon: BookOpen, label: "Compartilhar edição", points: "+15 pts" },
    { icon: MessageCircle, label: "Comentário aprovado", points: "+5 pts" },
    { icon: UserPlus, label: "Indicar um amigo", points: "+20 pts" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            ← Voltar ao início
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-2 border-primary/20">
            {/* Cover Preview */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-muted overflow-hidden">
              {edition.cover_image_url && (
                <img 
                  src={edition.cover_image_url} 
                  alt={edition.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="bg-background/90 backdrop-blur-sm rounded-full p-4 mb-4 mx-auto w-fit shadow-lg"
                  >
                    <Lock className="h-8 w-8 text-primary" />
                  </motion.div>
                  <Badge variant="secondary" className="text-sm">
                    Conteúdo Exclusivo
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {edition.title}
                </h1>
                <p className="text-muted-foreground">
                  Esta edição requer mais pontos para acessar
                </p>
              </div>

              {/* Progress Section */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-muted/50 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Sua pontuação
                  </span>
                  <span className="font-mono font-bold text-lg">
                    {user_points} pts
                  </span>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 pts</span>
                    <span className="font-medium text-foreground">
                      Necessário: {required_points} pts
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-sm">
                    <span className="text-primary font-bold">🎯 Faltam apenas {pointsNeeded} pontos!</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aproximadamente {sharesNeeded} compartilhamentos
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <Button asChild variant="default" className="gap-2">
                  <Link to="/comunidade">
                    <Target className="h-4 w-4" />
                    Ver Desafios
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/">
                    <Sparkles className="h-4 w-4" />
                    Ganhar Pontos
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/comunidade">
                    <ArrowRight className="h-4 w-4" />
                    Comunidade
                  </Link>
                </Button>
              </motion.div>

              {/* How to Earn Points */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Formas de ganhar pontos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {pointsActivities.map((activity) => (
                    <div 
                      key={activity.label}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                    >
                      <activity.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-xs">{activity.label}</span>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {activity.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Motivational Footer */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Dica:</strong> Compartilhe suas notícias favoritas nas redes sociais 
                  para acumular pontos rapidamente!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
