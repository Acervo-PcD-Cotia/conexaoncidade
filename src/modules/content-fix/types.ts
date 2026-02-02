export interface NewsWithIssue {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  og_image_url: string | null;
  card_image_url: string | null;
  published_at: string | null;
  original_published_at: string | null;
  source: string | null;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  status: string;
  created_at: string;
}

export interface ContentFixStats {
  missingImages: number;
  invalidImages: number;
  futureDates: number;
  missingOriginalDate: number;
  missingSource: number;
  missingCategory: number;
}

export type IssueType = 
  | "missing_image" 
  | "invalid_image" 
  | "future_date" 
  | "missing_original_date"
  | "missing_source"
  | "missing_category";

export interface IssueFilter {
  type: IssueType | "all";
  categoryId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
