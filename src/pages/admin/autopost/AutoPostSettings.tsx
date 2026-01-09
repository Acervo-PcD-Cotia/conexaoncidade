import { useState } from 'react';
import { Save, RotateCcw, Shield, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostSettings, useUpdateAutoPostSettings } from '@/hooks/useAutoPost';
import { useToast } from '@/hooks/use-toast';

const defaultSettings = {
  // Capture settings
  capture_enabled: true,
  default_frequency_minutes: 60,
  max_concurrent_jobs: 3,
  retry_failed_after_minutes: 30,
  max_retries: 3,
  
  // Duplicate detection
  duplicate_detection_enabled: true,
  duplicate_window_days: 7,
  similarity_threshold: 0.85,
  
  // Rewriting
  rewrite_enabled: true,
  rewrite_model: 'gemini-2.5-flash',
  max_rewrite_length: 2000,
  add_internal_links: true,
  
  // SEO
  generate_seo: true,
  seo_title_max_length: 60,
  seo_description_max_length: 160,
  required_tags_count: 12,
  
  // Publishing
  auto_publish: false,
  require_review: true,
  default_author: '',
  
  // Notifications
  notify_on_error: true,
  notify_on_publish: false,
};

export default function AutoPostSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useAutoPostSettings();
  const updateSettings = useUpdateAutoPostSettings();
  
  const [formData, setFormData] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Merge saved settings with defaults on load
  useState(() => {
    if (settings) {
      const merged = { ...defaultSettings };
      settings.forEach(s => {
        if (s.key in merged) {
          (merged as Record<string, unknown>)[s.key] = s.value;
        }
      });
      setFormData(merged);
    }
  });

  const handleChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save each setting
      for (const [key, value] of Object.entries(formData)) {
        await updateSettings.mutateAsync({ key, value });
      }
      toast({ title: 'Configurações salvas!', description: 'As alterações foram aplicadas.' });
      setHasChanges(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as configurações.' });
    }
  };

  const handleReset = () => {
    setFormData(defaultSettings);
    setHasChanges(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Plugins', href: '/admin' },
        { label: 'Auto Post PRO', href: '/admin/autopost' },
        { label: 'Configurações' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Configure o comportamento global do Auto Post PRO</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capture Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Captura
            </CardTitle>
            <CardDescription>Configure como o sistema captura conteúdo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Captura automática habilitada</Label>
              <Switch 
                checked={formData.capture_enabled}
                onCheckedChange={(v) => handleChange('capture_enabled', v)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Frequência padrão (minutos)</Label>
              <Input 
                type="number"
                value={formData.default_frequency_minutes}
                onChange={(e) => handleChange('default_frequency_minutes', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Jobs simultâneos máximos</Label>
              <Input 
                type="number"
                value={formData.max_concurrent_jobs}
                onChange={(e) => handleChange('max_concurrent_jobs', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Retentar falhas após (minutos)</Label>
              <Input 
                type="number"
                value={formData.retry_failed_after_minutes}
                onChange={(e) => handleChange('retry_failed_after_minutes', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detecção de Duplicados
            </CardTitle>
            <CardDescription>Configure a sensibilidade da detecção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Detecção habilitada</Label>
              <Switch 
                checked={formData.duplicate_detection_enabled}
                onCheckedChange={(v) => handleChange('duplicate_detection_enabled', v)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Janela de verificação (dias)</Label>
              <Input 
                type="number"
                value={formData.duplicate_window_days}
                onChange={(e) => handleChange('duplicate_window_days', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Limiar de similaridade (0.0 - 1.0)</Label>
              <Input 
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={formData.similarity_threshold}
                onChange={(e) => handleChange('similarity_threshold', parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Valores mais altos = menos falsos positivos, mais duplicados passam
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rewriting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Reescrita com IA
            </CardTitle>
            <CardDescription>Configure o processamento de conteúdo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Reescrita habilitada</Label>
              <Switch 
                checked={formData.rewrite_enabled}
                onCheckedChange={(v) => handleChange('rewrite_enabled', v)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Modelo de IA</Label>
              <Select 
                value={formData.rewrite_model}
                onValueChange={(v) => handleChange('rewrite_model', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Rápido)</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Qualidade)</SelectItem>
                  <SelectItem value="gpt-5-mini">GPT-5 Mini (Balanceado)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Adicionar links internos</Label>
              <Switch 
                checked={formData.add_internal_links}
                onCheckedChange={(v) => handleChange('add_internal_links', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              SEO e Validação
            </CardTitle>
            <CardDescription>Configure os requisitos de qualidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Gerar SEO automaticamente</Label>
              <Switch 
                checked={formData.generate_seo}
                onCheckedChange={(v) => handleChange('generate_seo', v)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Tamanho máximo do título SEO</Label>
              <Input 
                type="number"
                value={formData.seo_title_max_length}
                onChange={(e) => handleChange('seo_title_max_length', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tamanho máximo da descrição</Label>
              <Input 
                type="number"
                value={formData.seo_description_max_length}
                onChange={(e) => handleChange('seo_description_max_length', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Número de tags obrigatórias</Label>
              <Input 
                type="number"
                value={formData.required_tags_count}
                onChange={(e) => handleChange('required_tags_count', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Publicação
            </CardTitle>
            <CardDescription>Configure o fluxo de aprovação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div>
                <Label>Publicação automática</Label>
                <p className="text-xs text-muted-foreground">Publica sem revisão manual</p>
              </div>
              <Switch 
                checked={formData.auto_publish}
                onCheckedChange={(v) => handleChange('auto_publish', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Exigir revisão por padrão</Label>
              <Switch 
                checked={formData.require_review}
                onCheckedChange={(v) => handleChange('require_review', v)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Autor padrão</Label>
              <Input 
                value={formData.default_author}
                onChange={(e) => handleChange('default_author', e.target.value)}
                placeholder="Nome do autor padrão"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Configure alertas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar em erros</Label>
                <p className="text-xs text-muted-foreground">Alertas quando fontes falham</p>
              </div>
              <Switch 
                checked={formData.notify_on_error}
                onCheckedChange={(v) => handleChange('notify_on_error', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar em publicações</Label>
                <p className="text-xs text-muted-foreground">Alertas quando conteúdo é publicado</p>
              </div>
              <Switch 
                checked={formData.notify_on_publish}
                onCheckedChange={(v) => handleChange('notify_on_publish', v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}