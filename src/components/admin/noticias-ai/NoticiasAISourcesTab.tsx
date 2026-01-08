import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Source {
  id: string;
  name: string;
  domain_pattern: string;
  badge: string;
  badge_color: string;
  parsing_instructions: string | null;
  is_active: boolean;
  is_system: boolean;
}

interface SourceFormData {
  name: string;
  domain_pattern: string;
  badge: string;
  badge_color: string;
  parsing_instructions: string;
}

const emptyForm: SourceFormData = {
  name: '',
  domain_pattern: '',
  badge: '',
  badge_color: '#6B7280',
  parsing_instructions: '',
};

export function NoticiasAISourcesTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SourceFormData>(emptyForm);
  const { toast } = useToast();

  const fetchSources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('noticias_ai_sources')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleToggle = async (source: Source) => {
    try {
      const { error } = await supabase
        .from('noticias_ai_sources')
        .update({ is_active: !source.is_active })
        .eq('id', source.id);

      if (error) throw error;

      setSources(prev => prev.map(s => 
        s.id === source.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (error) {
      console.error('Error toggling source:', error);
      toast({ title: 'Erro ao atualizar fonte', variant: 'destructive' });
    }
  };

  const handleEdit = (source: Source) => {
    setEditingId(source.id);
    setFormData({
      name: source.name,
      domain_pattern: source.domain_pattern,
      badge: source.badge,
      badge_color: source.badge_color,
      parsing_instructions: source.parsing_instructions || '',
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.domain_pattern || !formData.badge) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('noticias_ai_sources')
          .update({
            name: formData.name,
            domain_pattern: formData.domain_pattern,
            badge: formData.badge.toUpperCase().slice(0, 4),
            badge_color: formData.badge_color,
            parsing_instructions: formData.parsing_instructions || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Fonte atualizada!' });
      } else {
        const { error } = await supabase
          .from('noticias_ai_sources')
          .insert({
            name: formData.name,
            domain_pattern: formData.domain_pattern,
            badge: formData.badge.toUpperCase().slice(0, 4),
            badge_color: formData.badge_color,
            parsing_instructions: formData.parsing_instructions || null,
            is_system: false,
          });

        if (error) throw error;
        toast({ title: 'Fonte criada!' });
      }

      setDialogOpen(false);
      fetchSources();
    } catch (error) {
      console.error('Error saving source:', error);
      toast({ title: 'Erro ao salvar fonte', variant: 'destructive' });
    }
  };

  const handleDelete = async (source: Source) => {
    if (source.is_system) {
      toast({ title: 'Fontes do sistema não podem ser excluídas', variant: 'destructive' });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta fonte?')) return;

    try {
      const { error } = await supabase
        .from('noticias_ai_sources')
        .delete()
        .eq('id', source.id);

      if (error) throw error;
      toast({ title: 'Fonte excluída!' });
      fetchSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      toast({ title: 'Erro ao excluir fonte', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4" data-tour="sources-tab">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Gerenciador de Fontes</CardTitle>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Nova Fonte
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <Badge style={{ backgroundColor: source.badge_color }} className="text-white">
                      {source.badge}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {source.domain_pattern}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={source.is_system ? 'secondary' : 'outline'}>
                      {source.is_system ? 'Sistema' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={() => handleToggle(source)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(source)}
                        disabled={source.is_system}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(source)}
                        disabled={source.is_system}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Fonte' : 'Nova Fonte'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Fonte *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Agência Brasil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Badge (max 4 chars) *</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value.toUpperCase().slice(0, 4) }))}
                  placeholder="Ex: AB"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain">Padrão de Domínio *</Label>
                <Input
                  id="domain"
                  value={formData.domain_pattern}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain_pattern: e.target.value }))}
                  placeholder="Ex: agenciabrasil.ebc.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor do Badge</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="color"
                    value={formData.badge_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_color: e.target.value }))}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <div className="flex flex-1 items-center justify-center rounded border">
                    <Badge style={{ backgroundColor: formData.badge_color }} className="text-white">
                      {formData.badge || 'BADGE'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções de Parsing (opcional)</Label>
              <Textarea
                id="instructions"
                value={formData.parsing_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, parsing_instructions: e.target.value }))}
                placeholder="Instruções especiais para a IA ao processar conteúdo desta fonte..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
