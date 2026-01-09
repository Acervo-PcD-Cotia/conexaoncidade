import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  Plus, Folder, FolderOpen, Pencil, Trash2, ChevronRight, 
  MapPin, Building2, Landmark, Users, Briefcase, Heart
} from 'lucide-react';
import { 
  useAutoPostGroups, useCreateAutoPostGroup, 
  useUpdateAutoPostGroup, useDeleteAutoPostGroup 
} from '@/hooks/useAutoPost';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  MapPin: <MapPin className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Landmark: <Landmark className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Folder: <Folder className="h-4 w-4" />
};

interface GroupFormData {
  name: string;
  description: string;
  parent_id: string | null;
  icon: string;
}

export default function AutoPostGroups() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    parent_id: null,
    icon: 'Folder'
  });

  const { data: groups, isLoading } = useAutoPostGroups();
  const createGroup = useCreateAutoPostGroup();
  const updateGroup = useUpdateAutoPostGroup();
  const deleteGroup = useDeleteAutoPostGroup();

  const rootGroups = groups?.filter(g => !g.parent_id) || [];
  const getChildren = (parentId: string) => groups?.filter(g => g.parent_id === parentId) || [];

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  const handleOpenDialog = (group?: NonNullable<typeof groups>[0]) => {
    if (group) {
      setEditingId(group.id);
      setFormData({
        name: group.name,
        description: group.description || '',
        parent_id: group.parent_id,
        icon: group.icon || 'Folder'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        parent_id: null,
        icon: 'Folder'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      icon: formData.icon
    };

    if (editingId) {
      updateGroup.mutate({ id: editingId, ...data });
    } else {
      createGroup.mutate(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGroup.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const renderGroup = (group: NonNullable<typeof groups>[0], level: number = 0) => {
    const children = getChildren(group.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedGroups.has(group.id);

    return (
      <div key={group.id}>
        <div 
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer",
            level > 0 && "ml-6"
          )}
          onClick={() => hasChildren && toggleExpand(group.id)}
        >
          {hasChildren ? (
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )} />
          ) : (
            <div className="w-4" />
          )}
          
          <div className="p-2 rounded bg-primary/10 text-primary">
            {iconMap[group.icon || 'Folder'] || <Folder className="h-4 w-4" />}
          </div>
          
          <div className="flex-1">
            <p className="font-medium">{group.name}</p>
            {group.description && (
              <p className="text-xs text-muted-foreground">{group.description}</p>
            )}
          </div>

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleOpenDialog(group)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setDeleteId(group.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {children.map(child => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grupos & Regiões</h1>
          <p className="text-muted-foreground">
            Organize suas fontes em grupos hierárquicos
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {/* Groups Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estrutura de Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : rootGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum grupo cadastrado</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro grupo
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {rootGroups.map(group => renderGroup(group))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? 'Atualize as informações do grupo'
                : 'Crie um novo grupo para organizar suas fontes'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Grupo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: São Paulo"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Grupo Pai</Label>
              <Select 
                value={formData.parent_id || 'none'}
                onValueChange={(v) => setFormData({ ...formData, parent_id: v === 'none' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum (grupo raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (grupo raiz)</SelectItem>
                  {groups?.filter(g => g.id !== editingId).map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select 
                value={formData.icon}
                onValueChange={(v) => setFormData({ ...formData, icon: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(iconMap).map(([key, icon]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {icon}
                        <span>{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || createGroup.isPending || updateGroup.isPending}
            >
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As fontes deste grupo ficarão sem grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
