import { User, Accessibility, Users, GraduationCap, Store, Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const PROFILE_TYPES = [
  { value: "cidadao", label: "Cidadão", icon: User, description: "Morador da cidade" },
  { value: "pcd", label: "Pessoa com Deficiência", icon: Accessibility, description: "Pessoa com deficiência" },
  { value: "familiar", label: "Familiar / Responsável", icon: Users, description: "Familiar de PcD" },
  { value: "jovem", label: "Jovem (14+)", icon: GraduationCap, description: "Estudante ou jovem" },
  { value: "comerciante", label: "Comerciante / Parceiro", icon: Store, description: "Dono de negócio local" },
  { value: "voluntario", label: "Voluntário", icon: Heart, description: "Quer ajudar a comunidade" },
];

interface ProfileTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProfileTypeSelector({ value, onChange }: ProfileTypeSelectorProps) {
  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {PROFILE_TYPES.map(({ value: typeValue, label, icon: Icon, description }) => (
        <div key={typeValue}>
          <RadioGroupItem
            value={typeValue}
            id={`profile-${typeValue}`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`profile-${typeValue}`}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              "hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-900/20",
              "peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50 dark:peer-data-[state=checked]:bg-pink-900/30"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 mt-0.5",
              value === typeValue ? "text-pink-600" : "text-muted-foreground"
            )} />
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
