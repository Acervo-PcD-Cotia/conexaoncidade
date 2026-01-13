import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCensoPcd, BAIRROS_COTIA, TIPOS_DEFICIENCIA, ATENDIMENTOS, NECESSIDADES_EDUCACIONAIS, BENEFICIOS, PRIORIDADES } from "@/hooks/useCensoPcd";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Download, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const getDeficienciaLabel = (value: string) => TIPOS_DEFICIENCIA.find(t => t.value === value)?.label || value;
const getAtendimentoLabel = (value: string) => ATENDIMENTOS.find(a => a.value === value)?.label || value;
const getNecessidadeLabel = (value: string) => NECESSIDADES_EDUCACIONAIS.find(n => n.value === value)?.label || value;
const getBeneficioLabel = (value: string) => BENEFICIOS.find(b => b.value === value)?.label || value;
const getPrioridadeLabel = (value: string) => PRIORIDADES.find(p => p.value === value)?.label || value;

export default function CensoPcdRespostas() {
  const { responses, isLoadingResponses } = useCensoPcd();
  const [searchTerm, setSearchTerm] = useState("");
  const [bairroFilter, setBairroFilter] = useState<string>("all");
  const [deficienciaFilter, setDeficienciaFilter] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredResponses = responses?.filter(r => {
    const matchesSearch = !searchTerm || 
      r.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bairro?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBairro = bairroFilter === "all" || r.bairro === bairroFilter;
    
    const matchesDeficiencia = deficienciaFilter === "all" || 
      r.tipos_deficiencia?.includes(deficienciaFilter);
    
    return matchesSearch && matchesBairro && matchesDeficiencia;
  }) || [];

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Nome', 'Data Nascimento', 'Sexo', 'Bairro', 'Tipo Deficiência', 
      'Possui Laudo', 'Nível Suporte TEA', 'Acompanhamento Médico', 'Atendimentos Necessários',
      'Local Atendimento', 'Em Fila de Espera', 'Matriculado Escola', 'Apoio Educacional',
      'Necessidades Educacionais', 'Benefícios', 'Renda Suficiente', 'Maior Necessidade',
      'Autoriza Contato', 'WhatsApp', 'Email', 'Data Resposta'
    ];
    
    const rows = filteredResponses.map(r => [
      r.id,
      r.nome_completo || 'Anônimo',
      r.data_nascimento || '',
      r.sexo || '',
      r.bairro || '',
      r.tipos_deficiencia?.map(getDeficienciaLabel).join('; ') || '',
      r.possui_laudo || '',
      r.nivel_suporte_tea || '',
      r.recebe_acompanhamento_medico ? 'Sim' : 'Não',
      r.atendimentos_necessarios?.map(getAtendimentoLabel).join('; ') || '',
      r.local_atendimento || '',
      r.em_fila_espera ? 'Sim' : 'Não',
      r.matriculado_escola || '',
      r.apoio_educacional || '',
      r.necessidades_educacionais?.map(getNecessidadeLabel).join('; ') || '',
      r.beneficio_recebido?.map(getBeneficioLabel).join('; ') || '',
      r.renda_suficiente === null ? '' : r.renda_suficiente ? 'Sim' : 'Não',
      getPrioridadeLabel(r.maior_necessidade),
      r.autoriza_contato ? 'Sim' : 'Não',
      r.telefone_whatsapp || '',
      r.email || '',
      r.created_at ? format(new Date(r.created_at), 'dd/MM/yyyy HH:mm') : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `censo-pcd-respostas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (isLoadingResponses) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/censo-pcd">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Respostas do Censo</h1>
            <p className="text-muted-foreground">
              {filteredResponses.length} de {responses?.length || 0} respostas
            </p>
          </div>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={bairroFilter} onValueChange={setBairroFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bairros</SelectItem>
                {BAIRROS_COTIA.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={deficienciaFilter} onValueChange={setDeficienciaFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo de deficiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {TIPOS_DEFICIENCIA.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Tipo Deficiência</TableHead>
                <TableHead>Maior Necessidade</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhuma resposta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map((response) => (
                  <Collapsible key={response.id} asChild open={expandedRow === response.id}>
                    <>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRow(response.id)}
                      >
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expandedRow === response.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium">
                          {response.nome_completo || 'Anônimo'}
                        </TableCell>
                        <TableCell>{response.bairro || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {response.tipos_deficiencia?.slice(0, 2).map(t => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {getDeficienciaLabel(t)}
                              </Badge>
                            ))}
                            {(response.tipos_deficiencia?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{response.tipos_deficiencia!.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {getPrioridadeLabel(response.maior_necessidade)}
                        </TableCell>
                        <TableCell>
                          {response.created_at 
                            ? format(new Date(response.created_at), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={6} className="p-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <h4 className="font-semibold mb-2">Dados Pessoais</h4>
                                <dl className="space-y-1 text-sm">
                                  <div>
                                    <dt className="text-muted-foreground inline">Data Nascimento: </dt>
                                    <dd className="inline">{response.data_nascimento || 'Não informado'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Sexo: </dt>
                                    <dd className="inline">{response.sexo === 'masculino' ? 'Masculino' : response.sexo === 'feminino' ? 'Feminino' : 'Prefere não informar'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Possui Laudo: </dt>
                                    <dd className="inline">{response.possui_laudo === 'sim' ? 'Sim' : response.possui_laudo === 'nao' ? 'Não' : 'Em processo'}</dd>
                                  </div>
                                  {response.nivel_suporte_tea && (
                                    <div>
                                      <dt className="text-muted-foreground inline">Nível Suporte TEA: </dt>
                                      <dd className="inline">{response.nivel_suporte_tea}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Saúde e Educação</h4>
                                <dl className="space-y-1 text-sm">
                                  <div>
                                    <dt className="text-muted-foreground inline">Acompanhamento Médico: </dt>
                                    <dd className="inline">{response.recebe_acompanhamento_medico ? 'Sim' : 'Não'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Atendimentos: </dt>
                                    <dd className="inline">{response.atendimentos_necessarios?.map(getAtendimentoLabel).join(', ') || 'Nenhum'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Escola: </dt>
                                    <dd className="inline">{response.matriculado_escola || 'Não informado'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Necessidades Educacionais: </dt>
                                    <dd className="inline">{response.necessidades_educacionais?.map(getNecessidadeLabel).join(', ') || 'Nenhuma'}</dd>
                                  </div>
                                </dl>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Assistência e Contato</h4>
                                <dl className="space-y-1 text-sm">
                                  <div>
                                    <dt className="text-muted-foreground inline">Benefícios: </dt>
                                    <dd className="inline">{response.beneficio_recebido?.map(getBeneficioLabel).join(', ') || 'Nenhum'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Renda Suficiente: </dt>
                                    <dd className="inline">{response.renda_suficiente === null ? 'Não informado' : response.renda_suficiente ? 'Sim' : 'Não'}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground inline">Maior Necessidade: </dt>
                                    <dd className="inline">{getPrioridadeLabel(response.maior_necessidade)}</dd>
                                  </div>
                                  {response.autoriza_contato && response.telefone_whatsapp && (
                                    <div>
                                      <dt className="text-muted-foreground inline">WhatsApp: </dt>
                                      <dd className="inline">{response.telefone_whatsapp}</dd>
                                    </div>
                                  )}
                                  {response.autoriza_contato && response.email && (
                                    <div>
                                      <dt className="text-muted-foreground inline">Email: </dt>
                                      <dd className="inline">{response.email}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
