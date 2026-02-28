import { BusinessFormData, DAYS_OF_WEEK, AMENITIES_LIST } from '@/constants/businessForm';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Edit } from 'lucide-react';

interface Props {
  data: BusinessFormData;
  onGoToStep: (s: number) => void;
  confirmed: boolean;
  onConfirm: (v: boolean) => void;
}

function SectionCard({ title, step, children, onEdit }: { title: string; step: number; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1 text-xs h-7">
          <Edit className="h-3 w-3" /> Editar
        </Button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

export default function Step5Review({ data, onGoToStep, confirmed, onConfirm }: Props) {
  const warnings: { msg: string; step: number }[] = [];
  if (!data.name) warnings.push({ msg: 'Nome da empresa obrigatório', step: 0 });
  if (!data.category_main) warnings.push({ msg: 'Categoria principal obrigatória', step: 0 });
  if (!data.phone) warnings.push({ msg: 'Telefone obrigatório', step: 1 });
  if (!data.email) warnings.push({ msg: 'E-mail obrigatório', step: 1 });
  if ((data.business_type === 'physical' || data.business_type === 'both') && !data.city) warnings.push({ msg: 'Cidade obrigatória', step: 1 });
  if (data.description_full.length < 150) warnings.push({ msg: 'Descrição com menos de 150 caracteres', step: 3 });

  const openDays = DAYS_OF_WEEK.filter(d => data.opening_hours[d.key]?.open);
  const selectedAmenities = AMENITIES_LIST.filter(a => data.amenities.includes(a.key));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Revisão e Publicação</h2>
          <p className="text-sm text-muted-foreground">Confira os dados antes de publicar</p>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Campos incompletos
          </p>
          {warnings.map((w, i) => (
            <button key={i} onClick={() => onGoToStep(w.step)} className="block text-sm text-yellow-600 dark:text-yellow-300 hover:underline">
              → {w.msg}
            </button>
          ))}
        </div>
      )}

      {/* Section 1 */}
      <SectionCard title="Identificação" step={0} onEdit={() => onGoToStep(0)}>
        <Field label="Nome" value={data.name} />
        <Field label="CNPJ" value={data.cnpj} />
        <Field label="Categoria" value={data.category_main} />
        {data.categories_secondary.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.categories_secondary.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
          </div>
        )}
        <Field label="Site" value={data.website} />
        <Field label="Fundação" value={data.year_founded} />
      </SectionCard>

      {/* Section 2 */}
      <SectionCard title="Localização e Contato" step={1} onEdit={() => onGoToStep(1)}>
        <Field label="Tipo" value={data.business_type === 'physical' ? 'Endereço físico' : data.business_type === 'delivery' ? 'Atendimento em domicílio' : 'Ambos'} />
        {data.address && <Field label="Endereço" value={`${data.address}, ${data.number}${data.complement ? ` - ${data.complement}` : ''}`} />}
        {data.city && <Field label="Cidade" value={`${data.neighborhood ? data.neighborhood + ', ' : ''}${data.city} - ${data.state}`} />}
        <Field label="CEP" value={data.cep} />
        <Field label="Telefone" value={data.phone} />
        <Field label="WhatsApp" value={data.whatsapp_same ? data.phone : data.whatsapp} />
        <Field label="E-mail" value={data.email} />
      </SectionCard>

      {/* Section 3 */}
      <SectionCard title="Horários e Atributos" step={2} onEdit={() => onGoToStep(2)}>
        <div className="text-sm space-y-0.5">
          {openDays.map(d => {
            const s = data.opening_hours[d.key];
            return <p key={d.key} className="text-muted-foreground">{d.label}: <span className="text-foreground">{s.start} — {s.end}</span></p>;
          })}
          {openDays.length === 0 && <p className="text-muted-foreground italic">Nenhum dia configurado</p>}
        </div>
        {selectedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedAmenities.map(a => <Badge key={a.key} variant="secondary" className="text-xs gap-1">{a.icon} {a.label}</Badge>)}
          </div>
        )}
      </SectionCard>

      {/* Section 4 */}
      <SectionCard title="Conteúdo" step={3} onEdit={() => onGoToStep(3)}>
        {data.description_full && <p className="text-sm text-muted-foreground line-clamp-3">{data.description_full}</p>}
        {data.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.services.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
          </div>
        )}
        <Field label="Google Maps" value={data.google_maps_url} />
        <Field label="Instagram" value={data.instagram} />
        <Field label="Facebook" value={data.facebook} />
      </SectionCard>

      {/* Confirmação */}
      <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer">
        <Checkbox checked={confirmed} onCheckedChange={v => onConfirm(!!v)} className="mt-0.5" />
        <span className="text-sm text-muted-foreground">
          Confirmo que os dados informados são verdadeiros e autorizo a publicação do perfil da minha empresa.
        </span>
      </label>
    </div>
  );
}
