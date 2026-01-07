import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Search, Globe } from 'lucide-react';

interface SeoValidatorProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  hat: string;
  featuredImageUrl: string;
  imageAlt: string;
  slug: string;
}

interface SeoCheck {
  name: string;
  valid: boolean;
  warning?: boolean;
  message: string;
}

export function SeoValidator({
  title,
  metaTitle,
  metaDescription,
  hat,
  featuredImageUrl,
  imageAlt,
  slug,
}: SeoValidatorProps) {
  const checks = useMemo((): SeoCheck[] => {
    const items: SeoCheck[] = [];

    // Hat check
    const hatLength = hat?.length || 0;
    items.push({
      name: 'Chapéu',
      valid: hatLength > 0 && hatLength <= 19,
      warning: hatLength > 19,
      message: hatLength === 0 
        ? 'Adicione um chapéu' 
        : hatLength > 19 
          ? `${hatLength}/19 caracteres (muito longo)` 
          : `${hatLength}/19 caracteres`
    });

    // Meta title check
    const metaTitleLength = metaTitle?.length || 0;
    items.push({
      name: 'Meta Título',
      valid: metaTitleLength >= 30 && metaTitleLength <= 60,
      warning: metaTitleLength > 0 && (metaTitleLength < 30 || metaTitleLength > 60),
      message: metaTitleLength === 0 
        ? 'Adicione um meta título' 
        : metaTitleLength > 60 
          ? `${metaTitleLength}/60 (muito longo)` 
          : metaTitleLength < 30 
            ? `${metaTitleLength}/60 (muito curto)` 
            : `${metaTitleLength}/60 caracteres`
    });

    // Meta description check
    const metaDescLength = metaDescription?.length || 0;
    items.push({
      name: 'Meta Descrição',
      valid: metaDescLength >= 120 && metaDescLength <= 160,
      warning: metaDescLength > 0 && (metaDescLength < 120 || metaDescLength > 160),
      message: metaDescLength === 0 
        ? 'Adicione uma meta descrição' 
        : metaDescLength > 160 
          ? `${metaDescLength}/160 (muito longa)` 
          : metaDescLength < 120 
            ? `${metaDescLength}/160 (muito curta)` 
            : `${metaDescLength}/160 caracteres`
    });

    // Image check
    items.push({
      name: 'Imagem Principal',
      valid: !!featuredImageUrl,
      message: featuredImageUrl ? 'Definida' : 'Adicione uma imagem'
    });

    // Image alt check
    items.push({
      name: 'Alt da Imagem',
      valid: !!imageAlt,
      warning: !!featuredImageUrl && !imageAlt,
      message: imageAlt ? 'Definido' : 'Adicione texto alternativo'
    });

    // Slug check
    items.push({
      name: 'URL (Slug)',
      valid: !!slug && slug.length > 3,
      message: slug ? 'Definida' : 'Defina o slug'
    });

    return items;
  }, [hat, metaTitle, metaDescription, featuredImageUrl, imageAlt, slug]);

  const score = useMemo(() => {
    const validCount = checks.filter(c => c.valid).length;
    return Math.round((validCount / checks.length) * 100);
  }, [checks]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const displayTitle = metaTitle || title || 'Título da notícia aqui';
  const displayDescription = metaDescription || 'Adicione uma meta descrição para ver o preview aqui...';
  const displayUrl = slug ? `conexaonacidade.com.br/${slug}` : 'conexaonacidade.com.br/...';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4" />
          Validação SEO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pontuação</span>
            <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}%</span>
          </div>
          <Progress 
            value={score} 
            className="h-2"
            style={{ 
              ['--progress-background' as string]: score >= 80 ? 'rgb(34 197 94)' : score >= 50 ? 'rgb(234 179 8)' : 'rgb(239 68 68)'
            }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {check.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : check.warning ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{check.name}</span>
              </div>
              <Badge 
                variant={check.valid ? 'default' : check.warning ? 'secondary' : 'destructive'}
                className="text-[10px] font-normal"
              >
                {check.message}
              </Badge>
            </div>
          ))}
        </div>

        {/* Google Preview */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            Preview Google
          </div>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-green-700 truncate">{displayUrl}</p>
            <p className="text-sm text-blue-600 font-medium line-clamp-1 hover:underline cursor-pointer">
              {displayTitle}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {displayDescription}
            </p>
          </div>
        </div>

        {score < 80 && (
          <p className="text-[10px] text-muted-foreground text-center">
            Complete os itens acima para melhorar o SEO
          </p>
        )}
      </CardContent>
    </Card>
  );
}
