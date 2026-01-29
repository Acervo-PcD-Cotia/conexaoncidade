import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TestTube, Loader2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SelectorEditorProps {
  selectors: Record<string, string>;
  onChange: (selectors: Record<string, string>) => void;
  onTest: () => Promise<{ success: boolean; matches: Record<string, number> }>;
  isLoading?: boolean;
}

const SELECTOR_FIELDS = [
  {
    key: 'item_container',
    label: 'Container do Item',
    placeholder: 'article, .news-item, .post',
    help: 'Elemento HTML que envolve cada notícia na lista',
    examples: ['article', '.news-item', '.post', 'div.noticia'],
  },
  {
    key: 'item_link',
    label: 'Link da Notícia',
    placeholder: 'a[href*="noticia"]',
    help: 'Link <a> que aponta para a página completa',
    examples: ['a', 'a[href*="noticia"]', 'a.read-more', 'h2 a'],
  },
  {
    key: 'item_title',
    label: 'Título',
    placeholder: 'h2, h3, .title',
    help: 'Elemento com o título da notícia',
    examples: ['h2', 'h3', '.title', '.headline'],
  },
  {
    key: 'item_date',
    label: 'Data (opcional)',
    placeholder: 'time, .date',
    help: 'Elemento com a data de publicação',
    examples: ['time', '.date', '.published', 'span.data'],
  },
  {
    key: 'item_image',
    label: 'Imagem (opcional)',
    placeholder: 'img.thumbnail',
    help: 'Elemento <img> da notícia',
    examples: ['img', 'img.thumbnail', '.featured-image img'],
  },
  {
    key: 'item_excerpt',
    label: 'Resumo (opcional)',
    placeholder: '.excerpt, .summary',
    help: 'Elemento com o resumo/descrição',
    examples: ['.excerpt', '.summary', 'p.lead'],
  },
];

export function SelectorEditor({ selectors, onChange, onTest, isLoading }: SelectorEditorProps) {
  const [testResult, setTestResult] = useState<{ success: boolean; matches: Record<string, number> } | null>(null);

  const handleTest = async () => {
    try {
      const result = await onTest();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, matches: {} });
    }
  };

  const updateSelector = (key: string, value: string) => {
    onChange({ ...selectors, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Editor de Seletores CSS</CardTitle>
            <CardDescription>
              Configure os seletores para extrair conteúdo de páginas HTML
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Testar Seletores
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SELECTOR_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{field.label}</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{field.help}</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Exemplos:</p>
                      <ul className="text-xs text-muted-foreground">
                        {field.examples.map((ex, i) => (
                          <li key={i}><code>{ex}</code></li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                value={selectors[field.key] || ''}
                onChange={(e) => updateSelector(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="font-mono text-sm"
              />
              {testResult?.matches[field.key] !== undefined && (
                <p className={`text-xs ${testResult.matches[field.key] > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {testResult.matches[field.key]} match{testResult.matches[field.key] !== 1 ? 'es' : ''}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Test Results Summary */}
        {testResult && (
          <div className={`mt-6 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {testResult.success ? 'Seletores funcionando!' : 'Verifique os seletores'}
              </span>
            </div>
            {Object.keys(testResult.matches).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(testResult.matches).map(([key, count]) => (
                  <Badge 
                    key={key} 
                    variant={count > 0 ? 'default' : 'outline'}
                    className={count > 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                  >
                    {key}: {count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Dicas para Seletores CSS</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use <code>F12</code> no navegador para inspecionar elementos</li>
            <li>• Prefira classes específicas ao invés de tags genéricas</li>
            <li>• Use <code>[href*="texto"]</code> para filtrar links por URL</li>
            <li>• Combine seletores com vírgula: <code>h2, h3</code></li>
            <li>• Use descendentes: <code>.container a</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
