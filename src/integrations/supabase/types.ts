export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          advertiser: string | null
          alt_text: string | null
          click_count: number | null
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          impression_count: number | null
          is_active: boolean | null
          link_target: string | null
          link_url: string | null
          name: string
          size: string
          slot_type: string
          sort_order: number | null
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          advertiser?: string | null
          alt_text?: string | null
          click_count?: number | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url: string
          impression_count?: number | null
          is_active?: boolean | null
          link_target?: string | null
          link_url?: string | null
          name: string
          size: string
          slot_type: string
          sort_order?: number | null
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          advertiser?: string | null
          alt_text?: string | null
          click_count?: number | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          impression_count?: number | null
          is_active?: boolean | null
          link_target?: string | null
          link_url?: string | null
          name?: string
          size?: string
          slot_type?: string
          sort_order?: number | null
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      home_config: {
        Row: {
          block_name: string
          block_type: string | null
          category_id: string | null
          id: string
          is_active: boolean | null
          item_count: number | null
          news_ids: string[] | null
          settings: Json | null
          sort_order: number | null
          tag_id: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          block_name: string
          block_type?: string | null
          category_id?: string | null
          id?: string
          is_active?: boolean | null
          item_count?: number | null
          news_ids?: string[] | null
          settings?: Json | null
          sort_order?: number | null
          tag_id?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          block_name?: string
          block_type?: string | null
          category_id?: string | null
          id?: string
          is_active?: boolean | null
          item_count?: number | null
          news_ids?: string[] | null
          settings?: Json | null
          sort_order?: number | null
          tag_id?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_config_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_config_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          card_image_url: string | null
          category_id: string | null
          content: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          gallery_urls: string[] | null
          hat: string | null
          highlight: Database["public"]["Enums"]["highlight_type"]
          id: string
          image_alt: string | null
          image_credit: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image_url: string | null
          published_at: string | null
          scheduled_at: string | null
          share_count: number
          slug: string
          source: string | null
          status: Database["public"]["Enums"]["news_status"]
          subtitle: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          card_image_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          hat?: string | null
          highlight?: Database["public"]["Enums"]["highlight_type"]
          id?: string
          image_alt?: string | null
          image_credit?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          share_count?: number
          slug: string
          source?: string | null
          status?: Database["public"]["Enums"]["news_status"]
          subtitle?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          card_image_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          hat?: string | null
          highlight?: Database["public"]["Enums"]["highlight_type"]
          id?: string
          image_alt?: string | null
          image_credit?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          share_count?: number
          slug?: string
          source?: string | null
          status?: Database["public"]["Enums"]["news_status"]
          subtitle?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_tags: {
        Row: {
          news_id: string
          tag_id: string
        }
        Insert: {
          news_id: string
          tag_id: string
        }
        Update: {
          news_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_ai_imports: {
        Row: {
          created_at: string | null
          error_message: string | null
          format_corrected: boolean | null
          id: string
          import_type: string | null
          news_id: string | null
          source_badge: string | null
          source_name: string | null
          source_url: string | null
          status: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          format_corrected?: boolean | null
          id?: string
          import_type?: string | null
          news_id?: string | null
          source_badge?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          format_corrected?: boolean | null
          id?: string
          import_type?: string | null
          news_id?: string | null
          source_badge?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_ai_imports_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_ai_schedule_logs: {
        Row: {
          articles_imported: number | null
          created_at: string | null
          errors: string[] | null
          id: string
          schedule_id: string | null
          status: string | null
        }
        Insert: {
          articles_imported?: number | null
          created_at?: string | null
          errors?: string[] | null
          id?: string
          schedule_id?: string | null
          status?: string | null
        }
        Update: {
          articles_imported?: number | null
          created_at?: string | null
          errors?: string[] | null
          id?: string
          schedule_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_ai_schedule_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "noticias_ai_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_ai_schedules: {
        Row: {
          auto_publish: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          interval: string
          is_active: boolean | null
          last_run_at: string | null
          max_articles: number | null
          name: string
          next_run_at: string | null
          source_id: string | null
          updated_at: string | null
          urls: string[]
        }
        Insert: {
          auto_publish?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          interval: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_articles?: number | null
          name: string
          next_run_at?: string | null
          source_id?: string | null
          updated_at?: string | null
          urls: string[]
        }
        Update: {
          auto_publish?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          interval?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_articles?: number | null
          name?: string
          next_run_at?: string | null
          source_id?: string | null
          updated_at?: string | null
          urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "noticias_ai_schedules_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "noticias_ai_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_ai_sources: {
        Row: {
          badge: string
          badge_color: string | null
          created_at: string | null
          domain_pattern: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          parsing_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          badge: string
          badge_color?: string | null
          created_at?: string | null
          domain_pattern: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          parsing_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          badge?: string
          badge_color?: string | null
          created_at?: string | null
          domain_pattern?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          parsing_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      noticias_ai_user_progress: {
        Row: {
          completed_milestones: string[] | null
          created_at: string | null
          id: string
          imports_count: number | null
          level: string | null
          points: number | null
          tour_completed: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_milestones?: string[] | null
          created_at?: string | null
          id?: string
          imports_count?: number | null
          level?: string | null
          points?: number | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_milestones?: string[] | null
          created_at?: string | null
          id?: string
          imports_count?: number | null
          level?: string | null
          points?: number | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          news_id: string | null
          referrer: string | null
          session_id: string
          story_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          news_id?: string | null
          referrer?: string | null
          session_id: string
          story_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          news_id?: string | null
          referrer?: string | null
          session_id?: string
          story_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "web_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_activity_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quick_notes: {
        Row: {
          author_id: string | null
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_notes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      super_banners: {
        Row: {
          alt_text: string | null
          click_count: number
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link_target: string | null
          link_url: string | null
          sort_order: number
          starts_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_target?: string | null
          link_url?: string | null
          sort_order?: number
          starts_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_target?: string | null
          link_url?: string | null
          sort_order?: number
          starts_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_stories: {
        Row: {
          author_id: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["story_status"]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["story_status"]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["story_status"]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      web_story_slides: {
        Row: {
          animation_type: string | null
          background_color: string | null
          background_image_url: string | null
          content_html: string | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          duration_seconds: number | null
          id: string
          sort_order: number
          story_id: string
        }
        Insert: {
          animation_type?: string | null
          background_color?: string | null
          background_image_url?: string | null
          content_html?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          duration_seconds?: number | null
          id?: string
          sort_order?: number
          story_id: string
        }
        Update: {
          animation_type?: string | null
          background_color?: string | null
          background_image_url?: string | null
          content_html?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          duration_seconds?: number | null
          id?: string
          sort_order?: number
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_story_slides_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "web_stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "editor"
        | "columnist"
        | "moderator"
        | "editor_chief"
        | "reporter"
        | "collaborator"
      highlight_type: "none" | "home" | "urgent" | "featured"
      news_status:
        | "draft"
        | "scheduled"
        | "published"
        | "archived"
        | "trash"
        | "review"
        | "approved"
      story_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "editor",
        "columnist",
        "moderator",
        "editor_chief",
        "reporter",
        "collaborator",
      ],
      highlight_type: ["none", "home", "urgent", "featured"],
      news_status: [
        "draft",
        "scheduled",
        "published",
        "archived",
        "trash",
        "review",
        "approved",
      ],
      story_status: ["draft", "published", "archived"],
    },
  },
} as const
