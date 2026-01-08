import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ManualData {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  imagem: {
    hero: string;
    alt: string;
    credito: string;
  };
  seo: {
    meta_titulo: string;
    meta_descricao: string;
  };
  fonte?: string;
}

interface NoticiasAIManualTabProps {
  data: ManualData | null;
}

interface FieldRowProps {
  label: string;
  value: string;
  maxLength?: number;
  isHtml?: boolean;
}

function FieldRow({ label, value, maxLength, isHtml }: FieldRowProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: 'Copiado!', description: label });
    setTimeout(() => setCopied(false), 2000);
  };

  const length = value?.length || 0;
  const isOverLimit = maxLength && length > maxLength;

  return (
    <div className="group rounded-lg border p-3 transition-colors hover:bg-accent/50">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {maxLength && (
            <Badge variant={isOverLimit ? 'destructive' : 'secondary'} className="text-xs">
              {length}/{maxLength}
            </Badge>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {isHtml ? (
        <div 
          className="prose prose-sm max-h-[200px] max-w-none overflow-auto rounded border bg-muted/50 p-2 text-sm"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{value || '-'}</p>
      )}
    </div>
  );
}

export function NoticiasAIManualTab({ data }: NoticiasAIManualTabProps) {
  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <p className="text-center text-muted-foreground">
            Processe um conteúdo para ver os campos formatados aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-tour="manual-result">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Dados Básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldRow label="Título" value={data.titulo} maxLength={100} />
          <FieldRow label="Slug" value={data.slug} />
          <FieldRow label="Resumo" value={data.resumo} maxLength={160} />
          <FieldRow label="Categoria" value={data.categoria} />
          {data.fonte && <FieldRow label="Fonte" value={data.fonte} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Imagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.imagem.hero && (
            <div className="overflow-hidden rounded-lg border">
              <img src={data.imagem.hero} alt={data.imagem.alt} className="h-48 w-full object-cover" />
            </div>
          )}
          <FieldRow label="URL da Imagem" value={data.imagem.hero} />
          <FieldRow label="Texto Alternativo" value={data.imagem.alt} />
          <FieldRow label="Crédito" value={data.imagem.credito} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldRow label="Conteúdo HTML" value={data.conteudo} isHtml />
        </CardContent>
      </Card>

      {data.tags && data.tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldRow label="Meta Título" value={data.seo.meta_titulo} maxLength={60} />
          <FieldRow label="Meta Descrição" value={data.seo.meta_descricao} maxLength={160} />
        </CardContent>
      </Card>
    </div>
  );
}
