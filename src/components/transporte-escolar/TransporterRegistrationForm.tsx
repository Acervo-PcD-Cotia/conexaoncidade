import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { SchoolAutocomplete, type School } from "./SchoolAutocomplete";
import { useCreateTransporter } from "@/hooks/useTransporters";

// Local type for form school data
interface FormSchool {
  id: string;
  nome_oficial: string;
  rede?: string;
  bairro?: string;
}

const TIPOS_SERVICO = [
  { value: "porta_a_porta", label: "Porta a porta" },
  { value: "ponto_encontro", label: "Ponto de encontro" },
  { value: "ambos", label: "Ambos" },
];

const TIPOS_VEICULO = [
  { value: "van", label: "Van" },
  { value: "kombi", label: "Kombi" },
  { value: "micro_onibus", label: "Micro-ônibus" },
  { value: "onibus", label: "Ônibus" },
  { value: "carro", label: "Carro" },
];

const TURNOS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "integral", label: "Integral" },
];

const BAIRROS_COTIA = [
  "Centro", "Granja Viana", "Caucaia do Alto", "Jardim Atalaia", "Jardim Barbacena",
  "Jardim da Glória", "Jardim Nomura", "Parque São George", "Portão", "Ressaca", "Outro"
];

const ACESSIBILIDADE_TIPOS = [
  { value: "cadeira_rodas", label: "Cadeira de rodas" },
  { value: "mobilidade_reduzida", label: "Mobilidade reduzida" },
  { value: "autismo", label: "TEA (Autismo)" },
  { value: "auditiva", label: "Deficiência auditiva" },
  { value: "visual", label: "Deficiência visual" },
];

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  whatsapp: z.string().min(14, "WhatsApp inválido"),
  telefone: z.string().optional(),
  descricao_curta: z.string().max(240, "Máximo 240 caracteres").optional(),
  tipo_servico: z.string().min(1, "Selecione o tipo de serviço"),
  veiculo_tipo: z.string().min(1, "Selecione o tipo de veículo"),
  capacidade_aprox: z.coerce.number().min(1).max(100).optional(),
  ar_condicionado: z.boolean(),
  cinto_individual: z.boolean(),
  atende_acessibilidade: z.boolean(),
  acessibilidade_tipos: z.array(z.string()),
  schools: z.array(z.object({
    school: z.object({
      id: z.string(),
      nome_oficial: z.string(),
    }).nullable(),
  })).min(1, "Adicione pelo menos uma escola"),
  areas: z.array(z.object({
    bairro: z.string().optional(),
    turno: z.string().optional(),
  })).min(1, "Adicione pelo menos uma área de cobertura"),
});

type FormValues = z.infer<typeof formSchema>;

interface TransporterRegistrationFormProps {
  onSuccess: () => void;
}

