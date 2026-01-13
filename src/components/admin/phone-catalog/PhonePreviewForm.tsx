import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Star, Plus, Loader2 } from 'lucide-react';
import type { PhoneFormData, ParsedPhoneData } from '@/hooks/usePhoneImport';

interface PhonePreviewFormProps {
  parsedData: ParsedPhoneData;
  formData: PhoneFormData;
  onFormChange: (data: PhoneFormData) => void;
  onSave: () => void;
  onSaveWithOffers: () => void;
  isSaving: boolean;
  duplicatePhone?: { id: string; name: string } | null;
}

const BRANDS = [
  'Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Realme', 'OnePlus', 
  'Oppo', 'Google', 'Asus', 'TCL', 'Nothing', 'Infinix', 'Tecno'
];

const USE_CASES = [
  { value: 'social', label: 'Redes Sociais' },
  { value: 'photography', label: 'Fotografia' },
  { value: 'games', label: 'Jogos' },
  { value: 'work', label: 'Trabalho' },
  { value: 'streaming', label: 'Streaming' },
];

export function PhonePreviewForm({
  parsedData,
  formData,
  onFormChange,
  onSave,
  onSaveWithOffers,
  isSaving,
  duplicatePhone,
}: PhonePreviewFormProps) {
  const [newStrength, setNewStrength] = useState('');
  const [newConsideration, setNewConsideration] = useState('');

  const handleChange = (field: keyof PhoneFormData, value: any) => {
    onFormChange({ ...formData, [field]: value });
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      handleChange('strengths', [...formData.strengths, newStrength.trim()]);
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    handleChange('strengths', formData.strengths.filter((_, i) => i !== index));
  };

  const addConsideration = () => {
    if (newConsideration.trim()) {
      handleChange('considerations', [...formData.considerations, newConsideration.trim()]);
      setNewConsideration('');
    }
  };

  const removeConsideration = (index: number) => {
    handleChange('considerations', formData.considerations.filter((_, i) => i !== index));
  };

  const toggleUseCase = (useCase: string) => {
    if (formData.use_cases.includes(useCase)) {
      handleChange('use_cases', formData.use_cases.filter(uc => uc !== useCase));
    } else {
      handleChange('use_cases', [...formData.use_cases, useCase]);
    }
  };

  const renderScoreStars = (score: number, field: 'camera_score' | 'battery_score' | 'gaming_score') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleChange(field, star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${star <= score ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Duplicate Warning */}
      {duplicatePhone && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Smartphone similar encontrado: <strong>{duplicatePhone.name}</strong>
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Verifique se não é duplicado antes de salvar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Specs detected (read-only) */}
      {parsedData.specs && Object.values(parsedData.specs).some(v => v) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Especificações Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {parsedData.specs.ram && <Badge variant="outline">RAM: {parsedData.specs.ram}</Badge>}
              {parsedData.specs.storage && <Badge variant="outline">Armazenamento: {parsedData.specs.storage}</Badge>}
              {parsedData.specs.display && <Badge variant="outline">Tela: {parsedData.specs.display}</Badge>}
              {parsedData.specs.battery && <Badge variant="outline">Bateria: {parsedData.specs.battery}</Badge>}
              {parsedData.specs.camera && <Badge variant="outline">Câmera: {parsedData.specs.camera}</Badge>}
              {parsedData.specs.processor && <Badge variant="outline">Processador: {parsedData.specs.processor}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome do Modelo *</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Samsung Galaxy S24 Ultra 256GB"
          />
        </div>

        <div className="space-y-2">
          <Label>Marca *</Label>
          <Select value={formData.brand} onValueChange={(v) => handleChange('brand', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {BRANDS.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Preço Mínimo (R$)</Label>
          <Input
            type="number"
            value={formData.price_min}
            onChange={(e) => handleChange('price_min', Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Preço Máximo (R$)</Label>
          <Input
            type="number"
            value={formData.price_max}
            onChange={(e) => handleChange('price_max', Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Faixa de Preço</Label>
          <Select value={formData.price_range} onValueChange={(v) => handleChange('price_range', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Entrada (&lt;R$1000)</SelectItem>
              <SelectItem value="mid">Intermediário (R$1000-2500)</SelectItem>
              <SelectItem value="premium">Premium (R$2500-5000)</SelectItem>
              <SelectItem value="flagship">Flagship (&gt;R$5000)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scores */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Câmera</Label>
          {renderScoreStars(formData.camera_score, 'camera_score')}
        </div>

        <div className="space-y-2">
          <Label>Bateria</Label>
          {renderScoreStars(formData.battery_score, 'battery_score')}
        </div>

        <div className="space-y-2">
          <Label>Jogos</Label>
          {renderScoreStars(formData.gaming_score, 'gaming_score')}
        </div>
      </div>

      {/* Ideal For */}
      <div className="space-y-2">
        <Label>Ideal Para</Label>
        <Textarea
          value={formData.ideal_for}
          onChange={(e) => handleChange('ideal_for', e.target.value)}
          placeholder="Ex: Quem busca câmera excepcional com ótimo custo-benefício"
          rows={2}
        />
      </div>

      {/* Use Cases */}
      <div className="space-y-2">
        <Label>Casos de Uso</Label>
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map(uc => (
            <Badge
              key={uc.value}
              variant={formData.use_cases.includes(uc.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleUseCase(uc.value)}
            >
              {uc.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <Label>Pontos Fortes</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.strengths.map((strength, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {strength}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeStrength(index)} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newStrength}
            onChange={(e) => setNewStrength(e.target.value)}
            placeholder="Adicionar ponto forte"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
          />
          <Button type="button" variant="outline" size="icon" onClick={addStrength}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Considerations */}
      <div className="space-y-2">
        <Label>Considerações</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.considerations.map((consideration, index) => (
            <Badge key={index} variant="outline" className="gap-1">
              {consideration}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeConsideration(index)} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newConsideration}
            onChange={(e) => setNewConsideration(e.target.value)}
            placeholder="Adicionar consideração"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConsideration())}
          />
          <Button type="button" variant="outline" size="icon" onClick={addConsideration}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label>URL da Imagem (opcional)</Label>
        <Input
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={onSave} 
          disabled={isSaving || !formData.name || !formData.brand}
          className="flex-1"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar Smartphone
        </Button>
        <Button 
          onClick={onSaveWithOffers} 
          variant="secondary"
          disabled={isSaving || !formData.name || !formData.brand}
          className="flex-1"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar e Criar Ofertas
        </Button>
      </div>
    </div>
  );
}
