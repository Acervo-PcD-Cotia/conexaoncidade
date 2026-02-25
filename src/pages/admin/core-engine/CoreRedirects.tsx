import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRightLeft, Plus, Trash2, AlertTriangle, Download, RefreshCw } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CoreRedirects() {
  const queryClient = useQueryClient();
  const [newRedirect, setNewRedirect] = useState({ source_path: "", target_path: "", redirect_type: 301 });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: redirects = [], isLoading } = useQuery({
    queryKey: ["core-redirects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_redirects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: logs404 = [] } = useQuery({
    queryKey: ["core-404-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_404_log")
        .select("*")
        .eq("resolved", false)
        .order("hit_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (redirect: typeof newRedirect) => {
      const { error } = await supabase.from("core_redirects").insert({
        source_path: redirect.source_path,
        target_path: redirect.target_path,
        redirect_type: redirect.redirect_type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-redirects"] });
      setNewRedirect({ source_path: "", target_path: "", redirect_type: 301 });
      setDialogOpen(false);
      toast.success("Redirecionamento criado!");
    },
    onError: () => toast.error("Erro ao criar redirecionamento"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("core_redirects").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["core-redirects"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("core_redirects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-redirects"] });
      toast.success("Redirecionamento removido");
    },
  });

  const exportCSV = () => {
    const csv = ["source_path,target_path,type,hits,active"]
      .concat(redirects.map(r => `${r.source_path},${r.target_path},${r.redirect_type},${r.hits},${r.is_active}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "redirects.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/spah/painel/core-engine">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </NavLink>
          <div className="p-2 rounded-xl bg-amber-500/10"><ArrowRightLeft className="h-5 w-5 text-amber-500" /></div>
          <div>
            <h1 className="text-xl font-bold">Redirecionamentos</h1>
            <p className="text-xs text-muted-foreground">{redirects.length} regras ativas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" />CSV</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" />Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Redirecionamento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>URL de origem</Label>
                  <Input placeholder="/pagina-antiga" value={newRedirect.source_path} onChange={e => setNewRedirect(p => ({ ...p, source_path: e.target.value }))} />
                </div>
                <div>
                  <Label>URL de destino</Label>
                  <Input placeholder="/pagina-nova" value={newRedirect.target_path} onChange={e => setNewRedirect(p => ({ ...p, target_path: e.target.value }))} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={String(newRedirect.redirect_type)} onValueChange={v => setNewRedirect(p => ({ ...p, redirect_type: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="301">301 (Permanente)</SelectItem>
                      <SelectItem value="302">302 (Temporário)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate(newRedirect)} disabled={!newRedirect.source_path || !newRedirect.target_path}>
                  Criar Redirecionamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="redirects">
        <TabsList>
          <TabsTrigger value="redirects">Redirecionamentos</TabsTrigger>
          <TabsTrigger value="404">
            Erros 404
            {logs404.length > 0 && <Badge variant="destructive" className="ml-1.5 text-[10px] h-4 px-1">{logs404.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="redirects" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : redirects.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum redirecionamento cadastrado</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {redirects.map(r => (
                <Card key={r.id} className={cn(!r.is_active && "opacity-50")}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Switch checked={r.is_active} onCheckedChange={is_active => toggleMutation.mutate({ id: r.id, is_active })} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">{r.source_path}</code>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">{r.target_path}</code>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{r.redirect_type}</Badge>
                    <span className="text-xs text-muted-foreground shrink-0">{r.hits} hits</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteMutation.mutate(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="404" className="mt-4">
          {logs404.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum erro 404 registrado</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {logs404.map(log => (
                <Card key={log.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate block">{log.path}</code>
                      {log.referrer && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Ref: {log.referrer}</p>}
                    </div>
                    <Badge variant="destructive" className="text-[10px] shrink-0">{log.hit_count}x</Badge>
                    <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => {
                      setNewRedirect({ source_path: log.path, target_path: "/", redirect_type: 301 });
                      setDialogOpen(true);
                    }}>
                      Criar Redirect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
