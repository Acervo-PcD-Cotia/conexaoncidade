import { useState } from "react";
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Award,
  Ban,
  Mail,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data
const mockMembers = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    avatar: null,
    level: "ambassador",
    points: 2450,
    shares: 89,
    posts: 34,
    joinedAt: new Date(Date.now() - 30 * 86400000),
    lastActive: new Date(),
    isSuspended: false,
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@email.com",
    avatar: null,
    level: "collaborator",
    points: 1200,
    shares: 45,
    posts: 12,
    joinedAt: new Date(Date.now() - 60 * 86400000),
    lastActive: new Date(Date.now() - 3600000),
    isSuspended: false,
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana@email.com",
    avatar: null,
    level: "supporter",
    points: 580,
    shares: 28,
    posts: 5,
    joinedAt: new Date(Date.now() - 15 * 86400000),
    lastActive: new Date(Date.now() - 86400000),
    isSuspended: false,
  },
  {
    id: "4",
    name: "Pedro Lima",
    email: "pedro@email.com",
    avatar: null,
    level: "visitor",
    points: 120,
    shares: 12,
    posts: 1,
    joinedAt: new Date(Date.now() - 7 * 86400000),
    lastActive: new Date(Date.now() - 172800000),
    isSuspended: true,
  },
];

const levelConfig: Record<string, { label: string; color: string }> = {
  visitor: { label: "Visitante", color: "bg-gray-100 text-gray-800" },
  supporter: { label: "Apoiador", color: "bg-blue-100 text-blue-800" },
  collaborator: { label: "Colaborador", color: "bg-green-100 text-green-800" },
  ambassador: { label: "Embaixador", color: "bg-purple-100 text-purple-800" },
  leader: { label: "Líder", color: "bg-yellow-100 text-yellow-800" },
};

export default function CommunityMembers() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                         member.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || member.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membros da Comunidade</h1>
        <p className="text-muted-foreground">Gerencie os membros e seus níveis</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-sm"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="visitor">Visitante</SelectItem>
                <SelectItem value="supporter">Apoiador</SelectItem>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="ambassador">Embaixador</SelectItem>
                <SelectItem value="leader">Líder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Pontos
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={levelConfig[member.level]?.color}>
                    <Award className="h-3 w-3 mr-1" />
                    {levelConfig[member.level]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{member.points.toLocaleString()}</TableCell>
                <TableCell>{member.shares}</TableCell>
                <TableCell>{member.posts}</TableCell>
                <TableCell>
                  {format(member.joinedAt, "dd/MM/yy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(member.lastActive, "dd/MM HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {member.isSuspended ? (
                    <Badge variant="destructive">Suspenso</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="h-4 w-4 mr-2" />
                        Alterar Nível
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Ban className="h-4 w-4 mr-2" />
                        {member.isSuspended ? "Remover Suspensão" : "Suspender"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhum membro encontrado</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
