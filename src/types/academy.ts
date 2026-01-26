/**
 * Types for Conexão Academy - Netflix-style learning platform
 */

export interface AcademyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademyCourse {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  instructor_name: string | null;
  duration_minutes: number;
  visibility: 'all' | 'partners' | 'admin';
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Relations
  category?: AcademyCategory;
  lessons?: AcademyLesson[];
  lesson_count?: number;
  progress_percent?: number;
}

export interface AcademyExternalLink {
  label: string;
  url: string;
}

export interface AcademyChecklistItem {
  item: string;
  order: number;
}

export interface AcademyLesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content_html: string | null;
  video_embed: string | null;
  external_links: AcademyExternalLink[];
  checklist: AcademyChecklistItem[];
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  course?: AcademyCourse;
  progress?: AcademyProgress;
}

export interface AcademyProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percent: number;
  completed_at: string | null;
  last_watched_at: string;
  created_at: string;
}

export interface AcademyCourseWithProgress extends AcademyCourse {
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  last_watched_lesson?: AcademyLesson;
}

export interface ContinueWatchingItem {
  lesson: AcademyLesson;
  course: AcademyCourse;
  progress: AcademyProgress;
}

// Form types
export interface AcademyCategoryFormData {
  name: string;
  slug: string;
  description?: string;
  cover_url?: string;
  is_active: boolean;
}

export interface AcademyCourseFormData {
  category_id?: string;
  title: string;
  slug: string;
  description?: string;
  cover_url?: string;
  instructor_name?: string;
  duration_minutes: number;
  visibility: 'all' | 'partners' | 'admin';
  is_published: boolean;
}

export interface AcademyLessonFormData {
  course_id: string;
  title: string;
  description?: string;
  content_html?: string;
  video_embed?: string;
  external_links: AcademyExternalLink[];
  duration_minutes: number;
  is_published: boolean;
}
