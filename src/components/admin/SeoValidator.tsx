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
  selectedTags?: string[];
  excerpt?: string;
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
  selectedTags = [],
  excerpt = '',
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

    // Meta title check (required, ≤60)
    const metaTitleLength = metaTitle?.length || 0;
    items.push({
      name: 'Meta Título',
      valid: metaTitleLength > 0 && metaTitleLength <= 60,
      warning: metaTitleLength > 60,
      message: metaTitleLength === 0 
        ? 'Obrigatório (≤60)' 
        : metaTitleLength > 60 
          ? `${metaTitleLength}/60 (excedido!)` 
          : `${metaTitleLength}/60 ✓`
    });

    // Meta description check (required, ≤160)
    const metaDescLength = metaDescription?.length || 0;
    items.push({
      name: 'Meta Descrição',
      valid: metaDescLength > 0 && metaDescLength <= 160,
      warning: metaDescLength > 160,
      message: metaDescLength === 0 
        ? 'Obrigatório (≤160)' 
        : metaDescLength > 160 
          ? `${metaDescLength}/160 (excedido!)` 
          : `${metaDescLength}/160 ✓`
    });

    // Excerpt/Summary check (required, ≤160)
    const excerptLength = excerpt?.length || 0;
    items.push({
      name: 'Resumo',
      valid: excerptLength > 0 && excerptLength <= 160,
      warning: excerptLength > 160,
      message: excerptLength === 0 
        ? 'Obrigatório (≤160)' 
        : excerptLength > 160 
          ? `${excerptLength}/160 (excedido!)` 
          : `${excerptLength}/160 ✓`
    });

    // Tags check (exactly 12)
    const tagCount = selectedTags?.length || 0;
    items.push({
      name: 'Tags',
      valid: tagCount === 12,
      warning: tagCount > 0 && tagCount !== 12,
      message: tagCount === 12 
        ? '12/12 tags ✓' 
        : tagCount === 0 
          ? '0/12 tags (obrigatório)' 
          : tagCount < 12 
            ? `${tagCount}/12 (faltam ${12 - tagCount})` 
            : `${tagCount}/12 (remova ${tagCount - 12})`
    });

    // Image check
    items.push({
      name: 'Imagem Principal',
      valid: !!featuredImageUrl,
      message: featuredImageUrl ? 'Definida ✓' : 'Obrigatória'
    });

    // Image alt check
    items.push({
      name: 'ALT da Imagem',
      valid: !!imageAlt,
      warning: !!featuredImageUrl && !imageAlt,
      message: imageAlt ? 'Definido ✓' : 'Obrigatório'
    });

    // Slug check
    items.push({
      name: 'URL (Slug)',
      valid: !!slug && slug.length > 3,
      message: slug ? 'Definida ✓' : 'Obrigatório'
    });

    return items;
  }, [hat, metaTitle, metaDescription, excerpt, selectedTags, featuredImageUrl, imageAlt, slug]);

  const score = useMemo(() => {
    const validCount = checks.filter(c => c.valid).length;
    return Math.round((validCount / checks.length) * 100);
  }, [checks]);

  const getScoreColor = (score: number) => {
    if (score >= 100) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
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
              ['--progress-background' as string]: score >= 100 ? 'rgb(34 197 94)' : score >= 80 ? 'rgb(234 179 8)' : 'rgb(239 68 68)'
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

        {score < 100 && (
          <p className="text-[10px] text-muted-foreground text-center">
            Complete todos os itens para publicar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
