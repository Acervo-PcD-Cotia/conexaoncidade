import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { useAuth } from "@/contexts/AuthContext";

export default function JobsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");

  const { data: jobs, isLoading } = useJobs({
    search: search || undefined,
    category: category && category !== 'all' ? category : undefined,
    job_type: jobType && jobType !== 'all' ? jobType : undefined,
    work_mode: workMode && workMode !== 'all' ? workMode : undefined,
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setJobType("");
    setWorkMode("");
  };

  return (
    <>
      <Helmet>
        <title>Vagas de Emprego em Cotia - Conexão na Cidade</title>
        <meta name="description" content="Encontre vagas de emprego na região de Cotia. CLT, PJ, estágio, freelancer e muito mais. Publique sua vaga gratuitamente." />
      </Helmet>

      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vagas de Emprego</h1>
            <p className="text-muted-foreground">
              Encontre oportunidades na região de Cotia
            </p>
          </div>
          
          <Button asChild>
            <Link to={user ? "/empregos/publicar" : "/auth?redirect=/empregos/publicar"}>
              <Plus className="h-4 w-4 mr-2" />
              Publicar Vaga
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <JobFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          jobType={jobType}
          onJobTypeChange={setJobType}
          workMode={workMode}
          onWorkModeChange={setWorkMode}
          onClear={clearFilters}
        />

        {/* Stats */}
        {jobs && jobs.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {jobs.length} vaga{jobs.length !== 1 ? 's' : ''} encontrada{jobs.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-muted-foreground mb-6">
              {search || category || jobType || workMode
                ? "Tente ajustar os filtros para ver mais resultados"
                : "Seja o primeiro a publicar uma vaga!"}
            </p>
            <Button asChild>
              <Link to={user ? "/empregos/publicar" : "/auth?redirect=/empregos/publicar"}>
                <Plus className="h-4 w-4 mr-2" />
                Publicar vaga
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
