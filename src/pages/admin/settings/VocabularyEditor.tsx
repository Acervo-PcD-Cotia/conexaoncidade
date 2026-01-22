import { useState, useEffect } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useUpdateVocabulary, useSiteTemplateConfig } from "@/hooks/useSiteTemplateConfig";
import { usePortalTemplate } from "@/hooks/usePortalTemplates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_VOCABULARY, type VocabularyKey, type VocabularyMap } from "@/types/portal-templates";

export default function VocabularyEditor() {
  const { vocabulary, isLoading } = useVocabulary();
  const { data: siteConfig } = useSiteTemplateConfig();
  const { data: template } = usePortalTemplate(siteConfig?.template_id);
  const updateVocabulary = useUpdateVocabulary();
  
  const [edits, setEdits] = useState<VocabularyMap>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize edits from current overrides
  useEffect(() => {
    if (siteConfig?.vocabulary_overrides) {
      setEdits(siteConfig.vocabulary_overrides as VocabularyMap);
    }
  }, [siteConfig]);

  const handleChange = (key: VocabularyKey, value: string) => {
    const templateValue = (template?.vocabulary as VocabularyMap)?.[key];
    const defaultValue = DEFAULT_VOCABULARY[key];
    
    // If the new value matches the template or default, remove the override
    if (value === templateValue || value === defaultValue) {
      const newEdits = { ...edits };
      delete newEdits[key];
      setEdits(newEdits);
    } else {
      setEdits({ ...edits, [key]: value });
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateVocabulary.mutateAsync(edits);
      toast.success("Vocabulário atualizado!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Erro ao salvar vocabulário");
    }
  };

  const handleReset = () => {
    setEdits({});
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const vocabularyEntries = Object.entries(DEFAULT_VOCABULARY) as [VocabularyKey, string][];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vocabulário do Portal</h1>
          <p className="text-muted-foreground">
            Personalize os termos exibidos no seu portal. Alterações são refletidas em todo o site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={Object.keys(edits).length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateVocabulary.isPending}>
            {updateVocabulary.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {template && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Modelo Atual: {template.name}</CardTitle>
            <CardDescription>
              O vocabulário base é definido pelo modelo. Você pode sobrescrever qualquer termo.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Chave</TableHead>
                <TableHead className="w-[200px]">Padrão</TableHead>
                <TableHead>Seu Termo</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabularyEntries.map(([key, defaultValue]) => {
                const templateValue = (template?.vocabulary as VocabularyMap)?.[key];
                const currentValue = edits[key] ?? templateValue ?? defaultValue;
                const isOverridden = key in edits;
                const baseValue = templateValue ?? defaultValue;

                return (
                  <TableRow key={key}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {key}
                    </TableCell>
                    <TableCell className="text-sm">
                      {baseValue}
                      {templateValue && templateValue !== defaultValue && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          modelo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={currentValue}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={baseValue}
                        className="max-w-xs"
                      />
                    </TableCell>
                    <TableCell>
                      {isOverridden ? (
                        <Badge variant="default">Personalizado</Badge>
                      ) : (
                        <Badge variant="outline">Padrão</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
