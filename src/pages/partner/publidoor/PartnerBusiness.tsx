// Meu Negócio - Dados do anunciante
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building2, Save, Loader2, MapPin, Phone, Globe, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { useUpdatePartnerAdvertiser } from '@/hooks/usePartnerAdvertiser';

const businessSchema = z.object({
  company_name: z.string().min(1, 'Nome da empresa é obrigatório'),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url('URL inválida').or(z.literal('')).optional().nullable(),
  google_maps_url: z.string().url('URL inválida').or(z.literal('')).optional().nullable(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function PartnerBusiness() {
  const { advertiser } = usePartnerAuth();
  const updateMutation = useUpdatePartnerAdvertiser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
  });

  // Populate form when advertiser loads
  useEffect(() => {
    if (advertiser) {
      reset({
        company_name: advertiser.company_name,
        neighborhood: advertiser.neighborhood,
        city: advertiser.city,
        category: advertiser.category,
        whatsapp: advertiser.whatsapp,
        website: advertiser.website,
        google_maps_url: advertiser.google_maps_url,
      });
    }
  }, [advertiser, reset]);

  const onSubmit = async (data: BusinessFormData) => {
    if (!advertiser?.id) return;
    
    await updateMutation.mutateAsync({
      id: advertiser.id,
      ...data,
    });
  };

  if (!advertiser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Meu Negócio</h1>
            <p className="text-muted-foreground">
              Mantenha seus dados atualizados
            </p>
          </div>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">Nome da Empresa *</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="company_name"
              placeholder="Nome do seu negócio"
              className="pl-10"
              {...register('company_name')}
            />
          </div>
          {errors.company_name && (
            <p className="text-sm text-destructive">{errors.company_name.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="neighborhood"
                placeholder="Ex: Centro"
                className="pl-10"
                {...register('neighborhood')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="Ex: São Paulo"
              {...register('city')}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria / Segmento</Label>
          <Input
            id="category"
            placeholder="Ex: Restaurante, Loja de Roupas, etc."
            {...register('category')}
          />
        </div>

        {/* Contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                className="pl-10"
                {...register('whatsapp')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                className="pl-10"
                {...register('website')}
              />
            </div>
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>
        </div>

        {/* Google Maps */}
        <div className="space-y-2">
          <Label htmlFor="google_maps_url">Link do Google Maps</Label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="google_maps_url"
              type="url"
              placeholder="https://maps.google.com/..."
              className="pl-10"
              {...register('google_maps_url')}
            />
          </div>
          {errors.google_maps_url && (
            <p className="text-sm text-destructive">{errors.google_maps_url.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Cole o link de compartilhamento do Google Maps do seu estabelecimento
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={updateMutation.isPending || !isDirty}
          className="w-full h-12"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </motion.form>

      {/* Info */}
      <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          Estes dados serão utilizados automaticamente nas suas vitrines digitais.
          Mantenha-os sempre atualizados para melhor alcance.
        </p>
      </div>
    </div>
  );
}
