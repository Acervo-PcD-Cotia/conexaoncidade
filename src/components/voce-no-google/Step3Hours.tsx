import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { BusinessFormData, DAYS_OF_WEEK, AMENITIES_LIST, DaySchedule } from '@/constants/businessForm';
import { Clock } from 'lucide-react';

interface Props {
  data: BusinessFormData;
  onChange: <K extends keyof BusinessFormData>(key: K, val: BusinessFormData[K]) => void;
}

export default function Step3Hours({ data, onChange }: Props) {
  const updateDay = (day: string, field: keyof DaySchedule, value: any) => {
    onChange('opening_hours', {
      ...data.opening_hours,
      [day]: { ...data.opening_hours[day], [field]: value },
    });
  };

  const toggleAmenity = (key: string) => {
    if (data.amenities.includes(key)) {
      onChange('amenities', data.amenities.filter(a => a !== key));
    } else {
      onChange('amenities', [...data.amenities, key]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Horários e Atributos</h2>
          <p className="text-sm text-muted-foreground">Quando você atende e o que oferece</p>
        </div>
      </div>

      {/* Horários */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Horário de funcionamento</Label>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(day => {
            const sch = data.opening_hours[day.key];
            return (
              <div key={day.key} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                <Switch
                  checked={sch?.open ?? false}
                  onCheckedChange={v => updateDay(day.key, 'open', v)}
                />
                <span className={`text-sm w-28 ${sch?.open ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {day.label}
                </span>
                {sch?.open ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={sch.start}
                      onChange={e => updateDay(day.key, 'start', e.target.value)}
                      className="bg-muted rounded px-2 py-1 text-xs border-0"
                    />
                    <span className="text-muted-foreground">até</span>
                    <input
                      type="time"
                      value={sch.end}
                      onChange={e => updateDay(day.key, 'end', e.target.value)}
                      className="bg-muted rounded px-2 py-1 text-xs border-0"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feriados */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Funciona em feriados?</Label>
        <RadioGroup value={data.holiday_hours} onValueChange={v => onChange('holiday_hours', v as any)}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="closed" id="hol-closed" />
            <Label htmlFor="hol-closed" className="font-normal text-sm">Não, fecha em feriados</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="open" id="hol-open" />
            <Label htmlFor="hol-open" className="font-normal text-sm">Sim, horário normal</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="special" id="hol-special" />
            <Label htmlFor="hol-special" className="font-normal text-sm">Horário especial</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Atributos */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Atributos do estabelecimento</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AMENITIES_LIST.map(a => (
            <label key={a.key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${data.amenities.includes(a.key) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
              <Checkbox checked={data.amenities.includes(a.key)} onCheckedChange={() => toggleAmenity(a.key)} />
              <span className="text-base">{a.icon}</span>
              <span className="text-sm">{a.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
