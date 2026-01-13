import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface School {
  id: string;
  nome_oficial: string;
  slug: string;
  rede: 'municipal' | 'estadual' | 'particular';
  bairro: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  status: 'ativo' | 'pendente' | 'inativo';
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export type SchoolInsert = {
  nome_oficial: string;
  slug?: string;
  rede: string;
  bairro: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  tenant_id?: string;
};

export function useSchools(filters?: { 
  rede?: string; 
  bairro?: string; 
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["schools", filters],
    queryFn: async () => {
      let query = supabase
        .from("schools")
        .select("*")
        .order("nome_oficial");

      if (filters?.rede) {
        query = query.eq("rede", filters.rede);
      }
      if (filters?.bairro) {
        query = query.eq("bairro", filters.bairro);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.ilike("nome_oficial", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as School[];
    },
  });
}

export function useSchoolBySlug(slug: string) {
  return useQuery({
    queryKey: ["school", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as School;
    },
    enabled: !!slug,
  });
}

export function useSchoolAutocomplete(search: string, rede?: string) {
  return useQuery({
    queryKey: ["schools-autocomplete", search, rede],
    queryFn: async () => {
      let query = supabase
        .from("schools")
        .select("id, nome_oficial, rede, bairro, slug")
        .eq("status", "ativo")
        .order("nome_oficial")
        .limit(20);

      if (search && search.length >= 2) {
        query = query.ilike("nome_oficial", `%${search}%`);
      }
      if (rede && rede !== 'nao_sei') {
        query = query.eq("rede", rede);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: search.length >= 2 || !search,
  });
}

export function useSchoolBairros() {
  return useQuery({
    queryKey: ["school-bairros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("bairro")
        .eq("status", "ativo");
      
      if (error) throw error;
      
      const uniqueBairros = [...new Set(data.map(s => s.bairro))].sort();
      return uniqueBairros;
    },
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (school: SchoolInsert) => {
      // Generate slug if not provided
      const slug = school.slug || generateSlug(school.nome_oficial, school.rede, school.bairro);
      
      const { data, error } = await supabase
        .from("schools")
        .insert({ ...school, slug })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Escola cadastrada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar escola: " + error.message);
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<School> & { id: string }) => {
      const { data, error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Escola atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar escola: " + error.message);
    },
  });
}

export function useImportSchools() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schools: SchoolInsert[]) => {
      // Generate slugs for all schools
      const schoolsWithSlugs = schools.map(school => ({
        ...school,
        slug: school.slug || generateSlug(school.nome_oficial, school.rede, school.bairro),
      }));
      
      const { data, error } = await supabase
        .from("schools")
        .insert(schoolsWithSlugs)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success(`${data.length} escolas importadas com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error("Erro ao importar escolas: " + error.message);
    },
  });
}

// Helper function to generate slug
function generateSlug(nome: string, rede: string, bairro: string): string {
  const text = `${nome}-${rede}-${bairro}`;
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