export function TransporterRegistrationForm({ onSuccess }: TransporterRegistrationFormProps) {
  const [selectedSchools, setSelectedSchools] = useState<(FormSchool | null)[]>([null]);
  const createTransporter = useCreateTransporter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      whatsapp: "",
      telefone: "",
      descricao_curta: "",
      tipo_servico: "",
      veiculo_tipo: "",
      ar_condicionado: false,
      cinto_individual: false,
      atende_acessibilidade: false,
      acessibilidade_tipos: [],
      schools: [{ school: null }],
      areas: [{ bairro: "", turno: "" }],
    },
  });

  const { fields: areaFields, append: appendArea, remove: removeArea } = useFieldArray({
    control: form.control,
    name: "areas",
  });

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  };

  const addSchool = () => {
    setSelectedSchools([...selectedSchools, null]);
    form.setValue("schools", [...form.getValues("schools"), { school: null }]);
  };

  const removeSchool = (index: number) => {
    if (selectedSchools.length > 1) {
      const newSchools = selectedSchools.filter((_, i) => i !== index);
      setSelectedSchools(newSchools);
      form.setValue("schools", newSchools.map(s => ({ school: s })));
    }
  };

  const updateSchool = (index: number, school: FormSchool | null) => {
    const newSchools = [...selectedSchools];
    newSchools[index] = school;
    setSelectedSchools(newSchools);
    form.setValue("schools", newSchools.map(s => ({ school: s ? { id: s.id, nome_oficial: s.nome_oficial } : null })));
  };

  const toggleAcessibilidadeTipo = (tipo: string) => {
    const current = form.getValues("acessibilidade_tipos");
    const updated = current.includes(tipo)
      ? current.filter(t => t !== tipo)
      : [...current, tipo];
    form.setValue("acessibilidade_tipos", updated);
  };

  const onSubmit = async (values: FormValues) => {
    const schoolIds = selectedSchools.filter((s): s is FormSchool => s !== null).map(s => s.id);
    
    if (schoolIds.length === 0) {
      form.setError("schools", { message: "Adicione pelo menos uma escola" });
      return;
    }

    // Filter valid areas
    const validAreas = values.areas
      .filter(a => a.bairro && a.turno)
      .map(a => ({ bairro: a.bairro!, turno: a.turno! }));

    if (validAreas.length === 0) {
      form.setError("areas", { message: "Adicione pelo menos uma área válida" });
      return;
    }

    await createTransporter.mutateAsync({
      transporter: {
        nome: values.nome,
        whatsapp: values.whatsapp.replace(/\D/g, ""),
        telefone: values.telefone?.replace(/\D/g, "") || undefined,
        descricao_curta: values.descricao_curta || undefined,
        tipo_servico: values.tipo_servico,
        veiculo_tipo: values.veiculo_tipo,
        capacidade_aprox: values.capacidade_aprox,
        ar_condicionado: values.ar_condicionado,
        cinto_individual: values.cinto_individual,
        atende_acessibilidade: values.atende_acessibilidade,
        acessibilidade_tipos: values.acessibilidade_tipos,
      },
      schools: schoolIds,
      areas: validAreas,
    });

    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Transportador</CardTitle>
            <CardDescription>Informações de contato e identificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Seu nome completo" aria-required="true" />
                  </FormControl>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(11) 99999-9999"
                        onChange={(e) => field.onChange(formatWhatsApp(e.target.value))}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone fixo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(11) 4999-9999"
                        onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao_curta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição curta</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Breve descrição do seu serviço (ex: 'Transporte escolar há 10 anos em Cotia')"
                      maxLength={240}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/240 caracteres
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Veículo */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Veículo</CardTitle>
            <CardDescription>Informações sobre o veículo utilizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tipo_servico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de serviço *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-required="true">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_SERVICO.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="veiculo_tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de veículo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-required="true">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_VEICULO.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="capacidade_aprox"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade aproximada</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      placeholder="Número de passageiros"
                    />
                  </FormControl>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="ar_condicionado"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Ar-condicionado</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cinto_individual"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Cinto individual</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Acessibilidade */}
        <Card>
          <CardHeader>
            <CardTitle>Acessibilidade</CardTitle>
            <CardDescription>Atendimento a pessoas com deficiência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="atende_acessibilidade"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="cursor-pointer">Atendo pessoas com deficiência</FormLabel>
                </FormItem>
              )}
            />

            {form.watch("atende_acessibilidade") && (
              <div className="pt-2 space-y-3">
                <p className="text-sm text-muted-foreground">Quais tipos de acessibilidade você oferece?</p>
                {ACESSIBILIDADE_TIPOS.map(tipo => (
                  <div key={tipo.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`form-acess-${tipo.value}`}
                      checked={form.watch("acessibilidade_tipos").includes(tipo.value)}
                      onCheckedChange={() => toggleAcessibilidadeTipo(tipo.value)}
                    />
                    <label htmlFor={`form-acess-${tipo.value}`} className="text-sm cursor-pointer">
                      {tipo.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Escolas */}
        <Card>
          <CardHeader>
            <CardTitle>Escolas Atendidas *</CardTitle>
            <CardDescription>Adicione todas as escolas que você atende</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSchools.map((school, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <SchoolAutocomplete
                    value={school?.id}
                    onSelect={(id, data) => updateSchool(index, data ? { id, nome_oficial: data.nome_oficial, rede: data.rede, bairro: data.bairro } : null)}
                    placeholder={`Escola ${index + 1}`}
                  />
                </div>
                {selectedSchools.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSchool(index)}
                    aria-label="Remover escola"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSchool}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar escola
            </Button>
            {form.formState.errors.schools && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.schools.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Áreas de Cobertura */}
        <Card>
          <CardHeader>
            <CardTitle>Áreas de Cobertura *</CardTitle>
            <CardDescription>Bairros e turnos em que você opera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {areaFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start flex-wrap sm:flex-nowrap">
                <FormField
                  control={form.control}
                  name={`areas.${index}.bairro`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[180px]">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bairro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BAIRROS_COTIA.map(bairro => (
                            <SelectItem key={bairro} value={bairro}>
                              {bairro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`areas.${index}.turno`}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[140px]">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Turno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TURNOS.map(turno => (
                            <SelectItem key={turno.value} value={turno.value}>
                              {turno.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {areaFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArea(index)}
                    aria-label="Remover área"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendArea({ bairro: "", turno: "" })}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar área
            </Button>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={createTransporter.isPending}
        >
          {createTransporter.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Enviar Cadastro
        </Button>
      </form>
    </Form>
  );
}
