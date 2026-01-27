// Editor de Publidoor para Partners (campos limitados)
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PartnerStatusBadge } from '@/components/partner/PartnerStatusBadge';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerPublidoor, usePartnerPublidoors, usePartnerUpdatePublidoor } from '@/hooks/usePartnerPublidoor';

const editorSchema = z.object({
  phrase_1: z.string().min(1, 'Frase principal é obrigatória').max(100, 'Máximo 100 caracteres'),
  phrase_2: z.string().max(100, 'Máximo 100 caracteres').optional().nullable(),
  phrase_3: z.string().max(100, 'Máximo 100 caracteres').optional().nullable(),
  cta_text: z.string().min(1, 'Texto do botão é obrigatório').max(30, 'Máximo 30 caracteres'),
  cta_link: z.string().url('Link inválido').or(z.literal('')).optional().nullable(),
});

type EditorFormData = z.infer<typeof editorSchema>;

export default function PartnerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { advertiser } = usePartnerAuth();
  const { data: publidoors = [] } = usePartnerPublidoors(advertiser?.id);
  
  // Use the ID from params or get the first publidoor
  const publidoorId = id || publidoors[0]?.id;
  const { data: publidoor, isLoading } = usePartnerPublidoor(publidoorId);
  const updateMutation = usePartnerUpdatePublidoor();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditorFormData>({
    resolver: zodResolver(editorSchema),
  });

  // Populate form when publidoor loads
  useEffect(() => {
    if (publidoor) {
      reset({
        phrase_1: publidoor.phrase_1,
        phrase_2: publidoor.phrase_2,
        phrase_3: publidoor.phrase_3,
        cta_text: publidoor.cta_text,
        cta_link: publidoor.cta_link,
      });
    }
  }, [publidoor, reset]);

  const watchedFields = watch();

  const onSubmit = async (data: EditorFormData) => {
    if (!publidoorId) return;
    
    await updateMutation.mutateAsync({
      id: publidoorId,
      ...data,
    });
    
    navigate('/partner/publidoor');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!publidoor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-4">Nenhuma vitrine encontrada</h2>
        <p className="text-muted-foreground mb-6">
          Você precisa ter uma vitrine ativa para editar.
        </p>
        <Button onClick={() => navigate('/partner/publidoor')}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Editar Vitrine</h1>
          <p className="text-muted-foreground">
            Atualize o conteúdo da sua presença digital
          </p>
        </div>
        <PartnerStatusBadge status={publidoor.status} />
      </div>

      {/* Warning about review */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Após salvar, sua vitrine será enviada para análise editorial antes de ser publicada.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <motion.form
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phrase_1">Frase Principal *</Label>
              <Textarea
                id="phrase_1"
                placeholder="Ex: Conheça a melhor pizzaria da região"
                className="resize-none"
                rows={2}
                {...register('phrase_1')}
              />
              {errors.phrase_1 && (
                <p className="text-sm text-destructive">{errors.phrase_1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phrase_2">Frase Secundária</Label>
              <Textarea
                id="phrase_2"
                placeholder="Ex: Entrega grátis para toda a cidade"
                className="resize-none"
                rows={2}
                {...register('phrase_2')}
              />
              {errors.phrase_2 && (
                <p className="text-sm text-destructive">{errors.phrase_2.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phrase_3">Frase Final (opcional)</Label>
              <Textarea
                id="phrase_3"
                placeholder="Ex: Peça já pelo WhatsApp!"
                className="resize-none"
                rows={2}
                {...register('phrase_3')}
              />
              {errors.phrase_3 && (
                <p className="text-sm text-destructive">{errors.phrase_3.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Texto do Botão *</Label>
                <Input
                  id="cta_text"
                  placeholder="Ex: Saiba Mais"
                  {...register('cta_text')}
                />
                {errors.cta_text && (
                  <p className="text-sm text-destructive">{errors.cta_text.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta_link">Link de Destino</Label>
                <Input
                  id="cta_link"
                  type="url"
                  placeholder="https://..."
                  {...register('cta_link')}
                />
                {errors.cta_link && (
                  <p className="text-sm text-destructive">{errors.cta_link.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Disabled Fields Info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-medium mb-2 text-sm">Campos definidos pelo administrador:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tipo de Vitrine: <span className="text-foreground">{publidoor.type}</span></li>
              <li>• Template: <span className="text-foreground">{publidoor.template?.name || 'Padrão'}</span></li>
              <li>• Local de exibição: <span className="text-foreground">Definido pela equipe</span></li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enviar para Análise
                </>
              )}
            </Button>
          </div>
        </motion.form>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Preview em tempo real
          </div>
          
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            {/* Preview Content */}
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-background">
              {publidoor.media_url && (
                <img
                  src={publidoor.media_url}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full w-fit mb-3">
                  Conteúdo de Marca
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {watchedFields.phrase_1 || 'Sua frase principal aqui'}
                </h3>
                {watchedFields.phrase_2 && (
                  <p className="text-white/80 mb-2">{watchedFields.phrase_2}</p>
                )}
                {watchedFields.phrase_3 && (
                  <p className="text-white/60 text-sm mb-4">{watchedFields.phrase_3}</p>
                )}
                <Button size="sm" className="w-fit">
                  {watchedFields.cta_text || 'Saiba Mais'}
                </Button>
              </div>
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                {publidoor.logo_url && (
                  <img
                    src={publidoor.logo_url}
                    alt="Logo"
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                )}
                <div>
                  <p className="font-medium text-sm">{advertiser?.company_name}</p>
                  <p className="text-xs text-muted-foreground">{advertiser?.category}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
