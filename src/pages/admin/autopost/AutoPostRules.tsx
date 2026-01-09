import { useState } from 'react';
import { Plus, Edit, Trash2, GripVertical, Zap, Filter, Tag, User, FolderOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostRules, useCreateAutoPostRule, useUpdateAutoPostRule, useDeleteAutoPostRule } from '@/hooks/useAutoPost';
import { useCategories } from '@/hooks/useCategories';
import { Database } from '@/integrations/supabase/types';

type Rule = Database['public']['Tables']['autopost_rules']['Row'];

const defaultRule = {
  name: '',
  description: '',
  enabled: true,
  priority: 10,
  match_keywords: [] as string[],
  match_exclude_keywords: [] as string[],
  match_source_ids: [] as string[],
  match_group_ids: [] as string[],
  match_category_hint: '',
  match_regex: '',
  action_rewrite_enabled: true,
  action_generate_seo: true,
  action_internal_links: true,
  action_require_review: false,
  action_block_publish: false,
  action_set_category_id: '',
  action_set_author: '',
  action_add_tags: [] as string[],
};

export default function AutoPostRules() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState(defaultRule);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [excludeKeywordsInput, setExcludeKeywordsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const { data: rules, isLoading } = useAutoPostRules();
  const { data: categories } = useCategories();
  const createRule = useCreateAutoPostRule();
  const updateRule = useUpdateAutoPostRule();
  const deleteRule = useDeleteAutoPostRule();

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      enabled: rule.enabled ?? true,
      priority: rule.priority ?? 10,
      match_keywords: rule.match_keywords || [],
      match_exclude_keywords: rule.match_exclude_keywords || [],
      match_source_ids: rule.match_source_ids || [],
      match_group_ids: rule.match_group_ids || [],
      match_category_hint: rule.match_category_hint || '',
      match_regex: rule.match_regex || '',
      action_rewrite_enabled: rule.action_rewrite_enabled ?? true,
      action_generate_seo: rule.action_generate_seo ?? true,
      action_internal_links: rule.action_internal_links ?? true,
      action_require_review: rule.action_require_review ?? false,
      action_block_publish: rule.action_block_publish ?? false,
      action_set_category_id: rule.action_set_category_id || '',
      action_set_author: rule.action_set_author || '',
      action_add_tags: rule.action_add_tags || [],
    });
    setKeywordsInput((rule.match_keywords || []).join(', '));
    setExcludeKeywordsInput((rule.match_exclude_keywords || []).join(', '));
    setTagsInput((rule.action_add_tags || []).join(', '));
    setIsOpen(true);
  };

  const handleSubmit = () => {
    const ruleData = {
      ...formData,
      match_keywords: keywordsInput.split(',').map(k => k.trim()).filter(Boolean),
      match_exclude_keywords: excludeKeywordsInput.split(',').map(k => k.trim()).filter(Boolean),
      action_add_tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      action_set_category_id: formData.action_set_category_id || null,
      tenant_id: null,
    };

    if (editingRule) {
      updateRule.mutate({ id: editingRule.id, ...ruleData });
    } else {
      createRule.mutate(ruleData);
    }
    
    setIsOpen(false);
    setEditingRule(null);
    setFormData(defaultRule);
    setKeywordsInput('');
    setExcludeKeywordsInput('');
    setTagsInput('');
  };

  const handleToggleEnabled = (rule: Rule) => {
    updateRule.mutate({ id: rule.id, enabled: !rule.enabled });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Plugins', href: '/admin' },
        { label: 'Auto Post PRO', href: '/admin/autopost' },
        { label: 'Regras' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regras de Automação</h1>
          <p className="text-muted-foreground">Configure regras SE/ENTÃO para processar conteúdo automaticamente</p>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => { setEditingRule(null); setFormData(defaultRule); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingRule ? 'Editar Regra' : 'Nova Regra'}</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label>Nome da Regra</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Notícias de Tecnologia"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o objetivo desta regra..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Prioridade (menor = executa primeiro)</Label>
                  <Input 
                    type="number"
                    className="w-20"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              {/* Match Conditions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Condições (SE)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Palavras-chave (separadas por vírgula)</Label>
                    <Input 
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="tecnologia, inovação, startup"
                    />
                  </div>
                  <div>
                    <Label>Excluir palavras-chave</Label>
                    <Input 
                      value={excludeKeywordsInput}
                      onChange={(e) => setExcludeKeywordsInput(e.target.value)}
                      placeholder="patrocinado, publi"
                    />
                  </div>
                  <div>
                    <Label>Regex (avançado)</Label>
                    <Input 
                      value={formData.match_regex}
                      onChange={(e) => setFormData({ ...formData, match_regex: e.target.value })}
                      placeholder="^[A-Z].*tecnologia.*"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Ações (ENTÃO)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Reescrever com IA</Label>
                      <Switch 
                        checked={formData.action_rewrite_enabled}
                        onCheckedChange={(v) => setFormData({ ...formData, action_rewrite_enabled: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Gerar SEO</Label>
                      <Switch 
                        checked={formData.action_generate_seo}
                        onCheckedChange={(v) => setFormData({ ...formData, action_generate_seo: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Links internos</Label>
                      <Switch 
                        checked={formData.action_internal_links}
                        onCheckedChange={(v) => setFormData({ ...formData, action_internal_links: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Exigir revisão</Label>
                      <Switch 
                        checked={formData.action_require_review}
                        onCheckedChange={(v) => setFormData({ ...formData, action_require_review: v })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <Label className="text-destructive">Bloquear publicação</Label>
                    </div>
                    <Switch 
                      checked={formData.action_block_publish}
                      onCheckedChange={(v) => setFormData({ ...formData, action_block_publish: v })}
                    />
                  </div>

                  <div>
                    <Label>Definir categoria</Label>
                    <Select 
                      value={formData.action_set_category_id}
                      onValueChange={(v) => setFormData({ ...formData, action_set_category_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Definir autor</Label>
                    <Input 
                      value={formData.action_set_author}
                      onChange={(e) => setFormData({ ...formData, action_set_author: e.target.value })}
                      placeholder="Nome do autor"
                    />
                  </div>

                  <div>
                    <Label>Adicionar tags (separadas por vírgula)</Label>
                    <Input 
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="tech, startup, inovação"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSubmit} className="w-full">
                {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando regras...</div>
      ) : rules?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma regra configurada</h3>
            <p className="text-muted-foreground mb-4">Crie regras para automatizar o processamento de conteúdo</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Regra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules?.sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10)).map((rule) => (
            <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        Prioridade {rule.priority}
                      </Badge>
                      {!rule.enabled && <Badge variant="secondary">Desabilitada</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {rule.description || 'Sem descrição'}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {rule.match_keywords?.length ? (
                        <span className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          {rule.match_keywords.length} palavras-chave
                        </span>
                      ) : null}
                      {rule.action_set_category_id && (
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          Categoria definida
                        </span>
                      )}
                      {rule.action_add_tags?.length ? (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {rule.action_add_tags.length} tags
                        </span>
                      ) : null}
                      {rule.action_set_author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {rule.action_set_author}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={rule.enabled ?? true}
                      onCheckedChange={() => handleToggleEnabled(rule)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A regra "{rule.name}" será removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteRule.mutate(rule.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}