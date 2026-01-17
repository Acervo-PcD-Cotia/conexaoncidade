import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, Search, Briefcase, Clock, MapPin, Building2, Star, Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useAdminJobs, 
  useUpdateJob,
  useDeleteJob,
  JOB_TYPES,
  Job 
} from "@/hooks/useJobs";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativa", variant: "default" },
  paused: { label: "Pausada", variant: "secondary" },
  closed: { label: "Encerrada", variant: "outline" },
  expired: { label: "Expirada", variant: "destructive" },
};

export default function JobsAdmin() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: jobs, isLoading } = useAdminJobs(statusFilter === 'all' ? undefined : statusFilter);
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const filteredJobs = jobs?.filter(j => 
    !search || 
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFeatured = async (job: Job) => {
    await updateJob.mutateAsync({ id: job.id, is_featured: !job.is_featured });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      await deleteJob.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vagas de Emprego</h1>
        <p className="text-muted-foreground">Gerencie as vagas publicadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {jobs?.filter(j => j.status === 'active').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {jobs?.filter(j => j.is_featured).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Em Destaque</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {jobs?.reduce((sum, j) => sum + j.views_count, 0) || 0}
            </div>
            <p className="text-sm text-muted-foreground">Visualizações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {jobs?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar vagas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="paused">Pausadas</SelectItem>
            <SelectItem value="closed">Encerradas</SelectItem>
            <SelectItem value="expired">Expiradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const jobTypeLabel = JOB_TYPES.find(t => t.value === job.job_type)?.label;
            const statusInfo = STATUS_MAP[job.status] || STATUS_MAP.active;

            return (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Logo */}
                    <div className="shrink-0">
                      {job.company_logo ? (
                        <img
                          src={job.company_logo}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium line-clamp-1">{job.title}</h3>
                            {job.is_featured && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.company_name} • {jobTypeLabel} • {job.category}
                          </p>
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(job.created_at), "dd/MM/yy", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {job.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {job.applications_count} candidaturas
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={job.is_featured ? "default" : "outline"}
                        onClick={() => handleToggleFeatured(job)}
                        disabled={updateJob.isPending}
                      >
                        <Star className={`h-4 w-4 ${job.is_featured ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteJob.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma vaga encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
