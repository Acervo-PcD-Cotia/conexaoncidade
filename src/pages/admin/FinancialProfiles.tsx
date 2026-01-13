import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

interface FiscalProfile {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  legal_name: string;
  trade_name?: string | null;
  email: string;
  phone?: string | null;
  is_verified: boolean;
  created_at: string;
}

interface FormData {
  document_type: string;
  document_number: string;
  legal_name: string;
  trade_name: string;
  email: string;
  phone: string;
}

const emptyProfile: FormData = {
  document_type: 'cpf',
  document_number: '',
  legal_name: '',
  trade_name: '',
  email: '',
  phone: '',
};

export default function FinancialProfiles() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FiscalProfile | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyProfile);

  const { data: profiles = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['fiscal-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as FiscalProfile[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase.from('fiscal_profiles').insert({
        document_type: data.document_type,
        document_number: data.document_number,
        legal_name: data.legal_name,
        trade_name: data.trade_name || null,
        email: data.email,
        phone: data.phone || null,
        user_id: user.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-profiles'] });
      toast.success('Perfil fiscal criado!');
      setIsOpen(false);
      setFormData(emptyProfile);
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase
        .from('fiscal_profiles')
        .update({
          document_type: data.document_type,
          document_number: data.document_number,
          legal_name: data.legal_name,
          trade_name: data.trade_name || null,
          email: data.email,
          phone: data.phone || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-profiles'] });
      toast.success('Perfil atualizado!');
      setIsOpen(false);
      setEditingProfile(null);
      setFormData(emptyProfile);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fiscal_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-profiles'] });
      toast.success('Perfil removido!');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const handleEdit = (profile: FiscalProfile) => {
    setEditingProfile(profile);
    setFormData({
      document_type: profile.document_type,
      document_number: profile.document_number,
      legal_name: profile.legal_name,
      trade_name: profile.trade_name || '',
      email: profile.email,
      phone: profile.phone || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      updateMutation.mutate({ id: editingProfile.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenNew = () => {
    setEditingProfile(null);
    setFormData(emptyProfile);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perfis Fiscais</h1>
          <p className="text-muted-foreground">
            Gerencie dados fiscais de jornalistas e colaboradores
          </p>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleOpenNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Perfil
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingProfile ? 'Editar Perfil' : 'Novo Perfil Fiscal'}</SheetTitle>
              <SheetDescription>
                Preencha os dados fiscais para emissão de notas e recibos.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(v) => setFormData({ ...formData, document_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número do Documento</Label>
                  <Input
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome/Razão Social</Label>
                <Input
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nome Fantasia (opcional)</Label>
                <Input
                  value={formData.trade_name}
                  onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProfile ? 'Salvar Alterações' : 'Criar Perfil'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <AdminLoadingState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Carregando perfis fiscais..."
      >
        {profiles.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="Nenhum perfil fiscal"
            description="Adicione perfis fiscais para emitir notas e recibos para colaboradores."
            action={{ label: 'Novo Perfil', onClick: handleOpenNew }}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="font-medium">{profile.legal_name}</div>
                      {profile.trade_name && (
                        <div className="text-sm text-muted-foreground">{profile.trade_name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {profile.document_type}
                      </Badge>
                      <span className="ml-2 text-sm">{profile.document_number}</span>
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell className="text-sm">
                      {profile.phone || '-'}
                    </TableCell>
                    <TableCell>
                      {profile.is_verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Remover este perfil fiscal?')) {
                              deleteMutation.mutate(profile.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </AdminLoadingState>
    </div>
  );
}
