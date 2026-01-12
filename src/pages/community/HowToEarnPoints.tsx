import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Share2, MessageSquare, UserPlus, BookOpen, Newspaper, 
  Trophy, Star, Award, ArrowLeft, Target, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PointAction {
  icon: React.ReactNode;
  title: string;
  points: number;
  description: string;
  tip: string;
  color: string;
}

const pointActions: PointAction[] = [
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Compartilhar Notícia',
    points: 10,
    description: 'Compartilhe via WhatsApp, Facebook, X ou LinkedIn',
    tip: 'Compartilhe notícias da sua cidade para engajar mais!',
    color: 'bg-blue-500'
  },
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: 'Compartilhar Edição Digital',
    points: 15,
    description: 'Divulgue a edição digital do portal',
    tip: 'Bônus maior para ajudar a distribuir o jornal!',
    color: 'bg-purple-500'
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Comentário Aprovado',
    points: 5,
    description: 'Contribua com comentários construtivos',
    tip: 'Comentários relevantes e respeitosos são aprovados mais rápido!',
    color: 'bg-green-500'
  },
  {
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Indicar Amigo',
    points: 20,
    description: 'Traga novos membros para a comunidade',
    tip: 'Seu amigo ganha acesso e você ganha pontos!',
    color: 'bg-orange-500'
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Leitura Completa (Notícia)',
    points: 3,
    description: 'Leia uma matéria por completo',
    tip: 'Role até o final e permaneça por 45+ segundos',
    color: 'bg-teal-500'
  },
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: 'Leitura Completa (Edição)',
    points: 5,
    description: 'Leia uma edição digital por completo',
    tip: 'Explore todas as seções da edição!',
    color: 'bg-indigo-500'
  }
];

const levels = [
  { name: 'Apoiador', points: 0, icon: '🌱', benefits: 'Acesso básico à comunidade' },
  { name: 'Colaborador', points: 500, icon: '🌿', benefits: 'Criar enquetes e votações' },
  { name: 'Embaixador', points: 2000, icon: '🌳', benefits: 'Convidar novos membros' },
  { name: 'Líder', points: 5000, icon: '👑', benefits: 'Moderar conteúdo, acesso VIP' }
];

const specialBadges = [
  { name: 'Membro Fundador', icon: '🏅', description: 'Completou o desafio de 12 compartilhamentos' },
  { name: 'Convidado', icon: '🎫', description: 'Entrou por convite de outro membro' },
  { name: 'Compartilhador da Semana', icon: '📤', description: 'Top 3 compartilhadores da semana' },
  { name: 'Formador de Opinião', icon: '💬', description: '10+ comentários aprovados no mês' },
  { name: 'Leitor Dedicado', icon: '📖', description: '5+ leituras completas na semana' }
];

export default function HowToEarnPoints() {
  return (
    <>
      <Helmet>
        <title>Como Ganhar Pontos | Comunidade Conexão na Cidade</title>
        <meta name="description" content="Descubra todas as formas de ganhar pontos na comunidade e suba de nível para desbloquear benefícios exclusivos." />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero */}
        <section className="py-12 px-4">
          <div className="container max-w-4xl mx-auto">
            <Link to="/comunidade" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Voltar à Comunidade
            </Link>

            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Como Ganhar Pontos</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Participe, engaje e suba de nível na comunidade! Cada ação contribui para seu crescimento.
              </p>
            </div>
          </div>
        </section>

        {/* Point Actions */}
        <section className="py-8 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Ações que Geram Pontos</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {pointActions.map((action, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`absolute top-0 right-0 ${action.color} text-white px-3 py-1 text-sm font-bold rounded-bl-lg`}>
                    +{action.points} pts
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{action.description}</p>
                    <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                      <span className="text-lg">💡</span>
                      <p className="text-sm text-muted-foreground">{action.tip}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Levels */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Níveis da Comunidade</h2>
            </div>

            <div className="grid gap-4">
              {levels.map((level, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className="text-4xl">{level.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{level.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {level.points === 0 ? 'Inicial' : `${level.points.toLocaleString()}+ pts`}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{level.benefits}</p>
                    </div>
                    {index < levels.length - 1 && (
                      <div className="hidden sm:block text-muted-foreground">→</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Special Badges */}
        <section className="py-12 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Selos Especiais</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {specialBadges.map((badge, index) => (
                <Card key={index} className="flex items-center gap-3 p-4 hover:shadow-md transition-shadow">
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <h3 className="font-medium">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-8">
                <Target className="w-12 h-12 mx-auto text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-2">Pronto para começar?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Explore os desafios ativos e comece a acumular pontos hoje mesmo!
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/comunidade/desafios">
                    <Button size="lg">
                      <Trophy className="w-4 h-4 mr-2" />
                      Ver Desafios Ativos
                    </Button>
                  </Link>
                  <Link to="/comunidade">
                    <Button variant="outline" size="lg">
                      Ir para Comunidade
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
