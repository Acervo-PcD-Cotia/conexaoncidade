import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Share2, MessageSquare, UserPlus, BookOpen, Newspaper, 
  Trophy, Star, Award, Target, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommunityLayout } from '@/components/community/CommunityLayout';

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
    <CommunityLayout>
      <Helmet>
        <title>Como Ganhar Pontos | Comunidade Conexão na Cidade</title>
        <meta name="description" content="Descubra todas as formas de ganhar pontos na comunidade e suba de nível para desbloquear benefícios exclusivos." />
      </Helmet>

      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
            <Star className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Como Ganhar Pontos</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Participe, engaje e suba de nível na comunidade! Cada ação contribui para seu crescimento.
          </p>
        </div>

        {/* Point Actions */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold">Ações que Geram Pontos</h2>
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
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                  <p className="text-xs bg-muted p-2 rounded italic">💡 {action.tip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Levels */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold">Níveis da Comunidade</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {levels.map((level, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <span className="text-3xl">{level.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{level.name}</h3>
                        <Badge variant="secondary">{level.points}+ pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{level.benefits}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Special Badges */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold">Badges Especiais</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specialBadges.map((badge, index) => (
              <Card key={index} className="text-center p-4">
                <span className="text-4xl mb-2 block">{badge.icon}</span>
                <h3 className="font-semibold mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
            <p className="mb-4 opacity-90">
              Participe dos desafios e ganhe pontos extras!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild variant="secondary">
                <Link to="/comunidade/desafios">Ver Desafios</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                <Link to="/comunidade">Voltar à Comunidade</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommunityLayout>
  );
}
