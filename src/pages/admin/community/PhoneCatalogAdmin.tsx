import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Star, Search, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePhoneChooser, type Phone } from '@/hooks/usePhoneChooser';
import { useRequireRole } from '@/hooks/useRequireRole';
import { PhoneOffersManager } from '@/components/admin/phone-catalog/PhoneOffersManager';

type PhoneFormData = Omit<Phone, 'id' | 'created_at' | 'updated_at'>;

const INITIAL_FORM: PhoneFormData = {
  name: '',
  brand: 'Samsung',
  price_min: 1000,
  price_max: 2000,
  price_range: 'mid',
  image_url: null,
  ideal_for: '',
  strengths: [],
  considerations: [],
  use_cases: [],
  gaming_score: 3,
  camera_score: 3,
  battery_score: 3,
  is_active: true,
};

export default function PhoneCatalogAdmin() {
  useRequireRole(['admin', 'super_admin']);

  const { allPhones, isLoadingAllPhones, createPhone, updatePhone, togglePhoneActive, deletePhone } = usePhoneChooser();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [formData, setFormData] = useState<PhoneFormData>(INITIAL_FORM);
  const [strengthsInput, setStrengthsInput] = useState('');
  const [considerationsInput, setConsiderationsInput] = useState('');
  const [useCasesInput, setUseCasesInput] = useState('');
  const [managingOffersPhone, setManagingOffersPhone] = useState<Phone | null>(null);

  const filteredPhones = allPhones.filter(
    (phone) =>
      phone.name.toLowerCase().includes(search.toLowerCase()) ||
      phone.brand.toLowerCase().includes(search.toLowerCase())
  );

  const openNewForm = () => {
    setEditingPhone(null);
    setFormData(INITIAL_FORM);
    setStrengthsInput('');
    setConsiderationsInput('');
    setUseCasesInput('');
    setShowForm(true);
  };

  const openEditForm = (phone: Phone) => {
    setEditingPhone(phone);
    setFormData({
      name: phone.name,
      brand: phone.brand,
      price_min: phone.price_min,
      price_max: phone.price_max,
      price_range: phone.price_range,
      image_url: phone.image_url,
      ideal_for: phone.ideal_for,
      strengths: phone.strengths,
      considerations: phone.considerations,
      use_cases: phone.use_cases,
      gaming_score: phone.gaming_score,
      camera_score: phone.camera_score,
      battery_score: phone.battery_score,
      is_active: phone.is_active,
    });
    setStrengthsInput(phone.strengths.join('\n'));
    setConsiderationsInput(phone.considerations.join('\n'));
    setUseCasesInput(phone.use_cases.join(', '));
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const finalData: Omit<Phone, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      strengths: strengthsInput.split('\n').filter(Boolean).map((s) => s.trim()),
      considerations: considerationsInput.split('\n').filter(Boolean).map((s) => s.trim()),
      use_cases: useCasesInput.split(',').filter(Boolean).map((s) => s.trim()),
    };

    if (editingPhone) {
      await updatePhone.mutateAsync({ id: editingPhone.id, ...finalData });
    } else {
      await createPhone.mutateAsync(finalData);
    }

    setShowForm(false);
  };

  const handleDelete = async (phone: Phone) => {
    if (confirm(`Tem certeza que deseja remover "${phone.name}"?`)) {
      await deletePhone.mutateAsync(phone.id);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const renderScore = (score: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3 h-3 ${i <= score ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/community">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Celulares</h1>
          <p className="text-muted-foreground">Gerencie os celulares disponíveis para recomendação</p>
        </div>
        <Button onClick={openNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Celular
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">{filteredPhones.length} celulares</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAllPhones ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Câmera</TableHead>
                    <TableHead>Bateria</TableHead>
                    <TableHead>Jogos</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPhones.map((phone) => (
                    <TableRow key={phone.id}>
                      <TableCell className="font-medium">{phone.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{phone.brand}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatPrice(phone.price_min)} - {formatPrice(phone.price_max)}
                      </TableCell>
                      <TableCell>{renderScore(phone.camera_score)}</TableCell>
                      <TableCell>{renderScore(phone.battery_score)}</TableCell>
                      <TableCell>{renderScore(phone.gaming_score)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={phone.is_active}
                          onCheckedChange={(checked) =>
                            togglePhoneActive.mutate({ id: phone.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Gerenciar Ofertas"
                            onClick={() => setManagingOffersPhone(phone)}
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(phone)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(phone)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPhone ? 'Editar Celular' : 'Novo Celular'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Modelo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Samsung Galaxy A54"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Samsung">Samsung</SelectItem>
                    <SelectItem value="Apple">Apple</SelectItem>
                    <SelectItem value="Motorola">Motorola</SelectItem>
                    <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_min">Preço Mínimo (R$)</Label>
                <Input
                  id="price_min"
                  type="number"
                  value={formData.price_min}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price_min: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_max">Preço Máximo (R$)</Label>
                <Input
                  id="price_max"
                  type="number"
                  value={formData.price_max}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price_max: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_range">Faixa de Preço</Label>
                <Select
                  value={formData.price_range}
                  onValueChange={(value: 'budget' | 'mid' | 'premium' | 'flagship') =>
                    setFormData((prev) => ({ ...prev, price_range: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Econômico</SelectItem>
                    <SelectItem value="mid">Intermediário</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="flagship">Topo de Linha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ideal_for">Ideal Para</Label>
              <Input
                id="ideal_for"
                value={formData.ideal_for}
                onChange={(e) => setFormData((prev) => ({ ...prev, ideal_for: e.target.value }))}
                placeholder="Quem busca bom custo-benefício para uso diário"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Câmera (1-5)</Label>
                <Select
                  value={String(formData.camera_score)}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, camera_score: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bateria (1-5)</Label>
                <Select
                  value={String(formData.battery_score)}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, battery_score: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jogos (1-5)</Label>
                <Select
                  value={String(formData.gaming_score)}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gaming_score: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths">Pontos Fortes (um por linha)</Label>
              <Textarea
                id="strengths"
                value={strengthsInput}
                onChange={(e) => setStrengthsInput(e.target.value)}
                placeholder="Bateria que dura o dia todo&#10;Câmera muito boa&#10;Resistente à água"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="considerations">Pontos de Atenção (um por linha)</Label>
              <Textarea
                id="considerations"
                value={considerationsInput}
                onChange={(e) => setConsiderationsInput(e.target.value)}
                placeholder="Jogos pesados podem travar&#10;Carregador não vem na caixa"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="use_cases">Casos de Uso (separados por vírgula)</Label>
              <Input
                id="use_cases"
                value={useCasesInput}
                onChange={(e) => setUseCasesInput(e.target.value)}
                placeholder="social, photography, games, work, streaming"
              />
              <p className="text-xs text-muted-foreground">
                Opções: social, photography, games, work, streaming, messaging, productivity, video, basic
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.ideal_for || createPhone.isPending || updatePhone.isPending}
            >
              {editingPhone ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offers Manager Dialog */}
      <Dialog open={!!managingOffersPhone} onOpenChange={(open) => !open && setManagingOffersPhone(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ofertas - {managingOffersPhone?.name}</DialogTitle>
          </DialogHeader>
          {managingOffersPhone && (
            <PhoneOffersManager phoneId={managingOffersPhone.id} phoneName={managingOffersPhone.name} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
