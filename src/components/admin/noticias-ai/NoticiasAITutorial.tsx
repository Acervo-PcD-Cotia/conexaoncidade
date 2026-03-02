import { BookOpen, Zap, FileText, Link, Layers, Upload, History, BarChart3, Globe, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface NoticiasAITutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <Lightbulb className="h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function CodeExample({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
      <code>{children}</code>
    </pre>
  );
}

export function NoticiasAITutorial({ open, onOpenChange }: NoticiasAITutorialProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tutorial Completo - Notícias AI
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {/* Section 1: Modos de Entrada */}
              <AccordionItem value="modes">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-500" />
                    1. Modos de Entrada
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>O sistema detecta automaticamente o modo de entrada baseado no conteúdo digitado:</p>
                  
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Badge className="bg-red-500 text-white">EXCLUSIVA</Badge>
                        Preservar Original
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Digite "EXCLUSIVA" no início do texto para preservar o conteúdo exatamente como fornecido. Ideal para comunicados oficiais.
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Badge className="bg-blue-500 text-white">CADASTRO MANUAL</Badge>
                        Campos para Copiar
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Digite "CADASTRO MANUAL" no início para gerar campos formatados com botões de copiar.
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Badge className="bg-emerald-500 text-white">JSON</Badge>
                        Importação Automática
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Digite "JSON" no início para gerar JSON estruturado compatível com a importação em massa.
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Badge variant="outline">LINK</Badge>
                        Extração de URL
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cole uma única URL para extrair automaticamente o conteúdo da página.
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Badge className="bg-purple-500 text-white">LOTE</Badge>
                        Múltiplas URLs
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cole múltiplas URLs (uma por linha) para processamento paralelo. Limite: 10 URLs.
                      </p>
                    </div>
                  </div>

                  <TipBox>
                    <strong>Dica:</strong> Se não usar nenhuma palavra-chave, o sistema tentará detectar automaticamente o melhor modo.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: Upload de Imagem */}
              <AccordionItem value="upload">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    2. Upload de Imagem
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>Você pode enviar imagens para usar nas notícias geradas:</p>
                  
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li><strong>Formatos aceitos:</strong> JPG, JPEG, PNG, WEBP, GIF</li>
                    <li><strong>Tamanho máximo:</strong> 10MB por imagem</li>
                    <li><strong>Armazenamento:</strong> Supabase Storage (bucket público)</li>
                  </ul>

                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <strong>Fluxo:</strong>
                    <ol className="mt-2 list-inside list-decimal space-y-1">
                      <li>Clique em "Enviar Imagem"</li>
                      <li>Selecione o arquivo</li>
                      <li>Aguarde o upload automático</li>
                      <li>A URL será inserida automaticamente no resultado</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 3: Visualização Manual */}
              <AccordionItem value="manual">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    3. Aba Cadastro Manual
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>A aba Manual exibe campos formatados com botões para copiar:</p>
                  
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li><strong>Título:</strong> Máximo 100 caracteres</li>
                    <li><strong>Slug:</strong> Gerado automaticamente em kebab-case</li>
                    <li><strong>Resumo:</strong> Máximo 160 caracteres</li>
                    <li><strong>Meta Título:</strong> Máximo 60 caracteres (SEO)</li>
                    <li><strong>Meta Descrição:</strong> Máximo 160 caracteres (SEO)</li>
                  </ul>

                  <TipBox>
                    Cada campo possui um indicador de caracteres mostrando se está dentro do limite ideal.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* Section 4: JSON e Importação */}
              <AccordionItem value="json">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-orange-500" />
                    4. JSON e Importação
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>A aba JSON permite visualizar e importar artigos diretamente:</p>
                  
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <strong>Auto-correção do Lide</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ative para garantir que o primeiro parágrafo esteja em negrito (padrão Agência Brasil).
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <strong>Visualizar</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Abre um preview do artigo como será exibido no site.
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <strong>Importar Notícias</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Importa diretamente para o banco de dados com status "published".
                      </p>
                    </div>
                  </div>

                  <CodeExample>{`{
  "noticias": [{
    "titulo": "...",
    "slug": "...",
    "resumo": "...",
    "conteudo": "<p><strong>Lide</strong></p>...",
    "categoria": "...",
    "tags": ["max 12 tags"],
    "imagem": {
      "hero": "url",
      "alt": "",
      "credito": "",
      "galeria": ["url2.jpg", "url3.jpg"]
    },
    "seo": { "meta_titulo": "", "meta_descricao": "" },
    "fonte": "https://...",
    "links": [
      { "label": "Inscrições", "url": "https://..." },
      { "label": "Site Oficial", "url": "https://..." }
    ]
  }]
}`}</CodeExample>

                  <TipBox>
                    <strong>Galeria de imagens:</strong> Use o campo <code>imagem.galeria</code> para adicionar imagens extras (array de URLs). A primeira imagem (<code>hero</code>) será a principal.
                  </TipBox>
                  <TipBox>
                    <strong>Links relacionados:</strong> Use o campo <code>links</code> para adicionar links de inscrições, formulários, sites oficiais etc. Cada link tem <code>label</code> (rótulo) e <code>url</code>.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* Section 5: Histórico */}
              <AccordionItem value="history">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-500" />
                    5. Histórico de Importações
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>A aba Histórico registra todas as importações realizadas:</p>
                  
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li>Data e hora da importação</li>
                    <li>Título do artigo</li>
                    <li>Fonte com badge colorida</li>
                    <li>Tipo: Individual, Lote ou JSON</li>
                    <li>Status: Sucesso ou Erro</li>
                    <li>Indicador de auto-correção</li>
                  </ul>

                  <TipBox>
                    Clique no ícone de edição para ir diretamente para o editor do artigo importado.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* Section 6: Estatísticas */}
              <AccordionItem value="stats">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                    6. Dashboard de Estatísticas
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>A aba Estatísticas oferece métricas e gráficos:</p>
                  
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="rounded-lg border p-2 text-sm">
                      <strong>Total Importado</strong>
                      <p className="text-muted-foreground">Número de artigos no período</p>
                    </div>
                    <div className="rounded-lg border p-2 text-sm">
                      <strong>Taxa de Sucesso</strong>
                      <p className="text-muted-foreground">Percentual de importações bem-sucedidas</p>
                    </div>
                    <div className="rounded-lg border p-2 text-sm">
                      <strong>Auto-Corrigidos</strong>
                      <p className="text-muted-foreground">Artigos com lide corrigido</p>
                    </div>
                    <div className="rounded-lg border p-2 text-sm">
                      <strong>Média Diária</strong>
                      <p className="text-muted-foreground">Importações por dia</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Use o seletor de período para ver dados de Hoje, Última Semana ou Último Mês.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 7: Fontes */}
              <AccordionItem value="sources">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    7. Gerenciador de Fontes
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>Configure fontes personalizadas com instruções específicas de parsing:</p>
                  
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li><strong>Nome:</strong> Identificador da fonte</li>
                    <li><strong>Badge:</strong> Sigla de até 4 caracteres</li>
                    <li><strong>Domínio:</strong> Padrão para identificar URLs</li>
                    <li><strong>Cor:</strong> Cor do badge</li>
                    <li><strong>Instruções:</strong> Diretrizes para a IA</li>
                  </ul>

                  <WarningBox>
                    Fontes do sistema (marcadas como "Sistema") não podem ser editadas ou excluídas.
                  </WarningBox>
                </AccordionContent>
              </AccordionItem>

              {/* Section 8: Agendamentos */}
              <AccordionItem value="schedules">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-rose-500" />
                    8. Agendamentos Automáticos
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p>Configure importações automáticas periódicas:</p>
                  
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li><strong>Intervalos:</strong> 15min, 30min, 1h, 2h, 6h, 12h, 24h</li>
                    <li><strong>Máx. Artigos:</strong> Limite por execução (1-20)</li>
                    <li><strong>Auto-publicar:</strong> Publicar automaticamente</li>
                    <li><strong>Logs:</strong> Histórico de execuções</li>
                  </ul>

                  <TipBox>
                    Vincule uma fonte ao agendamento para aplicar instruções de parsing específicas.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
