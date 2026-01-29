/**
 * Types for Conexão Academy - ENEM 2026 Module
 * Redação Nota 1000 + IA Corretora + IA Tutor
 */

export interface EnemModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  year: number;
  icon: string;
  cover_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EnemWeek {
  id: string;
  module_id: string;
  week_number: number;
  title: string;
  description: string | null;
  unlock_rule: 'sequential' | 'date' | 'manual';
  unlock_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  lessons?: EnemLesson[];
  progress?: EnemWeeklyProgress;
}

export interface EnemLesson {
  id: string;
  week_id: string;
  type: 'video' | 'texto' | 'exercicio' | 'redacao';
  title: string;
  description: string | null;
  content_html: string | null;
  video_url: string | null;
  video_embed: string | null;
  duration_minutes: number;
  is_mandatory: boolean;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  progress?: EnemProgress;
}

export interface EnemProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface EnemWeeklyProgress {
  id: string;
  user_id: string;
  week_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  lessons_completed: number;
  lessons_total: number;
  unlocked_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// =============================================
// CORREÇÃO DE REDAÇÃO
// =============================================

export interface CompetencyScore {
  score: number; // 0-200
  level: number; // 0-5
  feedback: string;
  errors: string[];
  suggestions: string[];
}

export interface CorrectorFeedback {
  // Análise por competência
  competency1: CompetencyScore; // Norma Padrão
  competency2: CompetencyScore; // Compreensão do Tema
  competency3: CompetencyScore; // Argumentação
  competency4: CompetencyScore; // Coesão e Coerência
  competency5: CompetencyScore; // Proposta de Intervenção
  
  // Diagnóstico geral
  totalScore: number;
  hasFugaTotal: boolean;
  hasFugaParcial: boolean;
  
  // Análise da proposta de intervenção (A.A.M.F.D)
  proposalAnalysis: {
    hasAgent: boolean;
    hasAction: boolean;
    hasMeans: boolean;
    hasPurpose: boolean;
    hasDetail: boolean;
    isGeneric: boolean;
    isInviable: boolean;
    feedback: string;
  };
  
  // Diagnóstico técnico
  diagnosis: {
    level: 'iniciante' | 'intermediário' | 'avançado';
    strongPoint: string;
    weakPoint: string;
    recurringError: string;
  };
  
  // Orientações finais
  whatPreventsPerfectScore: string;
  pointsLostWhere: string[];
}

export interface TutorFeedback {
  // Diagnóstico evolutivo
  evolutionDiagnosis: {
    repeatingErrors: string[];
    resolvedErrors: string[];
    stuckAt: string;
  };
  
  // Foco da semana
  weeklyFocus: {
    mainPoint: string;
    linkedToModule: string;
  };
  
  // Exercício direcionado
  targetedExercise: {
    title: string;
    description: string;
    estimatedTime: string; // "15 minutos"
    focusArea: string;
  };
  
  // Orientação clara
  guidance: {
    toKeep: string[];
    toStop: string[];
    toAdjust: string[];
  };
}

export interface EnemSubmission {
  id: string;
  user_id: string;
  lesson_id: string | null;
  week_id: string | null;
  theme: string;
  content: string;
  word_count: number;
  submitted_at: string;
  
  // Correção
  correction_status: 'pending' | 'correcting' | 'completed' | 'error';
  corrected_at: string | null;
  
  // Notas
  score_c1: number | null;
  score_c2: number | null;
  score_c3: number | null;
  score_c4: number | null;
  score_c5: number | null;
  score_total: number | null;
  
  // Feedback
  feedback_corretora: CorrectorFeedback | null;
  feedback_tutor: TutorFeedback | null;
  
  // Diagnóstico
  diagnosis_level: 'iniciante' | 'intermediário' | 'avançado' | null;
  diagnosis_strong_point: string | null;
  diagnosis_weak_point: string | null;
  diagnosis_recurring_error: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface EnemErrorHistory {
  id: string;
  user_id: string;
  submission_id: string;
  competency: 1 | 2 | 3 | 4 | 5;
  error_type: string;
  error_description: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// =============================================
// FORM DATA
// =============================================

export interface SubmitEssayFormData {
  theme: string;
  content: string;
  lesson_id?: string;
  week_id?: string;
}

// =============================================
// PROGRESS HELPERS
// =============================================

export interface ModuleProgress {
  module: EnemModule;
  totalWeeks: number;
  completedWeeks: number;
  currentWeek: number;
  progressPercent: number;
}

export interface WeekProgress {
  week: EnemWeek;
  totalLessons: number;
  completedLessons: number;
  isUnlocked: boolean;
  progressPercent: number;
}

// =============================================
// STATS
// =============================================

export interface StudentStats {
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  lastSubmissionDate: string | null;
  scoreEvolution: {
    date: string;
    score: number;
  }[];
  competencyAverages: {
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;
  };
  currentLevel: 'iniciante' | 'intermediário' | 'avançado';
}
