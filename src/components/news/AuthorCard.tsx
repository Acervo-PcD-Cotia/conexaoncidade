import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface AuthorCardProps {
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const initials = author.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AU';

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={author.avatar_url || undefined} alt={author.full_name || 'Autor'} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Escrito por</p>
            <h4 className="font-semibold text-lg">{author.full_name || 'Autor'}</h4>
            {author.bio && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
