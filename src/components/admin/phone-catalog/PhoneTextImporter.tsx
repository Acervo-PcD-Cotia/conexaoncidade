import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { usePhoneImport, type PhoneFormData, type OfferFormData, type ParsedPhoneData } from '@/hooks/usePhoneImport';
import { PhonePreviewForm } from './PhonePreviewForm';
import { PhoneOfferForm } from './PhoneOfferForm';
import type { Phone } from '@/hooks/usePhoneChooser';

export function PhoneTextImporter() {
  const [text, setText] = useState('');
  const [step, setStep] = useState<'input' | 'preview' | 'offers'>('input');
  const [parsedData, setParsedData] = useState<ParsedPhoneData | null>(null);
  const [formData, setFormData] = useState<PhoneFormData | null>(null);
  const [offers, setOffers] = useState<OfferFormData[]>([]);
  const [duplicatePhone, setDuplicatePhone] = useState<Phone | null>(null);

  const { 
    isParsing, 
    parseText, 
    parsedToFormData, 
    checkDuplicate, 
    createPhone, 
    createPhoneWithOffers 
  } = usePhoneImport();

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    try {
      const result = await parseText.mutateAsync(text);
      setParsedData(result);
      const form = parsedToFormData(result);
      setFormData(form);
      
      // Check for duplicate
      const duplicate = await checkDuplicate(result.brand, result.name);
      setDuplicatePhone(duplicate);
      
      setStep('preview');
    } catch (error) {
      console.error('Parse error:', error);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      await createPhone.mutateAsync(formData);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleSaveWithOffers = () => {
    setStep('offers');
    // Pre-populate one offer with detected price
    if (parsedData?.price_detected && offers.length === 0) {
      setOffers([{
        store_name: '',
        affiliate_url: '',
        price: parsedData.price_detected,
        original_price: null,
        priority: 1,
        is_active: true,
      }]);
    }
  };

  const handleSaveAll = async () => {
    if (!formData) return;
    
    // Filter valid offers
    const validOffers = offers.filter(o => o.store_name && o.affiliate_url);
    
    try {
      await createPhoneWithOffers.mutateAsync({ phone: formData, offers: validOffers });
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const resetForm = () => {
    setText('');
    setStep('input');
    setParsedData(null);
    setFormData(null);
    setOffers([]);
    setDuplicatePhone(null);
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise Inteligente
            </CardTitle>
            <CardDescription>
              Cole o texto do anúncio, especificações ou qualquer informação sobre o smartphone.
              A IA irá extrair automaticamente os dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Exemplo:

Samsung Galaxy S24 Ultra 256GB
Tela Dynamic AMOLED 2X de 6,8"
Câmera de 200 MP
Bateria de 5000 mAh
12 GB de RAM
Processador Snapdragon 8 Gen 3
Preço: R$ 7.999,00`}
              rows={12}
              className="font-mono text-sm"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {text.length} caracteres
              </p>
              <Button 
                onClick={handleAnalyze} 
                disabled={isParsing || text.trim().length < 20}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    Analisar Texto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && parsedData && formData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revisar Dados</CardTitle>
                <CardDescription>
                  Verifique e ajuste as informações antes de salvar.
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PhonePreviewForm
              parsedData={parsedData}
              formData={formData}
              onFormChange={setFormData}
              onSave={handleSave}
              onSaveWithOffers={handleSaveWithOffers}
              isSaving={createPhone.isPending}
              duplicatePhone={duplicatePhone ? { id: duplicatePhone.id, name: duplicatePhone.name } : null}
            />
          </CardContent>
        </Card>
      )}

      {step === 'offers' && formData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Adicionar Ofertas</CardTitle>
                <CardDescription>
                  Configure os links de afiliado para {formData.name}
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setStep('preview')}>
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <PhoneOfferForm
              offers={offers}
              onChange={setOffers}
              detectedPrice={parsedData?.price_detected}
            />
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveAll}
                disabled={createPhoneWithOffers.isPending}
                className="flex-1"
              >
                {createPhoneWithOffers.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar Smartphone e Ofertas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
