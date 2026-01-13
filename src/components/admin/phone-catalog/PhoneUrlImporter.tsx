import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link2, ArrowRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { usePhoneImport, type PhoneFormData, type OfferFormData, type ParsedPhoneData } from '@/hooks/usePhoneImport';
import { PhonePreviewForm } from './PhonePreviewForm';
import { PhoneOfferForm } from './PhoneOfferForm';
import type { Phone } from '@/hooks/usePhoneChooser';

const SUPPORTED_STORES = [
  { name: 'Amazon', domain: 'amazon.com.br' },
  { name: 'Magazine Luiza', domain: 'magazineluiza.com.br' },
  { name: 'Mercado Livre', domain: 'mercadolivre.com.br' },
  { name: 'Americanas', domain: 'americanas.com.br' },
  { name: 'Shopee', domain: 'shopee.com.br' },
];

export function PhoneUrlImporter() {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<'input' | 'preview' | 'offers'>('input');
  const [parsedData, setParsedData] = useState<ParsedPhoneData | null>(null);
  const [formData, setFormData] = useState<PhoneFormData | null>(null);
  const [offers, setOffers] = useState<OfferFormData[]>([]);
  const [duplicatePhone, setDuplicatePhone] = useState<Phone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedStore, setDetectedStore] = useState<string | null>(null);

  const { 
    isParsing, 
    parseUrl, 
    parsedToFormData, 
    checkDuplicate, 
    createPhone, 
    createPhoneWithOffers 
  } = usePhoneImport();

  const detectStore = (inputUrl: string): string | null => {
    try {
      const urlObj = new URL(inputUrl);
      const store = SUPPORTED_STORES.find(s => urlObj.hostname.includes(s.domain));
      return store?.name || null;
    } catch {
      return null;
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setError(null);
    const store = detectStore(newUrl);
    setDetectedStore(store);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setError(null);

    try {
      const result = await parseUrl.mutateAsync(url);
      setParsedData(result);
      const form = parsedToFormData(result);
      setFormData(form);
      
      // Check for duplicate
      const duplicate = await checkDuplicate(result.brand, result.name);
      setDuplicatePhone(duplicate);
      
      // Pre-populate offer with URL
      setOffers([{
        store_name: detectedStore || '',
        affiliate_url: url,
        price: result.price_detected,
        original_price: null,
        priority: 1,
        is_active: true,
      }]);
      
      setStep('preview');
    } catch (err) {
      setError((err as Error).message || 'Erro ao analisar URL');
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
  };

  const handleSaveAll = async () => {
    if (!formData) return;
    
    const validOffers = offers.filter(o => o.store_name && o.affiliate_url);
    
    try {
      await createPhoneWithOffers.mutateAsync({ phone: formData, offers: validOffers });
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const resetForm = () => {
    setUrl('');
    setStep('input');
    setParsedData(null);
    setFormData(null);
    setOffers([]);
    setDuplicatePhone(null);
    setError(null);
    setDetectedStore(null);
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Importar por URL
              </CardTitle>
              <CardDescription>
                Cole a URL de um produto de smartphone. O sistema tentará extrair as informações automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://www.amazon.com.br/dp/..."
                    className="flex-1"
                  />
                  {url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {detectedStore && (
                  <p className="text-sm text-muted-foreground">
                    ✓ Loja detectada: <strong>{detectedStore}</strong>
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isParsing || !url.trim()}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      Analisar URL
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lojas Suportadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_STORES.map(store => (
                  <span 
                    key={store.domain}
                    className="text-xs bg-muted px-2 py-1 rounded"
                  >
                    {store.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Se a URL não funcionar, copie as especificações do produto e use a aba "Importar por Texto".
              </p>
            </CardContent>
          </Card>
        </>
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
