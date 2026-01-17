import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Building2, Briefcase, DollarSign, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Job, JOB_TYPES, WORK_MODES } from "@/hooks/useJobs";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const jobTypeLabel = JOB_TYPES.find(t => t.value === job.job_type)?.label || job.job_type;
  const workModeLabel = WORK_MODES.find(m => m.value === job.work_mode)?.label || job.work_mode;
  
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

  return (
    <Link to={`/empregos/${job.id}`}>
      <Card className="group hover:shadow-lg transition-shadow relative">
        {job.is_featured && (
          <div className="absolute top-0 right-0">
            <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-white">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destaque
            </Badge>
          </div>
        )}
        
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-4">
            {/* Company Logo */}
            <div className="shrink-0">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-muted-foreground">{job.company_name}</p>
              </div>

              <div className="flex flex-wrap gap-2">
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
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(job.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
