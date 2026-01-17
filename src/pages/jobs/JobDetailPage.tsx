import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, MapPin, Clock, Building2, Briefcase, DollarSign,
  Share2, Bookmark, ExternalLink, Mail, Phone, Globe, Star, AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useJobById, JOB_TYPES, WORK_MODES, SALARY_TYPES } from "@/hooks/useJobs";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJobById(id);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container py-16 text-center">
        <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Vaga não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          Esta vaga pode ter sido encerrada ou removida.
        </p>
        <Button asChild>
          <Link to="/empregos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às vagas
          </Link>
        </Button>
      </div>
    );
  }

  const jobTypeLabel = JOB_TYPES.find(t => t.value === job.job_type)?.label || job.job_type;
  const workModeLabel = WORK_MODES.find(m => m.value === job.work_mode)?.label || job.work_mode;
  const salaryTypeLabel = SALARY_TYPES.find(s => s.value === job.salary_type)?.label || job.salary_type;

  const formatSalary = () => {
    if (job.salary_type === 'a_combinar' || (!job.salary_min && !job.salary_max)) {
      return 'A combinar';
    }
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    });

    if (job.salary_min && job.salary_max) {
      return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)}`;
    }
    if (job.salary_min) {
      return `A partir de ${formatter.format(job.salary_min)}`;
    }
    if (job.salary_max) {
      return `Até ${formatter.format(job.salary_max)}`;
    }
    return 'A combinar';
  };

  const shareUrl = window.location.href;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${job.title} - ${job.company_name}`, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>{job.title} - {job.company_name} | Vagas em Cotia</title>
        <meta name="description" content={job.description.slice(0, 160)} />
        <meta property="og:title" content={`${job.title} - ${job.company_name}`} />
        <meta property="og:description" content={job.description.slice(0, 160)} />
      </Helmet>

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/empregos" className="hover:text-primary">
            Vagas
          </Link>
          <span>/</span>
          <Link to={`/empregos?category=${job.category}`} className="hover:text-primary">
            {job.category}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="relative">
              {job.is_featured && (
                <Badge className="absolute top-4 right-4 bg-amber-500">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Destaque
                </Badge>
              )}
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt={job.company_name}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                    <p className="text-lg text-muted-foreground">{job.company_name}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {jobTypeLabel}
                      </Badge>
                      <Badge variant="outline">
                        {workModeLabel}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatSalary()}
                        {job.salary_type !== 'a_combinar' && (
                          <span className="ml-1 opacity-70">/{salaryTypeLabel.toLowerCase()}</span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Publicada {formatDistanceToNow(new Date(job.created_at), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição da Vaga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefícios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{job.benefits}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Candidatar-se</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.application_link && (
                  <Button className="w-full" asChild>
                    <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Candidatar-se
                    </a>
                  </Button>
                )}

                {job.contact_email && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${job.contact_email}?subject=Candidatura: ${job.title}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar currículo
                    </a>
                  </Button>
                )}

                {job.contact_phone && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${job.contact_phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {job.contact_phone}
                    </a>
                  </Button>
                )}

                {job.company_website && (
                  <Button variant="ghost" className="w-full" asChild>
                    <a href={job.company_website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Site da empresa
                    </a>
                  </Button>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                  Vaga válida até {format(new Date(job.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
