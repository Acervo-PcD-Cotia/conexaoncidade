import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, 
  Building2, Users, TrendingUp, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useImoveis } from "@/modules/imoveis/hooks/useImoveis";
import { useAnunciantes } from "@/modules/imoveis/hooks/useAnunciantes";
import { TIPO_LABELS, FINALIDADE_LABELS, STATUS_LABELS } from "@/modules/imoveis/types";

export default function ImoveisAdmin() {
  const [search, setSearch] = useState("");
  const { data: imoveis, isLoading } = useImoveis({});
  const { data: anunciantes } = useAnunciantes();

  const stats = {
    total: imoveis?.length || 0,
    ativos: imoveis?.filter(i => i.status === 'ativo').length || 0,
    anunciantes: anunciantes?.length || 0,
    views: imoveis?.reduce((acc, i) => acc + (i.views_count || 0), 0) || 0,
  };

  const filteredImoveis = imoveis?.filter(i => 
    i.titulo.toLowerCase().includes(search.toLowerCase()) ||
    i.cidade.toLowerCase().includes(search.toLowerCase()) ||
    i.bairro.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (value?: number) => {
    if (!value) return "-";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'vendido': case 'alugado': return 'bg-blue-500';
      case 'pendente': return 'bg-amber-500';
      case 'inativo': case 'rascunho': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Home className="h-6 w-6" />
            Módulo Imobiliário
          </h1>
          <p className="text-muted-foreground">Gerencie imóveis, anunciantes e leads</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/imoveis/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Imóvel
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Imóveis</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.ativos} ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anunciantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anunciantes}</div>
            <p className="text-xs text-muted-foreground">corretores e imobiliárias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">total de views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">contatos recebidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/imoveis/anunciantes">
            <Building2 className="mr-2 h-4 w-4" />
            Anunciantes
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/imoveis/leads">
            <Users className="mr-2 h-4 w-4" />
            Leads
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/imoveis/bairros">
            Guia de Bairros
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, cidade ou bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImoveis?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum imóvel encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredImoveis?.map((imovel) => (
                    <TableRow key={imovel.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={imovel.imagens?.[0]?.url || "/placeholder.svg"}
                            alt=""
                            className="h-10 w-14 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium line-clamp-1">{imovel.titulo}</p>
                            <p className="text-xs text-muted-foreground">{imovel.codigo || imovel.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{TIPO_LABELS[imovel.tipo]}</Badge>
                      </TableCell>
                      <TableCell>
                        <p>{imovel.bairro}</p>
                        <p className="text-xs text-muted-foreground">{imovel.cidade}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatPrice(imovel.preco)}</p>
                        <p className="text-xs text-muted-foreground">{FINALIDADE_LABELS[imovel.finalidade]}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(imovel.status)}>
                          {STATUS_LABELS[imovel.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/imoveis/${imovel.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver página
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/imoveis/${imovel.id}/editar`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
