import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { School, Upload, Download, Search, CheckCircle2, XCircle, Loader2, Plus } from "lucide-react";
import { useSchools, useCreateSchool, useUpdateSchool } from "@/hooks/useSchools";
import { toast } from "sonner";

const REDES = ["municipal", "estadual", "particular"];
const BAIRROS_COTIA = [
  "Centro", "Granja Viana", "Caucaia do Alto", "Jardim Atalaia", "Jardim Barbacena",
  "Jardim da Glória", "Jardim Nomura", "Parque São George", "Portão", "Ressaca", "Outro"
];

export default function EscolasAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRede, setFilterRede] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schools, isLoading } = useSchools({
    rede: filterRede as any || undefined,
    status: filterStatus as any || undefined,
  });

  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();

  const filteredSchools = schools?.filter(school =>
    school.nome_oficial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.bairro.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i] || "";
        });
        return obj;
      }).filter(row => row.nome_oficial || row.nome);

      // Normalize data
      const normalizedData = data.map(row => ({
        nome_oficial: row.nome_oficial || row.nome || "",
        rede: (row.rede || "municipal").toLowerCase(),
        bairro: row.bairro || "Centro",
        endereco: row.endereco || null,
      }));

      setCsvData(normalizedData);
      setShowCsvPreview(true);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of csvData) {
      try {
        await createSchool.mutateAsync({
          nome_oficial: row.nome_oficial,
          rede: row.rede,
          bairro: row.bairro,
          endereco: row.endereco,
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsImporting(false);
    setShowCsvPreview(false);
    setCsvData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    toast.success(`Importação concluída: ${successCount} escolas adicionadas, ${errorCount} erros`);
  };

  const handleExport = () => {
    if (!schools?.length) return;

    const headers = ["nome_oficial", "rede", "bairro", "endereco", "status"];
    const csvContent = [
      headers.join(","),
      ...schools.map(s => [
        `"${s.nome_oficial}"`,
        s.rede,
        s.bairro,
        s.endereco || "",
        s.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `escolas-cotia-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateSchool.mutateAsync({ id, status: newStatus as any });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "inativo":
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Escolas | Transporte Escolar Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              Gerenciar Escolas
            </h1>
            <p className="text-muted-foreground">Catálogo de escolas de Cotia</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!schools?.length}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou bairro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterRede || "all"} onValueChange={(v) => setFilterRede(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {REDES.map(r => (
                    <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Rede</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma escola encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.nome_oficial}</TableCell>
                        <TableCell className="capitalize">{school.rede}</TableCell>
                        <TableCell>{school.bairro}</TableCell>
                        <TableCell>{statusBadge(school.status)}</TableCell>
                        <TableCell className="text-right">
                          {school.status === "pendente" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(school.id, "ativo")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          {school.status === "ativo" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(school.id, "inativo")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Desativar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* CSV Preview Dialog */}
        <Dialog open={showCsvPreview} onOpenChange={setShowCsvPreview}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Pré-visualização da Importação</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Rede</TableHead>
                    <TableHead>Bairro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.nome_oficial}</TableCell>
                      <TableCell className="capitalize">{row.rede}</TableCell>
                      <TableCell>{row.bairro}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <p className="text-sm text-muted-foreground mr-auto">
                {csvData.length} escolas serão importadas
              </p>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Importar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
