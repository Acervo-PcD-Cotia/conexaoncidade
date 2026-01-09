import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationItem {
  name: string;
  valid: boolean;
  warning?: boolean;
  message: string;
}

interface NewsValidationCardProps {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  selectedTags: string[];
  imageAlt: string;
  categoryId: string;
  featuredImageUrl: string;
}

export function NewsValidationCard({
  title,
  excerpt,
  metaTitle,
  metaDescription,
  selectedTags,
  imageAlt,
  categoryId,
  featuredImageUrl,
}: NewsValidationCardProps) {
  const validations = useMemo((): ValidationItem[] => {
    const items: ValidationItem[] = [];

    // Title: 6-120 characters
    const titleLength = title?.length || 0;
    items.push({
      name: 'Título',
      valid: titleLength >= 6 && titleLength <= 120,
      warning: titleLength > 0 && (titleLength < 6 || titleLength > 120),
      message: titleLength === 0 
        ? 'Obrigatório (6-120)' 
        : titleLength < 6 
          ? `${titleLength}/6 (mínimo 6)` 
          : titleLength > 120 
            ? `${titleLength}/120 (máximo 120)` 
            : `${titleLength}/120 ✓`
    });

    // Excerpt/Summary: ≤160 characters
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

    // Meta title: ≤60 characters
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

    // Meta description: ≤160 characters
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

    // Tags: exactly 12
    const tagCount = selectedTags?.length || 0;
    items.push({
      name: 'Tags',
      valid: tagCount === 12,
      warning: tagCount > 0 && tagCount !== 12,
      message: tagCount === 12 
        ? '12/12 ✓' 
        : tagCount === 0 
          ? 'Obrigatório (12 tags)' 
          : tagCount < 12 
            ? `${tagCount}/12 (faltam ${12 - tagCount})` 
            : `${tagCount}/12 (remova ${tagCount - 12})`
    });

    // Image ALT: required
    items.push({
      name: 'ALT da Imagem',
      valid: !!imageAlt,
      message: imageAlt ? 'Definido ✓' : 'Obrigatório'
    });

    // Category: required
    items.push({
      name: 'Categoria',
      valid: !!categoryId,
      message: categoryId ? 'Selecionada ✓' : 'Obrigatória'
    });

    // Hero image: required
    items.push({
      name: 'Imagem Hero',
      valid: !!featuredImageUrl,
      message: featuredImageUrl ? 'Adicionada ✓' : 'Obrigatória'
    });

    return items;
  }, [title, excerpt, metaTitle, metaDescription, selectedTags, imageAlt, categoryId, featuredImageUrl]);

  const validCount = validations.filter(v => v.valid).length;
  const totalCount = validations.length;
  const percentage = Math.round((validCount / totalCount) * 100);
  const canSave = validCount === totalCount;

  return (
    <Card className={cn(
      "transition-all",
      canSave ? "border-green-500/50 bg-green-50/30 dark:bg-green-900/10" : "border-destructive/50"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canSave ? (
              <Unlock className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-destructive" />
            )}
            Validações Obrigatórias
          </div>
          <span className={cn(
            "text-sm font-bold",
            canSave ? "text-green-600" : "text-destructive"
          )}>
            {validCount}/{totalCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <Progress 
          value={percentage} 
          className="h-2"
        />

        {/* Validation items */}
        <div className="space-y-2">
          {validations.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {item.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : item.warning ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <span className={cn(
                  item.valid ? "text-muted-foreground" : "font-medium"
                )}>
                  {item.name}
                </span>
              </div>
              <span className={cn(
                "text-xs",
                item.valid 
                  ? "text-green-600" 
                  : item.warning 
                    ? "text-yellow-600" 
                    : "text-destructive"
              )}>
                {item.message}
              </span>
            </div>
          ))}
        </div>

        {!canSave && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Complete os {totalCount - validCount} itens restantes para salvar
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Export validation check function for use in NewsEditor
export function validateNewsForm(data: {
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  selectedTags: string[];
  image_alt: string;
  category_id: string;
  featured_image_url: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Title: 6-120 characters
  if (!data.title || data.title.length < 6 || data.title.length > 120) {
    errors.push('Título deve ter entre 6 e 120 caracteres');
  }

  // Excerpt: ≤160 characters and required
  if (!data.excerpt) {
    errors.push('Resumo é obrigatório');
  } else if (data.excerpt.length > 160) {
    errors.push('Resumo deve ter no máximo 160 caracteres');
  }

  // Meta title: ≤60 characters and required
  if (!data.meta_title) {
    errors.push('Meta título é obrigatório');
  } else if (data.meta_title.length > 60) {
    errors.push('Meta título deve ter no máximo 60 caracteres');
  }

  // Meta description: ≤160 characters and required
  if (!data.meta_description) {
    errors.push('Meta descrição é obrigatória');
  } else if (data.meta_description.length > 160) {
    errors.push('Meta descrição deve ter no máximo 160 caracteres');
  }

  // Tags: exactly 12
  if (!data.selectedTags || data.selectedTags.length !== 12) {
    errors.push(`Selecione exatamente 12 tags (atual: ${data.selectedTags?.length || 0})`);
  }

  // ALT required
  if (!data.image_alt) {
    errors.push('Texto alternativo (ALT) é obrigatório');
  }

  // Category required
  if (!data.category_id) {
    errors.push('Selecione uma categoria');
  }

  // Hero image required
  if (!data.featured_image_url) {
    errors.push('Adicione uma imagem principal (Hero)');
  }

  return { valid: errors.length === 0, errors };
}
