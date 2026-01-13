import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { School, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateSchool } from "@/hooks/useSchools";

const schoolSchema = z.object({
  nome_oficial: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  rede: z.enum(["municipal", "estadual", "particular"]),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  endereco: z.string().optional(),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolNotFoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (schoolId: string) => void;
}

export function SchoolNotFoundModal({ open, onOpenChange, onSuccess }: SchoolNotFoundModalProps) {
  const createSchool = useCreateSchool();

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      nome_oficial: "",
      rede: "municipal",
      bairro: "",
      endereco: "",
    },
  });

  const onSubmit = async (data: SchoolFormData) => {
    const result = await createSchool.mutateAsync({
      nome_oficial: data.nome_oficial,
      rede: data.rede,
      bairro: data.bairro,
      endereco: data.endereco,
      status: "pendente",
    });
    
    if (result?.id && onSuccess) {
      onSuccess(result.id);
    }
    
    onOpenChange(false);
    form.reset();
  };

  const redeOptions = [
    { value: "municipal", label: "Municipal" },
    { value: "estadual", label: "Estadual" },
    { value: "particular", label: "Particular" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Adicionar Nova Escola
          </DialogTitle>
          <DialogDescription>
            Não encontrou sua escola? Preencha os dados abaixo para solicitarmos a inclusão no catálogo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome_oficial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da escola *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: E.E. Prof. João da Silva"
                      aria-label="Nome oficial da escola"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rede"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rede *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Selecione a rede de ensino">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {redeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Jardim da Glória"
                      aria-label="Bairro da escola"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rua, número..."
                      aria-label="Endereço completo da escola"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createSchool.isPending}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {createSchool.isPending ? "Enviando..." : "Solicitar Inclusão"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
