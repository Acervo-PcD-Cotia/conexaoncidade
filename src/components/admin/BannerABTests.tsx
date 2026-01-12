import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Plus,
  Beaker,
  Trophy,
  Pause,
  Play,
  Trash2,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ABTestForm {
  name: string;
  banner_a_id: string;
  banner_b_id: string;
  traffic_split: number;
}

const defaultForm: ABTestForm = {
  name: "",
  banner_a_id: "",
  banner_b_id: "",
  traffic_split: 50,
};

export function BannerABTests() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ABTestForm>(defaultForm);
  const queryClient = useQueryClient();

  // Fetch banners
  const { data: banners } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("super_banners")
        .select("*")
        .eq("is_active", true)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Fetch A/B tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ["banner-ab-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_ab_tests")
        .select(`
          *,
          banner_a:banner_a_id(id, title, image_url),
          banner_b:banner_b_id(id, title, image_url),
          winner:winner_id(id, title)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch impressions for calculating stats
  const { data: abImpressions } = useQuery({
    queryKey: ["banner-ab-impressions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_ab_impressions")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats per test
  const testStats = useMemo(() => {
    const stats: Record<string, {
      impressionsA: number;
      impressionsB: number;
      conversionsA: number;
      conversionsB: number;
      ctrA: number;
      ctrB: number;
    }> = {};

    abImpressions?.forEach((imp) => {
      const testId = imp.test_id;
      if (!testId) return;

      if (!stats[testId]) {
        stats[testId] = {
          impressionsA: 0,
          impressionsB: 0,
          conversionsA: 0,
          conversionsB: 0,
          ctrA: 0,
          ctrB: 0,
        };
      }

      if (imp.variant === "A") {
        stats[testId].impressionsA++;
        if (imp.converted) stats[testId].conversionsA++;
      } else {
        stats[testId].impressionsB++;
        if (imp.converted) stats[testId].conversionsB++;
      }
    });

    // Calculate CTR
    Object.values(stats).forEach((s) => {
      s.ctrA = s.impressionsA > 0 ? (s.conversionsA / s.impressionsA) * 100 : 0;
      s.ctrB = s.impressionsB > 0 ? (s.conversionsB / s.impressionsB) * 100 : 0;
    });

    return stats;
  }, [abImpressions]);

  const createMutation = useMutation({
    mutationFn: async (data: ABTestForm) => {
      const { error } = await supabase.from("banner_ab_tests").insert({
        name: data.name,
        banner_a_id: data.banner_a_id,
        banner_b_id: data.banner_b_id,
        traffic_split: data.traffic_split,
        status: "running",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-ab-tests"] });
      toast.success("Teste A/B criado!");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, winner_id }: { id: string; status: string; winner_id?: string }) => {
      const payload: Record<string, unknown> = { status };
      if (winner_id) payload.winner_id = winner_id;
      
      const { error } = await supabase
        .from("banner_ab_tests")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-ab-tests"] });
      toast.success("Teste atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banner_ab_tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-ab-tests"] });
      toast.success("Teste excluído!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.banner_a_id || !form.banner_b_id) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (form.banner_a_id === form.banner_b_id) {
      toast.error("Selecione banners diferentes");
      return;
    }
    createMutation.mutate(form);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Em execução</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pausado</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Concluído</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Testes A/B</h2>
          <p className="text-sm text-muted-foreground">
            Compare a performance de diferentes banners
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(defaultForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Teste A/B
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Criar Teste A/B
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Teste</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Teste cor do CTA Janeiro"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Banner A (Controle)</Label>
                  <Select
                    value={form.banner_a_id}
                    onValueChange={(v) => setForm({ ...form, banner_a_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {banners?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title || "Sem título"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Banner B (Variante)</Label>
                  <Select
                    value={form.banner_b_id}
                    onValueChange={(v) => setForm({ ...form, banner_b_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {banners?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title || "Sem título"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Divisão de Tráfego: {form.traffic_split}% A / {100 - form.traffic_split}% B</Label>
                <Slider
                  value={[form.traffic_split]}
                  onValueChange={([v]) => setForm({ ...form, traffic_split: v })}
                  min={10}
                  max={90}
                  step={5}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Define qual porcentagem dos usuários verá cada banner
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Iniciar Teste"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Carregando...</div>
      ) : tests?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Beaker className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum teste A/B criado</p>
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro teste para comparar a performance de banners
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests?.map((test) => {
            const stats = testStats[test.id] || {
              impressionsA: 0,
              impressionsB: 0,
              conversionsA: 0,
              conversionsB: 0,
              ctrA: 0,
              ctrB: 0,
            };

            const totalImpressions = stats.impressionsA + stats.impressionsB;
            const leadingVariant = stats.ctrA > stats.ctrB ? "A" : stats.ctrB > stats.ctrA ? "B" : null;

            return (
              <Card key={test.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{test.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Criado em {format(new Date(test.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    {test.status === "running" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatusMutation.mutate({ id: test.id, status: "paused" })}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {test.status === "paused" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatusMutation.mutate({ id: test.id, status: "running" })}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Excluir este teste?")) {
                          deleteMutation.mutate(test.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Banner A */}
                    <div className={`rounded-lg border p-3 ${leadingVariant === "A" ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : ""}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">Banner A (Controle)</span>
                        {leadingVariant === "A" && (
                          <Trophy className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {test.banner_a && (
                        <div className="mb-2 aspect-[21/9] overflow-hidden rounded">
                          <img
                            src={(test.banner_a as any).image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {(test.banner_a as any)?.title || "Sem título"}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="font-semibold">{stats.impressionsA}</p>
                          <p className="text-muted-foreground">Impressões</p>
                        </div>
                        <div>
                          <p className="font-semibold">{stats.conversionsA}</p>
                          <p className="text-muted-foreground">Cliques</p>
                        </div>
                        <div>
                          <p className="font-semibold">{stats.ctrA.toFixed(2)}%</p>
                          <p className="text-muted-foreground">CTR</p>
                        </div>
                      </div>
                    </div>

                    {/* Banner B */}
                    <div className={`rounded-lg border p-3 ${leadingVariant === "B" ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : ""}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">Banner B (Variante)</span>
                        {leadingVariant === "B" && (
                          <Trophy className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {test.banner_b && (
                        <div className="mb-2 aspect-[21/9] overflow-hidden rounded">
                          <img
                            src={(test.banner_b as any).image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {(test.banner_b as any)?.title || "Sem título"}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="font-semibold">{stats.impressionsB}</p>
                          <p className="text-muted-foreground">Impressões</p>
                        </div>
                        <div>
                          <p className="font-semibold">{stats.conversionsB}</p>
                          <p className="text-muted-foreground">Cliques</p>
                        </div>
                        <div>
                          <p className="font-semibold">{stats.ctrB.toFixed(2)}%</p>
                          <p className="text-muted-foreground">CTR</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Traffic Split Progress */}
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Divisão: {test.traffic_split}% A / {100 - test.traffic_split}% B</span>
                      <span>{totalImpressions} impressões totais</span>
                    </div>
                    <Progress value={test.traffic_split} className="h-2" />
                  </div>

                  {/* Declare Winner Button */}
                  {test.status !== "completed" && totalImpressions >= 100 && leadingVariant && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const winnerId = leadingVariant === "A" ? test.banner_a_id : test.banner_b_id;
                          if (confirm(`Declarar Banner ${leadingVariant} como vencedor?`)) {
                            updateStatusMutation.mutate({
                              id: test.id,
                              status: "completed",
                              winner_id: winnerId || undefined,
                            });
                          }
                        }}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Declarar Banner {leadingVariant} Vencedor
                      </Button>
                    </div>
                  )}

                  {test.winner && (
                    <div className="mt-4 rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                      <Trophy className="mx-auto mb-1 h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-700 dark:text-green-400">
                        Vencedor: {(test.winner as any)?.title}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
