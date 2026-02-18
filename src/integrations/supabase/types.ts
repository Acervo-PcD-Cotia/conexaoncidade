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
      academy_categories: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      academy_courses: {
        Row: {
          category_id: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          instructor_name: string | null
          is_published: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lessons: {
        Row: {
          checklist: Json | null
          content_html: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          external_links: Json | null
          id: string
          is_published: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
          video_embed: string | null
        }
        Insert: {
          checklist?: Json | null
          content_html?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          external_links?: Json | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          video_embed?: string | null
        }
        Update: {
          checklist?: Json | null
          content_html?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          external_links?: Json | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          video_embed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_watched_at: string | null
          lesson_id: string
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          lesson_id: string
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          notify_community_reports: boolean | null
          notify_pending_factcheck: boolean | null
          notify_pending_news: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_community_reports?: boolean | null
          notify_pending_factcheck?: boolean | null
          notify_pending_news?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_community_reports?: boolean | null
          notify_pending_factcheck?: boolean | null
          notify_pending_news?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          advertiser: string | null
          alt_text: string | null
          campaign_id: string | null
          click_count: number | null
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          impression_count: number | null
          is_active: boolean | null
          link_target: string | null
          link_url: string | null
          managed_by_campaign: boolean | null
          name: string
          size: string
          slot_type: string
          sort_order: number | null
          starts_at: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          advertiser?: string | null
          alt_text?: string | null
          campaign_id?: string | null
          click_count?: number | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url: string
          impression_count?: number | null
          is_active?: boolean | null
          link_target?: string | null
          link_url?: string | null
          managed_by_campaign?: boolean | null
          name: string
          size: string
          slot_type: string
          sort_order?: number | null
          starts_at?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          advertiser?: string | null
          alt_text?: string | null
          campaign_id?: string | null
          click_count?: number | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          impression_count?: number | null
          is_active?: boolean | null
          link_target?: string | null
          link_url?: string | null
          managed_by_campaign?: boolean | null
          name?: string
          size?: string
          slot_type?: string
          sort_order?: number | null
          starts_at?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      anunciantes: {
        Row: {
          bairros_atuacao: string[] | null
          capa_url: string | null
          cidade_base: string | null
          created_at: string
          creci: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          nome: string
          plano: Database["public"]["Enums"]["anunciante_plano"]
          rating_avg: number | null
          rating_count: number | null
          slug: string
          sobre_html: string | null
          telefone: string | null
          tenant_id: string | null
          tipo: Database["public"]["Enums"]["anunciante_tipo"]
          total_imoveis: number | null
          total_leads: number | null
          updated_at: string
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          bairros_atuacao?: string[] | null
          capa_url?: string | null
          cidade_base?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          nome: string
          plano?: Database["public"]["Enums"]["anunciante_plano"]
          rating_avg?: number | null
          rating_count?: number | null
          slug: string
          sobre_html?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tipo?: Database["public"]["Enums"]["anunciante_tipo"]
          total_imoveis?: number | null
          total_leads?: number | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairros_atuacao?: string[] | null
          capa_url?: string | null
          cidade_base?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          nome?: string
          plano?: Database["public"]["Enums"]["anunciante_plano"]
          rating_avg?: number | null
          rating_count?: number | null
          slug?: string
          sobre_html?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tipo?: Database["public"]["Enums"]["anunciante_tipo"]
          total_imoveis?: number | null
          total_leads?: number | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anunciantes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      article_versions: {
        Row: {
          article_id: string
          content_html: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["article_kind"]
          rewrite_engine: string | null
          rewrite_prompt_hash: string | null
          site_id: string
          style_profile_id: string | null
          style_version_id: string | null
        }
        Insert: {
          article_id: string
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["article_kind"]
          rewrite_engine?: string | null
          rewrite_prompt_hash?: string | null
          site_id: string
          style_profile_id?: string | null
          style_version_id?: string | null
        }
        Update: {
          article_id?: string
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["article_kind"]
          rewrite_engine?: string | null
          rewrite_prompt_hash?: string | null
          site_id?: string
          style_profile_id?: string | null
          style_version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_versions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_name: string | null
          canonical_url: string | null
          category: string | null
          content_html: string | null
          created_at: string
          hero_image_url: string | null
          id: string
          news_id: string | null
          published_at: string | null
          site_id: string
          slug: string
          status: string
          summary: string | null
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          canonical_url?: string | null
          category?: string | null
          content_html?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          news_id?: string | null
          published_at?: string | null
          site_id: string
          slug: string
          status?: string
          summary?: string | null
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          canonical_url?: string | null
          category?: string | null
          content_html?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          news_id?: string | null
          published_at?: string | null
          site_id?: string
          slug?: string
          status?: string
          summary?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_generation_queue: {
        Row: {
          attempts: number | null
          audio_type: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          news_id: string | null
          priority: number | null
          processed_at: string | null
          status: string | null
          tenant_id: string | null
          voice_id: string | null
        }
        Insert: {
          attempts?: number | null
          audio_type?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          news_id?: string | null
          priority?: number | null
          processed_at?: string | null
          status?: string | null
          tenant_id?: string | null
          voice_id?: string | null
        }
        Update: {
          attempts?: number | null
          audio_type?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          news_id?: string | null
          priority?: number | null
          processed_at?: string | null
          status?: string | null
          tenant_id?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_generation_queue_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_generation_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
      autopost_audit_logs: {
        Row: {
          action: string
          action_category: string | null
          actor_email: string | null
          actor_user_id: string | null
          created_at: string | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          action_category?: string | null
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          action_category?: string | null
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_cluster_cities: {
        Row: {
          created_at: string | null
          id: string
          is_central: boolean | null
          name: string
          priority: number | null
          seo_terms: string[] | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_central?: boolean | null
          name: string
          priority?: number | null
          seo_terms?: string[] | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_central?: boolean | null
          name?: string
          priority?: number | null
          seo_terms?: string[] | null
          slug?: string
        }
        Relationships: []
      }
      autopost_ingest_items: {
        Row: {
          applied_rule_ids: string[] | null
          canonical_url: string | null
          content_hash: string
          created_at: string | null
          duplicate_of: string | null
          duplicate_reason: string | null
          id: string
          job_id: string | null
          original_author: string | null
          original_content: string | null
          original_content_clean: string | null
          original_excerpt: string | null
          original_image_url: string | null
          original_images: string[] | null
          original_published_at: string | null
          original_title: string
          original_url: string
          processing_notes: string | null
          similarity_group: string | null
          similarity_score: number | null
          source_id: string
          status: Database["public"]["Enums"]["autopost_item_status"] | null
          tenant_id: string | null
          title_fingerprint: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          applied_rule_ids?: string[] | null
          canonical_url?: string | null
          content_hash: string
          created_at?: string | null
          duplicate_of?: string | null
          duplicate_reason?: string | null
          id?: string
          job_id?: string | null
          original_author?: string | null
          original_content?: string | null
          original_content_clean?: string | null
          original_excerpt?: string | null
          original_image_url?: string | null
          original_images?: string[] | null
          original_published_at?: string | null
          original_title: string
          original_url: string
          processing_notes?: string | null
          similarity_group?: string | null
          similarity_score?: number | null
          source_id: string
          status?: Database["public"]["Enums"]["autopost_item_status"] | null
          tenant_id?: string | null
          title_fingerprint: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          applied_rule_ids?: string[] | null
          canonical_url?: string | null
          content_hash?: string
          created_at?: string | null
          duplicate_of?: string | null
          duplicate_reason?: string | null
          id?: string
          job_id?: string | null
          original_author?: string | null
          original_content?: string | null
          original_content_clean?: string | null
          original_excerpt?: string | null
          original_image_url?: string | null
          original_images?: string[] | null
          original_published_at?: string | null
          original_title?: string
          original_url?: string
          processing_notes?: string | null
          similarity_group?: string | null
          similarity_score?: number | null
          source_id?: string
          status?: Database["public"]["Enums"]["autopost_item_status"] | null
          tenant_id?: string | null
          title_fingerprint?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_ingest_items_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "autopost_ingest_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_ingest_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "autopost_ingest_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_ingest_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "autopost_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_ingest_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_ingest_jobs: {
        Row: {
          created_at: string | null
          ended_at: string | null
          error_message: string | null
          id: string
          items_duplicated: number | null
          items_errored: number | null
          items_found: number | null
          items_new: number | null
          items_processed: number | null
          metadata: Json | null
          source_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["autopost_job_status"] | null
          tenant_id: string | null
          trigger_type: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          items_duplicated?: number | null
          items_errored?: number | null
          items_found?: number | null
          items_new?: number | null
          items_processed?: number | null
          metadata?: Json | null
          source_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["autopost_job_status"] | null
          tenant_id?: string | null
          trigger_type?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          items_duplicated?: number | null
          items_errored?: number | null
          items_found?: number | null
          items_new?: number | null
          items_processed?: number | null
          metadata?: Json | null
          source_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["autopost_job_status"] | null
          tenant_id?: string | null
          trigger_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_ingest_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "autopost_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_ingest_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_media_assets: {
        Row: {
          alt_text: string | null
          aspect_ratio: string | null
          created_at: string | null
          credit: string | null
          file_name: string | null
          file_size: number | null
          height: number | null
          id: string
          ingest_item_id: string | null
          is_hero: boolean | null
          is_valid: boolean | null
          local_path: string | null
          local_url: string | null
          mime_type: string | null
          processing_status: string | null
          rewritten_post_id: string | null
          source_url: string
          tenant_id: string | null
          validation_error: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio?: string | null
          created_at?: string | null
          credit?: string | null
          file_name?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          ingest_item_id?: string | null
          is_hero?: boolean | null
          is_valid?: boolean | null
          local_path?: string | null
          local_url?: string | null
          mime_type?: string | null
          processing_status?: string | null
          rewritten_post_id?: string | null
          source_url: string
          tenant_id?: string | null
          validation_error?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          aspect_ratio?: string | null
          created_at?: string | null
          credit?: string | null
          file_name?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          ingest_item_id?: string | null
          is_hero?: boolean | null
          is_valid?: boolean | null
          local_path?: string | null
          local_url?: string | null
          mime_type?: string | null
          processing_status?: string | null
          rewritten_post_id?: string | null
          source_url?: string
          tenant_id?: string | null
          validation_error?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_media_assets_ingest_item_id_fkey"
            columns: ["ingest_item_id"]
            isOneToOne: false
            referencedRelation: "autopost_ingest_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_media_assets_rewritten_post_id_fkey"
            columns: ["rewritten_post_id"]
            isOneToOne: false
            referencedRelation: "autopost_rewritten_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_media_assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_rewritten_posts: {
        Row: {
          alt_text: string | null
          approved_at: string | null
          approved_by: string | null
          author_name: string | null
          card_image_url: string | null
          category_id: string | null
          cities_mentioned: string[] | null
          content_html: string
          created_at: string | null
          final_title: string
          gallery_urls: string[] | null
          hero_image_url: string | null
          id: string
          image_credit: string | null
          ingest_item_id: string
          internal_links_added: number | null
          og_image_url: string | null
          publish_status:
            | Database["public"]["Enums"]["autopost_publish_status"]
            | null
          published_at: string | null
          published_news_id: string | null
          quality_score: number | null
          readability_score: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          revision_count: number | null
          scheduled_at: string | null
          seo_meta_description: string
          seo_meta_title: string
          seo_score: number | null
          slug: string
          source_credit: string
          source_url: string | null
          summary: string
          tags: string[] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_name?: string | null
          card_image_url?: string | null
          category_id?: string | null
          cities_mentioned?: string[] | null
          content_html: string
          created_at?: string | null
          final_title: string
          gallery_urls?: string[] | null
          hero_image_url?: string | null
          id?: string
          image_credit?: string | null
          ingest_item_id: string
          internal_links_added?: number | null
          og_image_url?: string | null
          publish_status?:
            | Database["public"]["Enums"]["autopost_publish_status"]
            | null
          published_at?: string | null
          published_news_id?: string | null
          quality_score?: number | null
          readability_score?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          revision_count?: number | null
          scheduled_at?: string | null
          seo_meta_description: string
          seo_meta_title: string
          seo_score?: number | null
          slug: string
          source_credit: string
          source_url?: string | null
          summary: string
          tags?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_name?: string | null
          card_image_url?: string | null
          category_id?: string | null
          cities_mentioned?: string[] | null
          content_html?: string
          created_at?: string | null
          final_title?: string
          gallery_urls?: string[] | null
          hero_image_url?: string | null
          id?: string
          image_credit?: string | null
          ingest_item_id?: string
          internal_links_added?: number | null
          og_image_url?: string | null
          publish_status?:
            | Database["public"]["Enums"]["autopost_publish_status"]
            | null
          published_at?: string | null
          published_news_id?: string | null
          quality_score?: number | null
          readability_score?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          revision_count?: number | null
          scheduled_at?: string | null
          seo_meta_description?: string
          seo_meta_title?: string
          seo_score?: number | null
          slug?: string
          source_credit?: string
          source_url?: string | null
          summary?: string
          tags?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_rewritten_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_rewritten_posts_ingest_item_id_fkey"
            columns: ["ingest_item_id"]
            isOneToOne: false
            referencedRelation: "autopost_ingest_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_rewritten_posts_published_news_id_fkey"
            columns: ["published_news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_rewritten_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_rules: {
        Row: {
          action_add_tags: string[] | null
          action_block_publish: boolean | null
          action_generate_seo: boolean | null
          action_internal_links: boolean | null
          action_require_review: boolean | null
          action_rewrite_enabled: boolean | null
          action_set_author: string | null
          action_set_category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          match_category_hint: string | null
          match_exclude_keywords: string[] | null
          match_group_ids: string[] | null
          match_keywords: string[] | null
          match_regex: string | null
          match_source_ids: string[] | null
          name: string
          priority: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_add_tags?: string[] | null
          action_block_publish?: boolean | null
          action_generate_seo?: boolean | null
          action_internal_links?: boolean | null
          action_require_review?: boolean | null
          action_rewrite_enabled?: boolean | null
          action_set_author?: string | null
          action_set_category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          match_category_hint?: string | null
          match_exclude_keywords?: string[] | null
          match_group_ids?: string[] | null
          match_keywords?: string[] | null
          match_regex?: string | null
          match_source_ids?: string[] | null
          name: string
          priority?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_add_tags?: string[] | null
          action_block_publish?: boolean | null
          action_generate_seo?: boolean | null
          action_internal_links?: boolean | null
          action_require_review?: boolean | null
          action_rewrite_enabled?: boolean | null
          action_set_author?: string | null
          action_set_category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          match_category_hint?: string | null
          match_exclude_keywords?: string[] | null
          match_group_ids?: string[] | null
          match_keywords?: string[] | null
          match_regex?: string | null
          match_source_ids?: string[] | null
          name?: string
          priority?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_rules_action_set_category_id_fkey"
            columns: ["action_set_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_scheduled_publishes: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          rewritten_post_id: string
          scheduled_for: string
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          rewritten_post_id: string
          scheduled_for: string
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          rewritten_post_id?: string
          scheduled_for?: string
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_scheduled_publishes_rewritten_post_id_fkey"
            columns: ["rewritten_post_id"]
            isOneToOne: false
            referencedRelation: "autopost_rewritten_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_scheduled_publishes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key: string
          tenant_id: string | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          tenant_id?: string | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "autopost_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_source_groups: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_source_groups_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "autopost_source_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_source_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      autopost_sources: {
        Row: {
          allowed_hours_end: number | null
          allowed_hours_start: number | null
          city: string | null
          crawler_entry_url: string | null
          crawler_selectors: Json | null
          created_at: string | null
          created_by: string | null
          credit_template: string | null
          daily_limit: number | null
          default_author: string | null
          default_category_id: string | null
          default_tags: string[] | null
          error_count: number | null
          feed_url: string | null
          group_id: string | null
          health_score: number | null
          id: string
          import_mode:
            | Database["public"]["Enums"]["autopost_import_mode"]
            | null
          language: string | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          per_run_limit: number | null
          region: string | null
          require_credit: boolean | null
          require_review: boolean | null
          schedule_frequency_minutes: number | null
          site_url: string
          source_type:
            | Database["public"]["Enums"]["autopost_source_type"]
            | null
          status: Database["public"]["Enums"]["autopost_source_status"] | null
          success_count: number | null
          tenant_id: string | null
          total_items_captured: number | null
          total_items_published: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_hours_end?: number | null
          allowed_hours_start?: number | null
          city?: string | null
          crawler_entry_url?: string | null
          crawler_selectors?: Json | null
          created_at?: string | null
          created_by?: string | null
          credit_template?: string | null
          daily_limit?: number | null
          default_author?: string | null
          default_category_id?: string | null
          default_tags?: string[] | null
          error_count?: number | null
          feed_url?: string | null
          group_id?: string | null
          health_score?: number | null
          id?: string
          import_mode?:
            | Database["public"]["Enums"]["autopost_import_mode"]
            | null
          language?: string | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          per_run_limit?: number | null
          region?: string | null
          require_credit?: boolean | null
          require_review?: boolean | null
          schedule_frequency_minutes?: number | null
          site_url: string
          source_type?:
            | Database["public"]["Enums"]["autopost_source_type"]
            | null
          status?: Database["public"]["Enums"]["autopost_source_status"] | null
          success_count?: number | null
          tenant_id?: string | null
          total_items_captured?: number | null
          total_items_published?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_hours_end?: number | null
          allowed_hours_start?: number | null
          city?: string | null
          crawler_entry_url?: string | null
          crawler_selectors?: Json | null
          created_at?: string | null
          created_by?: string | null
          credit_template?: string | null
          daily_limit?: number | null
          default_author?: string | null
          default_category_id?: string | null
          default_tags?: string[] | null
          error_count?: number | null
          feed_url?: string | null
          group_id?: string | null
          health_score?: number | null
          id?: string
          import_mode?:
            | Database["public"]["Enums"]["autopost_import_mode"]
            | null
          language?: string | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          per_run_limit?: number | null
          region?: string | null
          require_credit?: boolean | null
          require_review?: boolean | null
          schedule_frequency_minutes?: number | null
          site_url?: string
          source_type?:
            | Database["public"]["Enums"]["autopost_source_type"]
            | null
          status?: Database["public"]["Enums"]["autopost_source_status"] | null
          success_count?: number | null
          tenant_id?: string | null
          total_items_captured?: number | null
          total_items_published?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autopost_sources_default_category_id_fkey"
            columns: ["default_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_sources_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "autopost_source_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopost_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      bairros_guia: {
        Row: {
          cidade: string
          comercio: string | null
          created_at: string
          descricao_html: string | null
          escolas: string | null
          faixa_preco_aluguel_max: number | null
          faixa_preco_aluguel_min: number | null
          faixa_preco_venda_max: number | null
          faixa_preco_venda_min: number | null
          galeria: string[] | null
          id: string
          imagem_capa: string | null
          infraestrutura: string | null
          is_active: boolean | null
          lat: number | null
          lazer: string | null
          lng: number | null
          mobilidade: string | null
          nome: string
          perfil_publico: string | null
          seguranca: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          cidade: string
          comercio?: string | null
          created_at?: string
          descricao_html?: string | null
          escolas?: string | null
          faixa_preco_aluguel_max?: number | null
          faixa_preco_aluguel_min?: number | null
          faixa_preco_venda_max?: number | null
          faixa_preco_venda_min?: number | null
          galeria?: string[] | null
          id?: string
          imagem_capa?: string | null
          infraestrutura?: string | null
          is_active?: boolean | null
          lat?: number | null
          lazer?: string | null
          lng?: number | null
          mobilidade?: string | null
          nome: string
          perfil_publico?: string | null
          seguranca?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string
          comercio?: string | null
          created_at?: string
          descricao_html?: string | null
          escolas?: string | null
          faixa_preco_aluguel_max?: number | null
          faixa_preco_aluguel_min?: number | null
          faixa_preco_venda_max?: number | null
          faixa_preco_venda_min?: number | null
          galeria?: string[] | null
          id?: string
          imagem_capa?: string | null
          infraestrutura?: string | null
          is_active?: boolean | null
          lat?: number | null
          lazer?: string | null
          lng?: number | null
          mobilidade?: string | null
          nome?: string
          perfil_publico?: string | null
          seguranca?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bairros_guia_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_ab_impressions: {
        Row: {
          banner_id: string | null
          converted: boolean | null
          id: string
          session_id: string | null
          test_id: string | null
          variant: string | null
          viewed_at: string | null
        }
        Insert: {
          banner_id?: string | null
          converted?: boolean | null
          id?: string
          session_id?: string | null
          test_id?: string | null
          variant?: string | null
          viewed_at?: string | null
        }
        Update: {
          banner_id?: string | null
          converted?: boolean | null
          id?: string
          session_id?: string | null
          test_id?: string | null
          variant?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_ab_impressions_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_ab_impressions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "banner_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_ab_tests: {
        Row: {
          banner_a_id: string | null
          banner_b_id: string | null
          confidence_level: number | null
          created_at: string | null
          ends_at: string | null
          id: string
          name: string
          starts_at: string | null
          status: string | null
          traffic_split: number | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          banner_a_id?: string | null
          banner_b_id?: string | null
          confidence_level?: number | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          name: string
          starts_at?: string | null
          status?: string | null
          traffic_split?: number | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          banner_a_id?: string | null
          banner_b_id?: string | null
          confidence_level?: number | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          status?: string | null
          traffic_split?: number | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_ab_tests_banner_a_id_fkey"
            columns: ["banner_a_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_ab_tests_banner_b_id_fkey"
            columns: ["banner_b_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_ab_tests_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_alerts_config: {
        Row: {
          alert_type: string
          banner_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          threshold_ctr: number | null
          threshold_days: number | null
        }
        Insert: {
          alert_type: string
          banner_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          threshold_ctr?: number | null
          threshold_days?: number | null
        }
        Update: {
          alert_type?: string
          banner_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          threshold_ctr?: number | null
          threshold_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_alerts_config_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_alerts_log: {
        Row: {
          alert_type: string
          banner_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
        }
        Insert: {
          alert_type: string
          banner_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
        }
        Update: {
          alert_type?: string
          banner_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_alerts_log_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_campaign_invoices: {
        Row: {
          amount_clicks: number | null
          amount_impressions: number | null
          campaign_id: string
          clicks_count: number | null
          created_at: string | null
          due_date: string | null
          id: string
          impressions_count: number | null
          invoice_period_end: string
          invoice_period_start: string
          paid_at: string | null
          receivable_id: string | null
          sent_at: string | null
          status: string | null
          total_amount: number
        }
        Insert: {
          amount_clicks?: number | null
          amount_impressions?: number | null
          campaign_id: string
          clicks_count?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          impressions_count?: number | null
          invoice_period_end: string
          invoice_period_start: string
          paid_at?: string | null
          receivable_id?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number
        }
        Update: {
          amount_clicks?: number | null
          amount_impressions?: number | null
          campaign_id?: string
          clicks_count?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          impressions_count?: number | null
          invoice_period_end?: string
          invoice_period_start?: string
          paid_at?: string | null
          receivable_id?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "banner_campaign_invoices_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "banner_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_campaign_invoices_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_campaign_spend_log: {
        Row: {
          amount: number
          campaign_id: string
          click_id: string | null
          created_at: string
          event_type: string
          id: string
          impression_id: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          click_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          impression_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          click_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          impression_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_campaign_spend_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "banner_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_campaign_spend_log_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "banner_clicks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_campaign_spend_log_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "banner_impressions"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_campaigns: {
        Row: {
          advertiser_email: string | null
          advertiser_name: string | null
          banner_id: string | null
          billing_type: string
          budget_spent: number
          budget_total: number
          cost_per_click: number | null
          cost_per_impression: number | null
          created_at: string
          daily_reset_at: string | null
          daily_spent: number
          ends_at: string | null
          id: string
          max_daily_spend: number | null
          name: string
          starts_at: string | null
          status: string
          targeting_categories: string[] | null
          targeting_devices: string[] | null
          targeting_locations: string[] | null
          updated_at: string
        }
        Insert: {
          advertiser_email?: string | null
          advertiser_name?: string | null
          banner_id?: string | null
          billing_type?: string
          budget_spent?: number
          budget_total?: number
          cost_per_click?: number | null
          cost_per_impression?: number | null
          created_at?: string
          daily_reset_at?: string | null
          daily_spent?: number
          ends_at?: string | null
          id?: string
          max_daily_spend?: number | null
          name: string
          starts_at?: string | null
          status?: string
          targeting_categories?: string[] | null
          targeting_devices?: string[] | null
          targeting_locations?: string[] | null
          updated_at?: string
        }
        Update: {
          advertiser_email?: string | null
          advertiser_name?: string | null
          banner_id?: string | null
          billing_type?: string
          budget_spent?: number
          budget_total?: number
          cost_per_click?: number | null
          cost_per_impression?: number | null
          created_at?: string
          daily_reset_at?: string | null
          daily_spent?: number
          ends_at?: string | null
          id?: string
          max_daily_spend?: number | null
          name?: string
          starts_at?: string | null
          status?: string
          targeting_categories?: string[] | null
          targeting_devices?: string[] | null
          targeting_locations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_campaigns_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_clicks: {
        Row: {
          banner_height: number | null
          banner_id: string | null
          banner_width: number | null
          city: string | null
          click_x: number | null
          click_y: number | null
          clicked_at: string | null
          country_code: string | null
          id: string
          ip_hash: string | null
          referer: string | null
          region_code: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          banner_height?: number | null
          banner_id?: string | null
          banner_width?: number | null
          city?: string | null
          click_x?: number | null
          click_y?: number | null
          clicked_at?: string | null
          country_code?: string | null
          id?: string
          ip_hash?: string | null
          referer?: string | null
          region_code?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          banner_height?: number | null
          banner_id?: string | null
          banner_width?: number | null
          city?: string | null
          click_x?: number | null
          click_y?: number | null
          clicked_at?: string | null
          country_code?: string | null
          id?: string
          ip_hash?: string | null
          referer?: string | null
          region_code?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_clicks_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_geo_rules: {
        Row: {
          banner_id: string
          cities: string[] | null
          country_codes: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          region_codes: string[] | null
          rule_type: string
        }
        Insert: {
          banner_id: string
          cities?: string[] | null
          country_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          region_codes?: string[] | null
          rule_type: string
        }
        Update: {
          banner_id?: string
          cities?: string[] | null
          country_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          region_codes?: string[] | null
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_geo_rules_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_impressions: {
        Row: {
          banner_id: string | null
          city: string | null
          country_code: string | null
          id: string
          ip_hash: string | null
          region_code: string | null
          session_id: string | null
          viewed_at: string | null
        }
        Insert: {
          banner_id?: string | null
          city?: string | null
          country_code?: string | null
          id?: string
          ip_hash?: string | null
          region_code?: string | null
          session_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          banner_id?: string | null
          city?: string | null
          country_code?: string | null
          id?: string
          ip_hash?: string | null
          region_code?: string | null
          session_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_impressions_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "super_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_client_defaults: {
        Row: {
          client_id: string
          cnae: string
          created_at: string
          id: string
          invoice_text_template: string | null
          iss_rate: number
          service_code: string
          service_description_short: string | null
        }
        Insert: {
          client_id: string
          cnae?: string
          created_at?: string
          id?: string
          invoice_text_template?: string | null
          iss_rate?: number
          service_code?: string
          service_description_short?: string | null
        }
        Update: {
          client_id?: string
          cnae?: string
          created_at?: string
          id?: string
          invoice_text_template?: string | null
          iss_rate?: number
          service_code?: string
          service_description_short?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_client_defaults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "billing_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_clients: {
        Row: {
          address_line: string | null
          city: string | null
          cnpj: string
          created_at: string
          email: string | null
          id: string
          im: string | null
          is_active: boolean
          is_default: boolean
          legal_name: string
          state: string | null
          user_id: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          cnpj: string
          created_at?: string
          email?: string | null
          id?: string
          im?: string | null
          is_active?: boolean
          is_default?: boolean
          legal_name: string
          state?: string | null
          user_id: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          cnpj?: string
          created_at?: string
          email?: string | null
          id?: string
          im?: string | null
          is_active?: boolean
          is_default?: boolean
          legal_name?: string
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      billing_provider_profile: {
        Row: {
          address_line: string | null
          cnpj: string
          created_at: string
          email: string | null
          id: string
          im: string | null
          legal_name: string
          trade_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line?: string | null
          cnpj: string
          created_at?: string
          email?: string | null
          id?: string
          im?: string | null
          legal_name: string
          trade_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string | null
          cnpj?: string
          created_at?: string
          email?: string | null
          id?: string
          im?: string | null
          legal_name?: string
          trade_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bio_buttons: {
        Row: {
          bio_page_id: string
          click_count: number
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          link_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          bio_page_id: string
          click_count?: number
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          link_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          bio_page_id?: string
          click_count?: number
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          link_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "bio_buttons_bio_page_id_fkey"
            columns: ["bio_page_id"]
            isOneToOne: false
            referencedRelation: "bio_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bio_buttons_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      bio_pages: {
        Row: {
          background_color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          owner_id: string | null
          site_id: string | null
          slug: string
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          owner_id?: string | null
          site_id?: string | null
          slug: string
          text_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          owner_id?: string | null
          site_id?: string | null
          slug?: string
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bio_pages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      br_broadcasts: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          streaming: string[] | null
          tv_closed: string[] | null
          tv_open: string[] | null
          updated_at: string | null
          updated_from: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          streaming?: string[] | null
          tv_closed?: string[] | null
          tv_open?: string[] | null
          updated_at?: string | null
          updated_from?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          streaming?: string[] | null
          tv_closed?: string[] | null
          tv_open?: string[] | null
          updated_at?: string | null
          updated_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "br_broadcasts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "football_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      br_fetch_logs: {
        Row: {
          duration_ms: number | null
          fetched_at: string | null
          id: string
          items_processed: number | null
          message: string | null
          source_key: string
          success: boolean
        }
        Insert: {
          duration_ms?: number | null
          fetched_at?: string | null
          id?: string
          items_processed?: number | null
          message?: string | null
          source_key: string
          success: boolean
        }
        Update: {
          duration_ms?: number | null
          fetched_at?: string | null
          id?: string
          items_processed?: number | null
          message?: string | null
          source_key?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "br_fetch_logs_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "br_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      br_generated_news: {
        Row: {
          content: string
          created_at: string | null
          id: string
          news_type: string
          published_at: string | null
          related_match_id: string | null
          related_round: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          news_type: string
          published_at?: string | null
          related_match_id?: string | null
          related_round?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          news_type?: string
          published_at?: string | null
          related_match_id?: string | null
          related_round?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "br_generated_news_related_match_id_fkey"
            columns: ["related_match_id"]
            isOneToOne: false
            referencedRelation: "football_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      br_news_items: {
        Row: {
          author: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string | null
          source_key: string
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          source_key: string
          title: string
          url: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          source_key?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "br_news_items_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "br_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      br_rate_state: {
        Row: {
          circuit_open: boolean | null
          circuit_open_until: string | null
          last_refill: string | null
          source_key: string
          tokens: number | null
        }
        Insert: {
          circuit_open?: boolean | null
          circuit_open_until?: string | null
          last_refill?: string | null
          source_key: string
          tokens?: number | null
        }
        Update: {
          circuit_open?: boolean | null
          circuit_open_until?: string | null
          last_refill?: string | null
          source_key?: string
          tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "br_rate_state_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: true
            referencedRelation: "br_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      br_sources: {
        Row: {
          created_at: string | null
          error_count: number | null
          is_enabled: boolean | null
          key: string
          kind: string
          last_error: string | null
          last_etag: string | null
          last_modified: string | null
          last_success_at: string | null
          name: string
          scrape_interval_minutes: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          is_enabled?: boolean | null
          key: string
          kind: string
          last_error?: string | null
          last_etag?: string | null
          last_modified?: string | null
          last_success_at?: string | null
          name: string
          scrape_interval_minutes?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          is_enabled?: boolean | null
          key?: string
          kind?: string
          last_error?: string | null
          last_etag?: string | null
          last_modified?: string | null
          last_success_at?: string | null
          name?: string
          scrape_interval_minutes?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      broadcast_analytics: {
        Row: {
          broadcast_id: string | null
          city: string | null
          country_code: string | null
          device_type: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          platform: string | null
          region_code: string | null
          session_id: string | null
          user_id: string | null
          watch_duration_seconds: number | null
        }
        Insert: {
          broadcast_id?: string | null
          city?: string | null
          country_code?: string | null
          device_type?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          platform?: string | null
          region_code?: string | null
          session_id?: string | null
          user_id?: string | null
          watch_duration_seconds?: number | null
        }
        Update: {
          broadcast_id?: string | null
          city?: string | null
          country_code?: string | null
          device_type?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          platform?: string | null
          region_code?: string | null
          session_id?: string | null
          user_id?: string | null
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_analytics_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_autodj_settings: {
        Row: {
          channel_id: string | null
          created_at: string | null
          crossfade_seconds: number | null
          fallback_enabled: boolean | null
          id: string
          is_enabled: boolean | null
          shuffle_mode: boolean | null
          updated_at: string | null
          volume_level: number | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          crossfade_seconds?: number | null
          fallback_enabled?: boolean | null
          id?: string
          is_enabled?: boolean | null
          shuffle_mode?: boolean | null
          updated_at?: string | null
          volume_level?: number | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          crossfade_seconds?: number | null
          fallback_enabled?: boolean | null
          id?: string
          is_enabled?: boolean | null
          shuffle_mode?: boolean | null
          updated_at?: string | null
          volume_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_autodj_settings_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_channels: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          tenant_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          tenant_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_chat_messages: {
        Row: {
          broadcast_id: string | null
          created_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean | null
          is_pinned: boolean | null
          message: string
          user_avatar_url: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          broadcast_id?: string | null
          created_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          message: string
          user_avatar_url?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          broadcast_id?: string | null
          created_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          message?: string
          user_avatar_url?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_chat_messages_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_hosts: {
        Row: {
          channel_id: string | null
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_hosts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_participants: {
        Row: {
          avatar_url: string | null
          broadcast_id: string | null
          can_publish: boolean | null
          can_subscribe: boolean | null
          created_at: string | null
          display_name: string
          id: string
          invite_expires_at: string | null
          invite_token: string | null
          is_camera_on: boolean | null
          is_highlighted: boolean | null
          is_mic_on: boolean | null
          is_screen_sharing: boolean | null
          joined_at: string | null
          left_at: string | null
          role: string
          title_label: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          broadcast_id?: string | null
          can_publish?: boolean | null
          can_subscribe?: boolean | null
          created_at?: string | null
          display_name: string
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          is_camera_on?: boolean | null
          is_highlighted?: boolean | null
          is_mic_on?: boolean | null
          is_screen_sharing?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role: string
          title_label?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          broadcast_id?: string | null
          can_publish?: boolean | null
          can_subscribe?: boolean | null
          created_at?: string | null
          display_name?: string
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          is_camera_on?: boolean | null
          is_highlighted?: boolean | null
          is_mic_on?: boolean | null
          is_screen_sharing?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role?: string
          title_label?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_participants_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_playlist_items: {
        Row: {
          artist: string | null
          audio_url: string
          bpm: number | null
          channel_id: string | null
          cover_image_url: string | null
          created_at: string | null
          duration_seconds: number | null
          genre: string | null
          id: string
          is_active: boolean | null
          last_played_at: string | null
          played_count: number | null
          sort_order: number | null
          title: string
        }
        Insert: {
          artist?: string | null
          audio_url: string
          bpm?: number | null
          channel_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          last_played_at?: string | null
          played_count?: number | null
          sort_order?: number | null
          title: string
        }
        Update: {
          artist?: string | null
          audio_url?: string
          bpm?: number | null
          channel_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          last_played_at?: string | null
          played_count?: number | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_playlist_items_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_programs: {
        Row: {
          category: string | null
          channel_id: string | null
          cover_image_url: string | null
          created_at: string | null
          default_day_of_week: number | null
          default_duration_minutes: number | null
          default_start_time: string | null
          description: string | null
          host_name: string | null
          host_user_id: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          channel_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          default_day_of_week?: number | null
          default_duration_minutes?: number | null
          default_start_time?: string | null
          description?: string | null
          host_name?: string | null
          host_user_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          channel_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          default_day_of_week?: number | null
          default_duration_minutes?: number | null
          default_start_time?: string | null
          description?: string | null
          host_name?: string | null
          host_user_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_programs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_programs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_schedule: {
        Row: {
          channel_id: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          fallback_content_type: string | null
          fallback_content_url: string | null
          id: string
          is_live: boolean | null
          is_recurring: boolean | null
          program_id: string | null
          start_time: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          fallback_content_type?: string | null
          fallback_content_url?: string | null
          id?: string
          is_live?: boolean | null
          is_recurring?: boolean | null
          program_id?: string | null
          start_time: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          fallback_content_type?: string | null
          fallback_content_url?: string | null
          id?: string
          is_live?: boolean | null
          is_recurring?: boolean | null
          program_id?: string | null
          start_time?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_schedule_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_schedule_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "broadcast_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_schedule_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_transcripts: {
        Row: {
          broadcast_id: string | null
          created_at: string | null
          id: string
          is_final: boolean | null
          language: string | null
          speaker_id: string | null
          speaker_name: string | null
          text: string
          timestamp_ms: number
        }
        Insert: {
          broadcast_id?: string | null
          created_at?: string | null
          id?: string
          is_final?: boolean | null
          language?: string | null
          speaker_id?: string | null
          speaker_name?: string | null
          text: string
          timestamp_ms: number
        }
        Update: {
          broadcast_id?: string | null
          created_at?: string | null
          id?: string
          is_final?: boolean | null
          language?: string | null
          speaker_id?: string | null
          speaker_name?: string | null
          text?: string
          timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_transcripts_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_transcripts_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "broadcast_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_video_items: {
        Row: {
          channel_id: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string
          video_url: string
          youtube_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type: string
          video_url: string
          youtube_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string
          video_url?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_video_items_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          allow_chat: boolean | null
          category_id: string | null
          channel_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          has_captions: boolean | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          livekit_room_id: string | null
          livekit_room_name: string | null
          news_id: string | null
          peak_viewers: number | null
          podcast_url: string | null
          program_id: string | null
          recording_url: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          slug: string
          status: string | null
          tenant_id: string | null
          thumbnail_url: string | null
          title: string
          total_views: number | null
          type: string
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          allow_chat?: boolean | null
          category_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          has_captions?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          livekit_room_id?: string | null
          livekit_room_name?: string | null
          news_id?: string | null
          peak_viewers?: number | null
          podcast_url?: string | null
          program_id?: string | null
          recording_url?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          slug: string
          status?: string | null
          tenant_id?: string | null
          thumbnail_url?: string | null
          title: string
          total_views?: number | null
          type?: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          allow_chat?: boolean | null
          category_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          has_captions?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          livekit_room_id?: string | null
          livekit_room_name?: string | null
          news_id?: string | null
          peak_viewers?: number | null
          podcast_url?: string | null
          program_id?: string | null
          recording_url?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          slug?: string
          status?: string | null
          tenant_id?: string | null
          thumbnail_url?: string | null
          title?: string
          total_views?: number | null
          type?: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "broadcast_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "broadcast_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      buscas_imoveis_salvas: {
        Row: {
          created_at: string
          filtros: Json
          id: string
          nome: string
          notificar: boolean | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filtros: Json
          id?: string
          nome: string
          notificar?: boolean | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filtros?: Json
          id?: string
          nome?: string
          notificar?: boolean | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buscas_imoveis_salvas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          page_content: string | null
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          tenant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          page_content?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          tenant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          page_content?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      business_clicks: {
        Row: {
          business_id: string
          click_type: string
          created_at: string | null
          id: string
          ip_hash: string | null
          source_page: string | null
          user_agent: string | null
        }
        Insert: {
          business_id: string
          click_type: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          source_page?: string | null
          user_agent?: string | null
        }
        Update: {
          business_id?: string
          click_type?: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          source_page?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_clicks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_faqs: {
        Row: {
          answer: string
          business_id: string
          created_at: string | null
          id: string
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          business_id: string
          created_at?: string | null
          id?: string
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          business_id?: string
          created_at?: string | null
          id?: string
          question?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_faqs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_leads: {
        Row: {
          business_id: string
          contacted_at: string | null
          converted_at: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_contact: string | null
          service_needed: string | null
          source: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          urgency: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string | null
        }
        Insert: {
          business_id: string
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          service_needed?: string | null
          source?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          urgency?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Update: {
          business_id?: string
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          service_needed?: string | null
          source?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          urgency?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_plan_features: {
        Row: {
          feature_key: string
          feature_name: string
          feature_value: string | null
          id: string
          is_enabled: boolean | null
          plan: Database["public"]["Enums"]["business_plan"]
        }
        Insert: {
          feature_key: string
          feature_name: string
          feature_value?: string | null
          id?: string
          is_enabled?: boolean | null
          plan: Database["public"]["Enums"]["business_plan"]
        }
        Update: {
          feature_key?: string
          feature_name?: string
          feature_value?: string | null
          id?: string
          is_enabled?: boolean | null
          plan?: Database["public"]["Enums"]["business_plan"]
        }
        Relationships: []
      }
      business_promotions: {
        Row: {
          business_id: string
          code: string | null
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          starts_at: string | null
          title: string
        }
        Insert: {
          business_id: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          title: string
        }
        Update: {
          business_id?: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          author_email: string | null
          author_name: string | null
          business_id: string
          cons: string[] | null
          content: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_verified_purchase: boolean | null
          pros: string[] | null
          rating: number
          replied_at: string | null
          replied_by: string | null
          reply: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          business_id: string
          cons?: string[] | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          pros?: string[] | null
          rating: number
          replied_at?: string | null
          replied_by?: string | null
          reply?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          business_id?: string
          cons?: string[] | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          pros?: string[] | null
          rating?: number
          replied_at?: string | null
          replied_by?: string | null
          reply?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_services: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_highlighted: boolean | null
          name: string
          price_max: number | null
          price_min: number | null
          price_unit: string | null
          sort_order: number | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_highlighted?: boolean | null
          name: string
          price_max?: number | null
          price_min?: number | null
          price_unit?: string | null
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_highlighted?: boolean | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          price_unit?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          address_complement: string | null
          amenities: string[] | null
          avg_rating: number | null
          categories_secondary: string[] | null
          category_main: string
          cep: string | null
          city: string
          cover_url: string | null
          created_at: string | null
          description_full: string | null
          description_short: string | null
          email: string | null
          facebook: string | null
          featured_until: string | null
          gallery_urls: string[] | null
          google_maps_url: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          leads_count: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          neighborhoods: string[] | null
          opening_hours: Json | null
          payment_methods: string[] | null
          phone: string | null
          phone_clicks: number | null
          plan: Database["public"]["Enums"]["business_plan"] | null
          plan_expires_at: string | null
          review_count: number | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_radius_km: number | null
          slug: string
          state: string | null
          tagline: string | null
          tags: string[] | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          video_url: string | null
          views_count: number | null
          website: string | null
          website_clicks: number | null
          whatsapp: string | null
          whatsapp_clicks: number | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          amenities?: string[] | null
          avg_rating?: number | null
          categories_secondary?: string[] | null
          category_main: string
          cep?: string | null
          city: string
          cover_url?: string | null
          created_at?: string | null
          description_full?: string | null
          description_short?: string | null
          email?: string | null
          facebook?: string | null
          featured_until?: string | null
          gallery_urls?: string[] | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          leads_count?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          neighborhoods?: string[] | null
          opening_hours?: Json | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_clicks?: number | null
          plan?: Database["public"]["Enums"]["business_plan"] | null
          plan_expires_at?: string | null
          review_count?: number | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_radius_km?: number | null
          slug: string
          state?: string | null
          tagline?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          video_url?: string | null
          views_count?: number | null
          website?: string | null
          website_clicks?: number | null
          whatsapp?: string | null
          whatsapp_clicks?: number | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          amenities?: string[] | null
          avg_rating?: number | null
          categories_secondary?: string[] | null
          category_main?: string
          cep?: string | null
          city?: string
          cover_url?: string | null
          created_at?: string | null
          description_full?: string | null
          description_short?: string | null
          email?: string | null
          facebook?: string | null
          featured_until?: string | null
          gallery_urls?: string[] | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          leads_count?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          neighborhoods?: string[] | null
          opening_hours?: Json | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_clicks?: number | null
          plan?: Database["public"]["Enums"]["business_plan"] | null
          plan_expires_at?: string | null
          review_count?: number | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_radius_km?: number | null
          slug?: string
          state?: string | null
          tagline?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          video_url?: string | null
          views_count?: number | null
          website?: string | null
          website_clicks?: number | null
          whatsapp?: string | null
          whatsapp_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assets: {
        Row: {
          alt_text: string | null
          asset_type: Database["public"]["Enums"]["campaign_asset_type"]
          auto_corrected: boolean | null
          campaign_id: string
          channel_type:
            | Database["public"]["Enums"]["campaign_channel_type"]
            | null
          created_at: string | null
          derived_from: string | null
          file_url: string
          format_key: string | null
          height: number | null
          id: string
          is_original: boolean | null
          upscale_percent: number | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          asset_type: Database["public"]["Enums"]["campaign_asset_type"]
          auto_corrected?: boolean | null
          campaign_id: string
          channel_type?:
            | Database["public"]["Enums"]["campaign_channel_type"]
            | null
          created_at?: string | null
          derived_from?: string | null
          file_url: string
          format_key?: string | null
          height?: number | null
          id?: string
          is_original?: boolean | null
          upscale_percent?: number | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          asset_type?: Database["public"]["Enums"]["campaign_asset_type"]
          auto_corrected?: boolean | null
          campaign_id?: string
          channel_type?:
            | Database["public"]["Enums"]["campaign_channel_type"]
            | null
          created_at?: string | null
          derived_from?: string | null
          file_url?: string
          format_key?: string | null
          height?: number | null
          id?: string
          is_original?: boolean | null
          upscale_percent?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_assets_derived_from_fkey"
            columns: ["derived_from"]
            isOneToOne: false
            referencedRelation: "campaign_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_channels: {
        Row: {
          campaign_id: string
          channel_type: Database["public"]["Enums"]["campaign_channel_type"]
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          channel_type: Database["public"]["Enums"]["campaign_channel_type"]
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          channel_type?: Database["public"]["Enums"]["campaign_channel_type"]
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_channels_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns_unified"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_cycles: {
        Row: {
          active_channels: Json | null
          campaign_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          metrics_summary: Json | null
          name: string
          requires_confirmation: boolean | null
          starts_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          active_channels?: Json | null
          campaign_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          metrics_summary?: Json | null
          name: string
          requires_confirmation?: boolean | null
          starts_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          active_channels?: Json | null
          campaign_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          metrics_summary?: Json | null
          name?: string
          requires_confirmation?: boolean | null
          starts_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_cycles_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns_unified"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_events: {
        Row: {
          campaign_id: string
          channel_type: Database["public"]["Enums"]["campaign_channel_type"]
          created_at: string | null
          cycle_id: string | null
          event_type: Database["public"]["Enums"]["campaign_event_type"]
          id: string
          metadata: Json | null
          session_id: string | null
        }
        Insert: {
          campaign_id: string
          channel_type: Database["public"]["Enums"]["campaign_channel_type"]
          created_at?: string | null
          cycle_id?: string | null
          event_type: Database["public"]["Enums"]["campaign_event_type"]
          id?: string
          metadata?: Json | null
          session_id?: string | null
        }
        Update: {
          campaign_id?: string
          channel_type?: Database["public"]["Enums"]["campaign_channel_type"]
          created_at?: string | null
          cycle_id?: string | null
          event_type?: Database["public"]["Enums"]["campaign_event_type"]
          id?: string
          metadata?: Json | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_events_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "campaign_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_lead_photos: {
        Row: {
          file_name: string | null
          file_size: number | null
          id: string
          lead_id: string
          photo_type: string | null
          photo_url: string
          uploaded_at: string | null
        }
        Insert: {
          file_name?: string | null
          file_size?: number | null
          id?: string
          lead_id: string
          photo_type?: string | null
          photo_url: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string | null
          file_size?: number | null
          id?: string
          lead_id?: string
          photo_type?: string | null
          photo_url?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_lead_photos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "campaign_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_leads: {
        Row: {
          address: string
          authorized_corrections: boolean | null
          authorized_local_guide: boolean | null
          authorized_photos: boolean | null
          authorized_review: boolean | null
          business_category: string
          business_description: string | null
          business_name: string
          city: string | null
          consent_community: boolean | null
          consent_google_maps: boolean | null
          consent_portal: boolean | null
          correct_hours: string | null
          created_at: string | null
          email: string
          estimated_points: number | null
          goals: string[] | null
          google_maps_link: string | null
          has_google_maps: string | null
          has_photos: string | null
          id: string
          neighborhood: string | null
          notes: string | null
          priority: string | null
          processed_at: string | null
          processed_by: string | null
          quiz_responses: Json | null
          quiz_score: number | null
          responds_reviews: string | null
          state: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          wants_community: string | null
          whatsapp: string
          zip_code: string | null
        }
        Insert: {
          address: string
          authorized_corrections?: boolean | null
          authorized_local_guide?: boolean | null
          authorized_photos?: boolean | null
          authorized_review?: boolean | null
          business_category: string
          business_description?: string | null
          business_name: string
          city?: string | null
          consent_community?: boolean | null
          consent_google_maps?: boolean | null
          consent_portal?: boolean | null
          correct_hours?: string | null
          created_at?: string | null
          email: string
          estimated_points?: number | null
          goals?: string[] | null
          google_maps_link?: string | null
          has_google_maps?: string | null
          has_photos?: string | null
          id?: string
          neighborhood?: string | null
          notes?: string | null
          priority?: string | null
          processed_at?: string | null
          processed_by?: string | null
          quiz_responses?: Json | null
          quiz_score?: number | null
          responds_reviews?: string | null
          state?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          wants_community?: string | null
          whatsapp: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          authorized_corrections?: boolean | null
          authorized_local_guide?: boolean | null
          authorized_photos?: boolean | null
          authorized_review?: boolean | null
          business_category?: string
          business_description?: string | null
          business_name?: string
          city?: string | null
          consent_community?: boolean | null
          consent_google_maps?: boolean | null
          consent_portal?: boolean | null
          correct_hours?: string | null
          created_at?: string | null
          email?: string
          estimated_points?: number | null
          goals?: string[] | null
          google_maps_link?: string | null
          has_google_maps?: string | null
          has_photos?: string | null
          id?: string
          neighborhood?: string | null
          notes?: string | null
          priority?: string | null
          processed_at?: string | null
          processed_by?: string | null
          quiz_responses?: Json | null
          quiz_score?: number | null
          responds_reviews?: string | null
          state?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          wants_community?: string | null
          whatsapp?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_analytics: {
        Row: {
          avg_time: string | null
          bounce_rate: number | null
          campaign_proof_id: string
          entrances: number | null
          new_users: number | null
          notes: string | null
          pageviews: number | null
          sessions: number | null
          show_on_pdf: boolean
          unique_pageviews: number | null
          updated_at: string
          users: number | null
        }
        Insert: {
          avg_time?: string | null
          bounce_rate?: number | null
          campaign_proof_id: string
          entrances?: number | null
          new_users?: number | null
          notes?: string | null
          pageviews?: number | null
          sessions?: number | null
          show_on_pdf?: boolean
          unique_pageviews?: number | null
          updated_at?: string
          users?: number | null
        }
        Update: {
          avg_time?: string | null
          bounce_rate?: number | null
          campaign_proof_id?: string
          entrances?: number | null
          new_users?: number | null
          notes?: string | null
          pageviews?: number | null
          sessions?: number | null
          show_on_pdf?: boolean
          unique_pageviews?: number | null
          updated_at?: string
          users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_analytics_campaign_proof_id_fkey"
            columns: ["campaign_proof_id"]
            isOneToOne: true
            referencedRelation: "campaign_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_assets: {
        Row: {
          asset_type: string
          campaign_proof_id: string
          caption: string | null
          created_at: string
          file_path: string
          file_url: string | null
          id: string
          sort_order: number
        }
        Insert: {
          asset_type: string
          campaign_proof_id: string
          caption?: string | null
          created_at?: string
          file_path: string
          file_url?: string | null
          id?: string
          sort_order?: number
        }
        Update: {
          asset_type?: string
          campaign_proof_id?: string
          caption?: string | null
          created_at?: string
          file_path?: string
          file_url?: string | null
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_assets_campaign_proof_id_fkey"
            columns: ["campaign_proof_id"]
            isOneToOne: false
            referencedRelation: "campaign_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_channels: {
        Row: {
          campaign_proof_id: string
          channel_metric: string | null
          channel_name: string
          channel_value: string | null
          created_at: string
          id: string
          sort_order: number
        }
        Insert: {
          campaign_proof_id: string
          channel_metric?: string | null
          channel_name: string
          channel_value?: string | null
          created_at?: string
          id?: string
          sort_order?: number
        }
        Update: {
          campaign_proof_id?: string
          channel_metric?: string | null
          channel_name?: string
          channel_value?: string | null
          created_at?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_channels_campaign_proof_id_fkey"
            columns: ["campaign_proof_id"]
            isOneToOne: false
            referencedRelation: "campaign_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_documents: {
        Row: {
          campaign_proof_id: string
          created_at: string
          doc_type: string
          file_path: string
          file_size: number | null
          file_url: string | null
          id: string
          version: number
        }
        Insert: {
          campaign_proof_id: string
          created_at?: string
          doc_type: string
          file_path: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          version?: number
        }
        Update: {
          campaign_proof_id?: string
          created_at?: string
          doc_type?: string
          file_path?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_documents_campaign_proof_id_fkey"
            columns: ["campaign_proof_id"]
            isOneToOne: false
            referencedRelation: "campaign_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_invoice_audit: {
        Row: {
          action: string
          created_at: string
          id: string
          invoice_id: string
          meta: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          invoice_id: string
          meta?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          invoice_id?: string
          meta?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_invoice_audit_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "campaign_proof_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_invoice_files: {
        Row: {
          created_at: string
          file_name: string | null
          file_type: string
          file_url: string
          id: string
          invoice_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_type: string
          file_url: string
          id?: string
          invoice_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_type?: string
          file_url?: string
          id?: string
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_invoice_files_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "campaign_proof_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proof_invoices: {
        Row: {
          campaign_proof_id: string | null
          client_id: string
          client_snapshot: Json | null
          cnae: string | null
          created_at: string
          description_final: string
          id: string
          iss_rate: number | null
          nf_issue_datetime: string | null
          nf_number: string | null
          nf_pdf_url: string | null
          nf_verification_code: string | null
          pi_number: string
          provider_snapshot: Json | null
          service_code: string | null
          service_description_short: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_proof_id?: string | null
          client_id: string
          client_snapshot?: Json | null
          cnae?: string | null
          created_at?: string
          description_final: string
          id?: string
          iss_rate?: number | null
          nf_issue_datetime?: string | null
          nf_number?: string | null
          nf_pdf_url?: string | null
          nf_verification_code?: string | null
          pi_number: string
          provider_snapshot?: Json | null
          service_code?: string | null
          service_description_short?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_proof_id?: string | null
          client_id?: string
          client_snapshot?: Json | null
          cnae?: string | null
          created_at?: string
          description_final?: string
          id?: string
          iss_rate?: number | null
          nf_issue_datetime?: string | null
          nf_number?: string | null
          nf_pdf_url?: string | null
          nf_verification_code?: string | null
          pi_number?: string
          provider_snapshot?: Json | null
          service_code?: string | null
          service_description_short?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_proof_invoices_campaign_proof_id_fkey"
            columns: ["campaign_proof_id"]
            isOneToOne: false
            referencedRelation: "campaign_proofs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_proof_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "billing_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_proofs: {
        Row: {
          campaign_name: string
          client_name: string
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          insertion_order: string
          internal_code: string | null
          internal_number: string | null
          site_domain: string
          site_name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign_name: string
          client_name: string
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          insertion_order: string
          internal_code?: string | null
          internal_number?: string | null
          site_domain?: string
          site_name?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_name?: string
          client_name?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          insertion_order?: string
          internal_code?: string | null
          internal_number?: string | null
          site_domain?: string
          site_name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          category_id: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          objective: string | null
          owner_id: string | null
          site_id: string | null
          start_date: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          objective?: string | null
          owner_id?: string | null
          site_id?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          objective?: string | null
          owner_id?: string | null
          site_id?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns_unified: {
        Row: {
          advertiser: string
          created_at: string | null
          created_by: string | null
          cta_text: string | null
          cta_url: string | null
          description: string | null
          ends_at: string | null
          frequency_cap_per_day: number | null
          id: string
          login_panel_visible: boolean | null
          name: string
          priority: number | null
          starts_at: string | null
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          advertiser: string
          created_at?: string | null
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          ends_at?: string | null
          frequency_cap_per_day?: number | null
          id?: string
          login_panel_visible?: boolean | null
          name: string
          priority?: number | null
          starts_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          advertiser?: string
          created_at?: string | null
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          ends_at?: string | null
          frequency_cap_per_day?: number | null
          id?: string
          login_panel_visible?: boolean | null
          name?: string
          priority?: number | null
          starts_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_unified_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      censo_pcd_admin_notifications: {
        Row: {
          created_at: string
          id: string
          recipients: string[] | null
          response_id: string | null
          sent_at: string | null
          summary_data: Json | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipients?: string[] | null
          response_id?: string | null
          sent_at?: string | null
          summary_data?: Json | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          recipients?: string[] | null
          response_id?: string | null
          sent_at?: string | null
          summary_data?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "censo_pcd_admin_notifications_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "censo_pcd_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      censo_pcd_responses: {
        Row: {
          apoio_educacional: string | null
          atendimentos_necessarios: string[] | null
          autoriza_contato: boolean
          bairro: string
          beneficio_recebido: string[] | null
          consentimento_lgpd: boolean
          created_at: string
          data_nascimento: string
          ebook_downloaded: boolean | null
          ebook_sent_whatsapp: boolean | null
          em_fila_espera: boolean | null
          email: string | null
          id: string
          local_atendimento: string | null
          maior_necessidade: string
          matriculado_escola: string | null
          necessidades_educacionais: string[] | null
          nivel_suporte_tea: string | null
          nome_completo: string
          possui_laudo: string
          recebe_acompanhamento_medico: boolean
          renda_suficiente: boolean | null
          respondente_tipo: string
          sexo: string
          telefone_whatsapp: string | null
          tipos_deficiencia: string[]
          updated_at: string
        }
        Insert: {
          apoio_educacional?: string | null
          atendimentos_necessarios?: string[] | null
          autoriza_contato: boolean
          bairro: string
          beneficio_recebido?: string[] | null
          consentimento_lgpd?: boolean
          created_at?: string
          data_nascimento: string
          ebook_downloaded?: boolean | null
          ebook_sent_whatsapp?: boolean | null
          em_fila_espera?: boolean | null
          email?: string | null
          id?: string
          local_atendimento?: string | null
          maior_necessidade: string
          matriculado_escola?: string | null
          necessidades_educacionais?: string[] | null
          nivel_suporte_tea?: string | null
          nome_completo: string
          possui_laudo: string
          recebe_acompanhamento_medico: boolean
          renda_suficiente?: boolean | null
          respondente_tipo: string
          sexo: string
          telefone_whatsapp?: string | null
          tipos_deficiencia: string[]
          updated_at?: string
        }
        Update: {
          apoio_educacional?: string | null
          atendimentos_necessarios?: string[] | null
          autoriza_contato?: boolean
          bairro?: string
          beneficio_recebido?: string[] | null
          consentimento_lgpd?: boolean
          created_at?: string
          data_nascimento?: string
          ebook_downloaded?: boolean | null
          ebook_sent_whatsapp?: boolean | null
          em_fila_espera?: boolean | null
          email?: string | null
          id?: string
          local_atendimento?: string | null
          maior_necessidade?: string
          matriculado_escola?: string | null
          necessidades_educacionais?: string[] | null
          nivel_suporte_tea?: string | null
          nome_completo?: string
          possui_laudo?: string
          recebe_acompanhamento_medico?: boolean
          renda_suficiente?: boolean | null
          respondente_tipo?: string
          sexo?: string
          telefone_whatsapp?: string | null
          tipos_deficiencia?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      classified_favorites: {
        Row: {
          classified_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          classified_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          classified_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classified_favorites_classified_id_fkey"
            columns: ["classified_id"]
            isOneToOne: false
            referencedRelation: "classifieds"
            referencedColumns: ["id"]
          },
        ]
      }
      classified_interest_clicks: {
        Row: {
          classified_id: string
          click_type: string
          clicked_at: string
          id: string
          ip_hash: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          classified_id: string
          click_type: string
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          classified_id?: string
          click_type?: string
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classified_interest_clicks_classified_id_fkey"
            columns: ["classified_id"]
            isOneToOne: false
            referencedRelation: "classifieds"
            referencedColumns: ["id"]
          },
        ]
      }
      classifieds: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string | null
          description: string
          email_clicks: number | null
          expires_at: string | null
          favorites_count: number | null
          featured_until: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_negotiable: boolean | null
          location: string | null
          neighborhood: string | null
          phone_clicks: number | null
          price: number | null
          rejection_reason: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          whatsapp_clicks: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description: string
          email_clicks?: number | null
          expires_at?: string | null
          favorites_count?: number | null
          featured_until?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          location?: string | null
          neighborhood?: string | null
          phone_clicks?: number | null
          price?: number | null
          rejection_reason?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          whatsapp_clicks?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string
          email_clicks?: number | null
          expires_at?: string | null
          favorites_count?: number | null
          featured_until?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          location?: string | null
          neighborhood?: string | null
          phone_clicks?: number | null
          price?: number | null
          rejection_reason?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          whatsapp_clicks?: number | null
        }
        Relationships: []
      }
      click_events: {
        Row: {
          bio_button_id: string | null
          browser: string | null
          city: string | null
          clicked_at: string
          country: string | null
          device_type: string | null
          id: string
          ip_hash: string | null
          link_id: string | null
          referer: string | null
          user_agent: string | null
        }
        Insert: {
          bio_button_id?: string | null
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          link_id?: string | null
          referer?: string | null
          user_agent?: string | null
        }
        Update: {
          bio_button_id?: string | null
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          link_id?: string | null
          referer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "click_events_bio_button_id_fkey"
            columns: ["bio_button_id"]
            isOneToOne: false
            referencedRelation: "bio_buttons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenge_progress: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          reward_claimed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          reward_claimed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          reward_claimed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          description: string | null
          end_date: string
          goal_type: string
          goal_value: number
          icon: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          reward_description: string | null
          reward_type: string
          reward_value: string | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          description?: string | null
          end_date: string
          goal_type: string
          goal_value?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_description?: string | null
          reward_type: string
          reward_value?: string | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          goal_type?: string
          goal_value?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_description?: string | null
          reward_type?: string
          reward_value?: string | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          hidden_reason: string | null
          id: string
          is_approved: boolean | null
          is_hidden: boolean | null
          like_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          hidden_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_hidden?: boolean | null
          like_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          hidden_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_hidden?: boolean | null
          like_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          color: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          post_count: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          post_count?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_help_requests: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_urgent: boolean | null
          neighborhood: string | null
          resolved_at: string | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_urgent?: boolean | null
          neighborhood?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_urgent?: boolean | null
          neighborhood?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      community_help_responses: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_help_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "community_help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      community_invites: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          status: string | null
          use_count: number | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          status?: string | null
          use_count?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          status?: string | null
          use_count?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      community_location_favorites: {
        Row: {
          created_at: string | null
          id: string
          location_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_location_favorites_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "community_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_location_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          location_id: string
          photo_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          location_id: string
          photo_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          location_id?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_location_photos_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "community_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_location_reviews: {
        Row: {
          accessibility_rating: number | null
          comment: string | null
          created_at: string | null
          id: string
          location_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accessibility_rating?: number | null
          comment?: string | null
          created_at?: string | null
          id?: string
          location_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accessibility_rating?: number | null
          comment?: string | null
          created_at?: string | null
          id?: string
          location_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_location_reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "community_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_locations: {
        Row: {
          accessibility_features: string[] | null
          address: string | null
          avg_rating: number | null
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_accessible: boolean | null
          is_verified: boolean | null
          lat: number | null
          lng: number | null
          name: string
          neighborhood: string | null
          review_count: number | null
          updated_at: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address?: string | null
          avg_rating?: number | null
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_accessible?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          neighborhood?: string | null
          review_count?: number | null
          updated_at?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string | null
          avg_rating?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_accessible?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          neighborhood?: string | null
          review_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          access_granted_at: string | null
          access_method: string | null
          badges: string[] | null
          bio: string | null
          city: string | null
          created_at: string | null
          fact_check_count: number | null
          id: string
          interests: string[] | null
          invited_by: string | null
          is_suspended: boolean | null
          level: Database["public"]["Enums"]["community_level"] | null
          neighborhood: string | null
          onboarding_completed_at: string | null
          points: number | null
          profile_type: string | null
          quiz_completed: boolean | null
          quiz_completed_at: string | null
          ref_code: string | null
          share_count: number | null
          suspended_reason: string | null
          suspended_until: string | null
          terms_accepted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_granted_at?: string | null
          access_method?: string | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          fact_check_count?: number | null
          id?: string
          interests?: string[] | null
          invited_by?: string | null
          is_suspended?: boolean | null
          level?: Database["public"]["Enums"]["community_level"] | null
          neighborhood?: string | null
          onboarding_completed_at?: string | null
          points?: number | null
          profile_type?: string | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          ref_code?: string | null
          share_count?: number | null
          suspended_reason?: string | null
          suspended_until?: string | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_granted_at?: string | null
          access_method?: string | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          fact_check_count?: number | null
          id?: string
          interests?: string[] | null
          invited_by?: string | null
          is_suspended?: boolean | null
          level?: Database["public"]["Enums"]["community_level"] | null
          neighborhood?: string | null
          onboarding_completed_at?: string | null
          points?: number | null
          profile_type?: string | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          ref_code?: string | null
          share_count?: number | null
          suspended_reason?: string | null
          suspended_until?: string | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      community_penalties: {
        Row: {
          applied_by: string
          created_at: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          lifted_at: string | null
          lifted_by: string | null
          penalty_type: string
          reason: string
          report_id: string | null
          starts_at: string | null
          user_id: string
        }
        Insert: {
          applied_by: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          penalty_type: string
          reason: string
          report_id?: string | null
          starts_at?: string | null
          user_id: string
        }
        Update: {
          applied_by?: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          penalty_type?: string
          reason?: string
          report_id?: string | null
          starts_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_penalties_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "community_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      community_points_history: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          points: number
          reference_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_poll_votes: {
        Row: {
          id: string
          option_ids: string[]
          poll_id: string
          user_id: string
          voted_at: string | null
        }
        Insert: {
          id?: string
          option_ids: string[]
          poll_id: string
          user_id: string
          voted_at?: string | null
        }
        Update: {
          id?: string
          option_ids?: string[]
          poll_id?: string
          user_id?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          is_multiple_choice: boolean | null
          options: Json
          post_id: string
          question: string
          show_results_before_vote: boolean | null
          total_votes: number | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          options?: Json
          post_id: string
          question: string
          show_results_before_vote?: boolean | null
          total_votes?: number | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          options?: Json
          post_id?: string
          question?: string
          show_results_before_vote?: boolean | null
          total_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          category: string | null
          comment_count: number | null
          content: string
          created_at: string | null
          group_id: string | null
          hidden_reason: string | null
          id: string
          is_hidden: boolean | null
          is_official: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          pin_order: number | null
          post_type: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          category?: string | null
          comment_count?: number | null
          content: string
          created_at?: string | null
          group_id?: string | null
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean | null
          is_official?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          pin_order?: number | null
          post_type?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          category?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean | null
          is_official?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          pin_order?: number | null
          post_type?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reading_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          points_awarded: number | null
          scroll_percentage: number | null
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          scroll_percentage?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          scroll_percentage?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          action_taken: string | null
          comment_id: string | null
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          post_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string
          review_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          comment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          post_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          review_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          comment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          post_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          review_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "community_location_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reward_claims: {
        Row: {
          claimed_at: string | null
          id: string
          reward_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          id?: string
          reward_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          id?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "community_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      community_rewards: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          current_claims: number | null
          description: string | null
          id: string
          is_active: boolean | null
          level_required: string | null
          max_claims: number | null
          name: string
          points_required: number
          reward_type: string | null
          valid_until: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          current_claims?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level_required?: string | null
          max_claims?: number | null
          name: string
          points_required?: number
          reward_type?: string | null
          valid_until?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          current_claims?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level_required?: string | null
          max_claims?: number | null
          name?: string
          points_required?: number
          reward_type?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      community_shares: {
        Row: {
          content_id: string
          content_type: string
          id: string
          link_id: string | null
          platform: string
          points_earned: number | null
          shared_at: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          link_id?: string | null
          platform: string
          points_earned?: number | null
          shared_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          link_id?: string | null
          platform?: string
          points_earned?: number | null
          shared_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_shares_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      conexao_ai_automation_logs: {
        Row: {
          automation_id: string | null
          created_at: string | null
          id: string
          result: Json | null
          status: string | null
          trigger_data: Json | null
          user_id: string | null
        }
        Insert: {
          automation_id?: string | null
          created_at?: string | null
          id?: string
          result?: Json | null
          status?: string | null
          trigger_data?: Json | null
          user_id?: string | null
        }
        Update: {
          automation_id?: string | null
          created_at?: string | null
          id?: string
          result?: Json | null
          status?: string | null
          trigger_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conexao_ai_automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "conexao_ai_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      conexao_ai_automations: {
        Row: {
          action_type: string
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          action_type: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conexao_ai_content_drafts: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          published_id: string | null
          status: string | null
          title: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          published_id?: string | null
          status?: string | null
          title?: string | null
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          published_id?: string | null
          status?: string | null
          title?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conexao_ai_conversations: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conexao_ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conexao_ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conexao_ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conexao_ai_tool_usage: {
        Row: {
          created_at: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          tool_id: string
          tool_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          tool_id: string
          tool_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          tool_id?: string
          tool_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      digital_edition_items: {
        Row: {
          created_at: string | null
          edition_id: string
          headline_override: string | null
          id: string
          news_id: string | null
          section: string | null
          sort_order: number | null
          summary_override: string | null
        }
        Insert: {
          created_at?: string | null
          edition_id: string
          headline_override?: string | null
          id?: string
          news_id?: string | null
          section?: string | null
          sort_order?: number | null
          summary_override?: string | null
        }
        Update: {
          created_at?: string | null
          edition_id?: string
          headline_override?: string | null
          id?: string
          news_id?: string | null
          section?: string | null
          sort_order?: number | null
          summary_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_edition_items_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "digital_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_edition_items_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_edition_views: {
        Row: {
          edition_id: string
          id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          edition_id: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          edition_id?: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_edition_views_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "digital_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_editions: {
        Row: {
          acesso_livre_ate: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          pontuacao_minima: number | null
          published_at: string | null
          slug: string
          status: string | null
          tenant_id: string | null
          tipo_acesso: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          acesso_livre_ate?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          pontuacao_minima?: number | null
          published_at?: string | null
          slug: string
          status?: string | null
          tenant_id?: string | null
          tipo_acesso?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          acesso_livre_ate?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          pontuacao_minima?: number | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tenant_id?: string | null
          tipo_acesso?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_editions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_jobs: {
        Row: {
          article_id: string
          attempts: number
          created_at: string
          effective_mode: Database["public"]["Enums"]["delivery_mode"] | null
          error_message: string | null
          id: string
          processed_at: string | null
          requested_mode: Database["public"]["Enums"]["delivery_mode"]
          scheduled_for: string | null
          source_site_id: string
          status: Database["public"]["Enums"]["distribution_status"]
          target_site_id: string
        }
        Insert: {
          article_id: string
          attempts?: number
          created_at?: string
          effective_mode?: Database["public"]["Enums"]["delivery_mode"] | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          requested_mode?: Database["public"]["Enums"]["delivery_mode"]
          scheduled_for?: string | null
          source_site_id: string
          status?: Database["public"]["Enums"]["distribution_status"]
          target_site_id: string
        }
        Update: {
          article_id?: string
          attempts?: number
          created_at?: string
          effective_mode?: Database["public"]["Enums"]["delivery_mode"] | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          requested_mode?: Database["public"]["Enums"]["delivery_mode"]
          scheduled_for?: string | null
          source_site_id?: string
          status?: Database["public"]["Enums"]["distribution_status"]
          target_site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_jobs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_jobs_source_site_id_fkey"
            columns: ["source_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_jobs_target_site_id_fkey"
            columns: ["target_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      enem_error_history: {
        Row: {
          competency: number
          created_at: string | null
          error_description: string | null
          error_type: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          submission_id: string | null
          user_id: string
        }
        Insert: {
          competency: number
          created_at?: string | null
          error_description?: string | null
          error_type: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          submission_id?: string | null
          user_id: string
        }
        Update: {
          competency?: number
          created_at?: string | null
          error_description?: string | null
          error_type?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          submission_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enem_error_history_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "enem_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      enem_lessons: {
        Row: {
          content_html: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          is_published: boolean | null
          sort_order: number | null
          title: string
          type: string
          updated_at: string | null
          video_embed: string | null
          video_url: string | null
          week_id: string
        }
        Insert: {
          content_html?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          is_published?: boolean | null
          sort_order?: number | null
          title: string
          type?: string
          updated_at?: string | null
          video_embed?: string | null
          video_url?: string | null
          week_id: string
        }
        Update: {
          content_html?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          is_published?: boolean | null
          sort_order?: number | null
          title?: string
          type?: string
          updated_at?: string | null
          video_embed?: string | null
          video_url?: string | null
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enem_lessons_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "enem_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      enem_modules: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
          year?: number
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      enem_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          progress_percent: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          progress_percent?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          progress_percent?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enem_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "enem_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      enem_submissions: {
        Row: {
          content: string
          corrected_at: string | null
          correction_status: string | null
          created_at: string | null
          diagnosis_level: string | null
          diagnosis_recurring_error: string | null
          diagnosis_strong_point: string | null
          diagnosis_weak_point: string | null
          feedback_corretora: Json | null
          feedback_tutor: Json | null
          id: string
          lesson_id: string | null
          score_c1: number | null
          score_c2: number | null
          score_c3: number | null
          score_c4: number | null
          score_c5: number | null
          score_total: number | null
          submitted_at: string | null
          theme: string
          updated_at: string | null
          user_id: string
          week_id: string | null
          word_count: number | null
        }
        Insert: {
          content: string
          corrected_at?: string | null
          correction_status?: string | null
          created_at?: string | null
          diagnosis_level?: string | null
          diagnosis_recurring_error?: string | null
          diagnosis_strong_point?: string | null
          diagnosis_weak_point?: string | null
          feedback_corretora?: Json | null
          feedback_tutor?: Json | null
          id?: string
          lesson_id?: string | null
          score_c1?: number | null
          score_c2?: number | null
          score_c3?: number | null
          score_c4?: number | null
          score_c5?: number | null
          score_total?: number | null
          submitted_at?: string | null
          theme: string
          updated_at?: string | null
          user_id: string
          week_id?: string | null
          word_count?: number | null
        }
        Update: {
          content?: string
          corrected_at?: string | null
          correction_status?: string | null
          created_at?: string | null
          diagnosis_level?: string | null
          diagnosis_recurring_error?: string | null
          diagnosis_strong_point?: string | null
          diagnosis_weak_point?: string | null
          feedback_corretora?: Json | null
          feedback_tutor?: Json | null
          id?: string
          lesson_id?: string | null
          score_c1?: number | null
          score_c2?: number | null
          score_c3?: number | null
          score_c4?: number | null
          score_c5?: number | null
          score_total?: number | null
          submitted_at?: string | null
          theme?: string
          updated_at?: string | null
          user_id?: string
          week_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enem_submissions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "enem_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enem_submissions_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "enem_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      enem_weekly_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lessons_completed: number | null
          lessons_total: number | null
          status: string | null
          unlocked_at: string | null
          user_id: string
          week_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lessons_completed?: number | null
          lessons_total?: number | null
          status?: string | null
          unlocked_at?: string | null
          user_id: string
          week_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lessons_completed?: number | null
          lessons_total?: number | null
          status?: string | null
          unlocked_at?: string | null
          user_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enem_weekly_progress_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "enem_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      enem_weeks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          module_id: string
          title: string
          unlock_date: string | null
          unlock_rule: string | null
          updated_at: string | null
          week_number: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_id: string
          title: string
          unlock_date?: string | null
          unlock_rule?: string | null
          updated_at?: string | null
          week_number: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string
          title?: string
          unlock_date?: string | null
          unlock_rule?: string | null
          updated_at?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "enem_weeks_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "enem_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string | null
          document: string | null
          email: string
          event_id: string
          id: string
          name: string
          notes: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_status: string | null
          phone: string | null
          qr_code_url: string | null
          status: string | null
          ticket_code: string | null
          ticket_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          document?: string | null
          email: string
          event_id: string
          id?: string
          name: string
          notes?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          qr_code_url?: string | null
          status?: string | null
          ticket_code?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          document?: string | null
          email?: string
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          qr_code_url?: string | null
          status?: string | null
          ticket_code?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checkins: {
        Row: {
          attendee_id: string
          checked_in_at: string | null
          checked_in_by: string | null
          event_id: string
          id: string
          location: string | null
          notes: string | null
        }
        Insert: {
          attendee_id: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          event_id: string
          id?: string
          location?: string | null
          notes?: string | null
        }
        Update: {
          attendee_id?: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          event_id?: string
          id?: string
          location?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "event_attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string | null
          discount_value: number
          event_id: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type?: string | null
          discount_value: number
          event_id: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number
          event_id?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_coupons_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          quantity: number
          sales_end: string | null
          sales_start: string | null
          sold_count: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          quantity: number
          sales_end?: string | null
          sales_start?: string | null
          sold_count?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          quantity?: number
          sales_end?: string | null
          sales_start?: string | null
          sold_count?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          content_html: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          hero_image_url: string | null
          id: string
          is_free: boolean | null
          is_public: boolean | null
          location: string | null
          location_type: string | null
          max_attendees: number | null
          online_url: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          start_date: string
          status: string | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_html?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          hero_image_url?: string | null
          id?: string
          is_free?: boolean | null
          is_public?: boolean | null
          location?: string | null
          location_type?: string | null
          max_attendees?: number | null
          online_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          start_date: string
          status?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_html?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          hero_image_url?: string | null
          id?: string
          is_free?: boolean | null
          is_public?: boolean | null
          location?: string | null
          location_type?: string | null
          max_attendees?: number | null
          online_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          start_date?: string
          status?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      external_streaming_configs: {
        Row: {
          api_json_url: string | null
          api_xml_url: string | null
          created_at: string | null
          embed_code: string | null
          embed_mode: string | null
          error_count: number | null
          external_panel_url: string | null
          id: string
          is_active: boolean | null
          kind: string
          last_error: string | null
          last_fetched_at: string | null
          last_snapshot: Json | null
          notes: string | null
          player_url: string | null
          public_page_path: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          api_json_url?: string | null
          api_xml_url?: string | null
          created_at?: string | null
          embed_code?: string | null
          embed_mode?: string | null
          error_count?: number | null
          external_panel_url?: string | null
          id?: string
          is_active?: boolean | null
          kind: string
          last_error?: string | null
          last_fetched_at?: string | null
          last_snapshot?: Json | null
          notes?: string | null
          player_url?: string | null
          public_page_path?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          api_json_url?: string | null
          api_xml_url?: string | null
          created_at?: string | null
          embed_code?: string | null
          embed_mode?: string | null
          error_count?: number | null
          external_panel_url?: string | null
          id?: string
          is_active?: boolean | null
          kind?: string
          last_error?: string | null
          last_fetched_at?: string | null
          last_snapshot?: Json | null
          notes?: string | null
          player_url?: string | null
          public_page_path?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_streaming_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_check_claims: {
        Row: {
          claim_text: string
          created_at: string
          fact_check_id: string
          id: string
        }
        Insert: {
          claim_text: string
          created_at?: string
          fact_check_id: string
          id?: string
        }
        Update: {
          claim_text?: string
          created_at?: string
          fact_check_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_check_claims_fact_check_id_fkey"
            columns: ["fact_check_id"]
            isOneToOne: false
            referencedRelation: "fact_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_check_reports: {
        Row: {
          created_at: string
          fact_check_id: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fact_check_id: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fact_check_id?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_check_reports_fact_check_id_fkey"
            columns: ["fact_check_id"]
            isOneToOne: false
            referencedRelation: "fact_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_check_sources: {
        Row: {
          created_at: string
          domain: string
          fact_check_id: string
          id: string
          is_corroborating: boolean | null
          name: string
          published_at: string | null
          reliability_score: number | null
          snippet: string | null
          url: string
        }
        Insert: {
          created_at?: string
          domain: string
          fact_check_id: string
          id?: string
          is_corroborating?: boolean | null
          name: string
          published_at?: string | null
          reliability_score?: number | null
          snippet?: string | null
          url: string
        }
        Update: {
          created_at?: string
          domain?: string
          fact_check_id?: string
          id?: string
          is_corroborating?: boolean | null
          name?: string
          published_at?: string | null
          reliability_score?: number | null
          snippet?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_check_sources_fact_check_id_fkey"
            columns: ["fact_check_id"]
            isOneToOne: false
            referencedRelation: "fact_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_checks: {
        Row: {
          created_at: string
          editor_notes: string | null
          id: string
          image_url: string | null
          input_content: string
          input_type: Database["public"]["Enums"]["fact_check_input_type"]
          is_public: boolean
          limitations: string | null
          methodology: string | null
          opt_in_editorial: boolean
          ref_slug: string | null
          score: number
          share_url: string | null
          status: Database["public"]["Enums"]["fact_check_status"]
          summary: string | null
          tenant_id: string | null
          user_id: string | null
          verdict: Database["public"]["Enums"]["fact_check_verdict"]
        }
        Insert: {
          created_at?: string
          editor_notes?: string | null
          id?: string
          image_url?: string | null
          input_content: string
          input_type: Database["public"]["Enums"]["fact_check_input_type"]
          is_public?: boolean
          limitations?: string | null
          methodology?: string | null
          opt_in_editorial?: boolean
          ref_slug?: string | null
          score?: number
          share_url?: string | null
          status?: Database["public"]["Enums"]["fact_check_status"]
          summary?: string | null
          tenant_id?: string | null
          user_id?: string | null
          verdict?: Database["public"]["Enums"]["fact_check_verdict"]
        }
        Update: {
          created_at?: string
          editor_notes?: string | null
          id?: string
          image_url?: string | null
          input_content?: string
          input_type?: Database["public"]["Enums"]["fact_check_input_type"]
          is_public?: boolean
          limitations?: string | null
          methodology?: string | null
          opt_in_editorial?: boolean
          ref_slug?: string | null
          score?: number
          share_url?: string | null
          status?: Database["public"]["Enums"]["fact_check_status"]
          summary?: string | null
          tenant_id?: string | null
          user_id?: string | null
          verdict?: Database["public"]["Enums"]["fact_check_verdict"]
        }
        Relationships: [
          {
            foreignKeyName: "fact_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      factcheck_settings: {
        Row: {
          clickbait_penalty: number
          consistency_bonus: number
          contradiction_penalty: number
          created_at: string
          default_limitations_text: string | null
          default_methodology_text: string | null
          id: string
          min_sources_to_confirm: number
          multi_source_bonus: number
          no_evidence_penalty: number
          primary_weight: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          clickbait_penalty?: number
          consistency_bonus?: number
          contradiction_penalty?: number
          created_at?: string
          default_limitations_text?: string | null
          default_methodology_text?: string | null
          id?: string
          min_sources_to_confirm?: number
          multi_source_bonus?: number
          no_evidence_penalty?: number
          primary_weight?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          clickbait_penalty?: number
          consistency_bonus?: number
          contradiction_penalty?: number
          created_at?: string
          default_limitations_text?: string | null
          default_methodology_text?: string | null
          id?: string
          min_sources_to_confirm?: number
          multi_source_bonus?: number
          no_evidence_penalty?: number
          primary_weight?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factcheck_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos_imoveis: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_imoveis_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_profiles: {
        Row: {
          address_json: Json | null
          bank_info_json: Json | null
          created_at: string | null
          document_number: string
          document_type: string
          email: string | null
          id: string
          is_verified: boolean | null
          legal_name: string
          phone: string | null
          tenant_id: string | null
          trade_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_json?: Json | null
          bank_info_json?: Json | null
          created_at?: string | null
          document_number: string
          document_type: string
          email?: string | null
          id?: string
          is_verified?: boolean | null
          legal_name: string
          phone?: string | null
          tenant_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_json?: Json | null
          bank_info_json?: Json | null
          created_at?: string | null
          document_number?: string
          document_type?: string
          email?: string | null
          id?: string
          is_verified?: boolean | null
          legal_name?: string
          phone?: string | null
          tenant_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      football_api_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      football_competitions: {
        Row: {
          country: string | null
          created_at: string | null
          external_id: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          season: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          external_id?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          season?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          external_id?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          season?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      football_favorites: {
        Row: {
          created_at: string | null
          id: string
          notifications_enabled: boolean | null
          notify_goals: boolean | null
          notify_match_end: boolean | null
          notify_match_start: boolean | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          notify_goals?: boolean | null
          notify_match_end?: boolean | null
          notify_match_start?: boolean | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          notify_goals?: boolean | null
          notify_match_end?: boolean | null
          notify_match_start?: boolean | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "football_favorites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      football_head_to_head: {
        Row: {
          created_at: string | null
          draws: number | null
          id: string
          last_updated: string | null
          team_a_id: string | null
          team_a_wins: number | null
          team_b_id: string | null
          team_b_wins: number | null
          total_matches: number | null
        }
        Insert: {
          created_at?: string | null
          draws?: number | null
          id?: string
          last_updated?: string | null
          team_a_id?: string | null
          team_a_wins?: number | null
          team_b_id?: string | null
          team_b_wins?: number | null
          total_matches?: number | null
        }
        Update: {
          created_at?: string | null
          draws?: number | null
          id?: string
          last_updated?: string | null
          team_a_id?: string | null
          team_a_wins?: number | null
          team_b_id?: string | null
          team_b_wins?: number | null
          total_matches?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "football_head_to_head_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "football_head_to_head_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      football_match_events: {
        Row: {
          assist_player_name: string | null
          created_at: string | null
          detail: string | null
          event_type: string
          extra_minute: number | null
          id: string
          match_id: string | null
          minute: number | null
          player_name: string | null
          team_id: string | null
        }
        Insert: {
          assist_player_name?: string | null
          created_at?: string | null
          detail?: string | null
          event_type: string
          extra_minute?: number | null
          id?: string
          match_id?: string | null
          minute?: number | null
          player_name?: string | null
          team_id?: string | null
        }
        Update: {
          assist_player_name?: string | null
          created_at?: string | null
          detail?: string | null
          event_type?: string
          extra_minute?: number | null
          id?: string
          match_id?: string | null
          minute?: number | null
          player_name?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "football_match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "football_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "football_match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      football_match_stats: {
        Row: {
          away_corners: number | null
          away_fouls: number | null
          away_offsides: number | null
          away_possession: number | null
          away_red_cards: number | null
          away_saves: number | null
          away_shots: number | null
          away_shots_on_target: number | null
          away_yellow_cards: number | null
          created_at: string | null
          home_corners: number | null
          home_fouls: number | null
          home_offsides: number | null
          home_possession: number | null
          home_red_cards: number | null
          home_saves: number | null
          home_shots: number | null
          home_shots_on_target: number | null
          home_yellow_cards: number | null
          id: string
          match_id: string | null
          updated_at: string | null
        }
        Insert: {
          away_corners?: number | null
          away_fouls?: number | null
          away_offsides?: number | null
          away_possession?: number | null
          away_red_cards?: number | null
          away_saves?: number | null
          away_shots?: number | null
          away_shots_on_target?: number | null
          away_yellow_cards?: number | null
          created_at?: string | null
          home_corners?: number | null
          home_fouls?: number | null
          home_offsides?: number | null
          home_possession?: number | null
          home_red_cards?: number | null
          home_saves?: number | null
          home_shots?: number | null
          home_shots_on_target?: number | null
          home_yellow_cards?: number | null
          id?: string
          match_id?: string | null
          updated_at?: string | null
        }
        Update: {
          away_corners?: number | null
          away_fouls?: number | null
          away_offsides?: number | null
          away_possession?: number | null
          away_red_cards?: number | null
          away_saves?: number | null
          away_shots?: number | null
          away_shots_on_target?: number | null
          away_yellow_cards?: number | null
          created_at?: string | null
          home_corners?: number | null
          home_fouls?: number | null
          home_offsides?: number | null
          home_possession?: number | null
          home_red_cards?: number | null
          home_saves?: number | null
          home_shots?: number | null
          home_shots_on_target?: number | null
          home_yellow_cards?: number | null
          id?: string
          match_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "football_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "football_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      football_matches: {
        Row: {
          away_score: number | null
          away_score_halftime: number | null
          away_team_id: string | null
          city: string | null
          competition_id: string | null
          created_at: string | null
          elapsed_time: number | null
          external_id: number | null
          home_score: number | null
          home_score_halftime: number | null
          home_team_id: string | null
          id: string
          match_date: string
          round: number | null
          round_name: string | null
          season: number
          slug: string | null
          status: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_score_halftime?: number | null
          away_team_id?: string | null
          city?: string | null
          competition_id?: string | null
          created_at?: string | null
          elapsed_time?: number | null
          external_id?: number | null
          home_score?: number | null
          home_score_halftime?: number | null
          home_team_id?: string | null
          id?: string
          match_date: string
          round?: number | null
          round_name?: string | null
          season?: number
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_score_halftime?: number | null
          away_team_id?: string | null
          city?: string | null
          competition_id?: string | null
          created_at?: string | null
          elapsed_time?: number | null
          external_id?: number | null
          home_score?: number | null
          home_score_halftime?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string
          round?: number | null
          round_name?: string | null
          season?: number
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "football_matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "football_matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "football_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "football_matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      football_player_stats: {
        Row: {
          assists: number | null
          competition_id: string | null
          created_at: string | null
          external_id: number | null
          goals: number | null
          id: string
          last_updated: string | null
          matches_played: number | null
          minutes_played: number | null
          nationality: string | null
          player_name: string
          player_photo_url: string | null
          position: string | null
          red_cards: number | null
          season: number
          team_id: string | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          competition_id?: string | null
          created_at?: string | null
          external_id?: number | null
          goals?: number | null
          id?: string
          last_updated?: string | null
          matches_played?: number | null
          minutes_played?: number | null
          nationality?: string | null
          player_name: string
          player_photo_url?: string | null
          position?: string | null
          red_cards?: number | null
          season?: number
          team_id?: string | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          competition_id?: string | null
          created_at?: string | null
          external_id?: number | null
          goals?: number | null
          id?: string
          last_updated?: string | null
          matches_played?: number | null
          minutes_played?: number | null
          nationality?: string | null
          player_name?: string
          player_photo_url?: string | null
          position?: string | null
          red_cards?: number | null
          season?: number
          team_id?: string | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "football_player_stats_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "football_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "football_player_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      football_standings: {
        Row: {
          away_drawn: number | null
          away_goals_against: number | null
          away_goals_for: number | null
          away_lost: number | null
          away_played: number | null
          away_won: number | null
          competition_id: string | null
          created_at: string | null
          drawn: number | null
          form: string | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          home_drawn: number | null
          home_goals_against: number | null
          home_goals_for: number | null
          home_lost: number | null
          home_played: number | null
          home_won: number | null
          id: string
          last_updated: string | null
          lost: number | null
          played: number | null
          points: number | null
          position: number
          season: number
          team_id: string | null
          won: number | null
        }
        Insert: {
          away_drawn?: number | null
          away_goals_against?: number | null
          away_goals_for?: number | null
          away_lost?: number | null
          away_played?: number | null
          away_won?: number | null
          competition_id?: string | null
          created_at?: string | null
          drawn?: number | null
          form?: string | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          home_drawn?: number | null
          home_goals_against?: number | null
          home_goals_for?: number | null
          home_lost?: number | null
          home_played?: number | null
          home_won?: number | null
          id?: string
          last_updated?: string | null
          lost?: number | null
          played?: number | null
          points?: number | null
          position: number
          season?: number
          team_id?: string | null
          won?: number | null
        }
        Update: {
          away_drawn?: number | null
          away_goals_against?: number | null
          away_goals_for?: number | null
          away_lost?: number | null
          away_played?: number | null
          away_won?: number | null
          competition_id?: string | null
          created_at?: string | null
          drawn?: number | null
          form?: string | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          home_drawn?: number | null
          home_goals_against?: number | null
          home_goals_for?: number | null
          home_lost?: number | null
          home_played?: number | null
          home_won?: number | null
          id?: string
          last_updated?: string | null
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number
          season?: number
          team_id?: string | null
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "football_standings_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "football_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "football_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "football_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      football_teams: {
        Row: {
          created_at: string | null
          external_id: number | null
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          short_name: string | null
          slug: string
          stadium_city: string | null
          stadium_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: number | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          short_name?: string | null
          slug: string
          stadium_city?: string | null
          stadium_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: number | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          short_name?: string | null
          slug?: string
          stadium_city?: string | null
          stadium_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guia_seo_pages: {
        Row: {
          category_slug: string | null
          city: string | null
          content_html: string | null
          created_at: string | null
          h1_title: string | null
          id: string
          intro_text: string | null
          is_active: boolean | null
          neighborhood: string | null
          page_type: string
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_type: string | null
          slug: string
          tenant_id: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category_slug?: string | null
          city?: string | null
          content_html?: string | null
          created_at?: string | null
          h1_title?: string | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          neighborhood?: string | null
          page_type: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_type?: string | null
          slug: string
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category_slug?: string | null
          city?: string | null
          content_html?: string | null
          created_at?: string | null
          h1_title?: string | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          neighborhood?: string | null
          page_type?: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_type?: string | null
          slug?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guia_seo_pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
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
      illumina_audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: unknown
          payload_json: Json | null
          team_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          payload_json?: Json | null
          team_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          payload_json?: Json | null
          team_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_branding: {
        Row: {
          backgrounds: Json | null
          created_at: string | null
          fonts_json: Json | null
          id: string
          is_default: boolean | null
          logos: Json | null
          lower_thirds_presets: Json | null
          name: string | null
          overlays: Json | null
          palettes: Json | null
          team_id: string
          tickers_presets: Json | null
          updated_at: string | null
        }
        Insert: {
          backgrounds?: Json | null
          created_at?: string | null
          fonts_json?: Json | null
          id?: string
          is_default?: boolean | null
          logos?: Json | null
          lower_thirds_presets?: Json | null
          name?: string | null
          overlays?: Json | null
          palettes?: Json | null
          team_id: string
          tickers_presets?: Json | null
          updated_at?: string | null
        }
        Update: {
          backgrounds?: Json | null
          created_at?: string | null
          fonts_json?: Json | null
          id?: string
          is_default?: boolean | null
          logos?: Json | null
          lower_thirds_presets?: Json | null
          name?: string | null
          overlays?: Json | null
          palettes?: Json | null
          team_id?: string
          tickers_presets?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_branding_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_chat_messages: {
        Row: {
          created_at: string | null
          deleted_by: string | null
          external_id: string | null
          id: string
          is_deleted: boolean | null
          is_held: boolean | null
          is_pinned: boolean | null
          message: string
          moderation_status: string | null
          platform: string | null
          session_id: string | null
          user_avatar_url: string | null
          user_id: string | null
          user_name: string
          webinar_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_by?: string | null
          external_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_held?: boolean | null
          is_pinned?: boolean | null
          message: string
          moderation_status?: string | null
          platform?: string | null
          session_id?: string | null
          user_avatar_url?: string | null
          user_id?: string | null
          user_name: string
          webinar_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_by?: string | null
          external_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_held?: boolean | null
          is_pinned?: boolean | null
          message?: string
          moderation_status?: string | null
          platform?: string | null
          session_id?: string | null
          user_avatar_url?: string | null
          user_id?: string | null
          user_name?: string
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "illumina_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_chat_messages_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "illumina_webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_clips: {
        Row: {
          created_at: string | null
          created_by: string | null
          duration_seconds: number | null
          focus_position: Json | null
          id: string
          in_point_seconds: number
          metadata_json: Json | null
          out_point_seconds: number
          recording_id: string
          status: string | null
          subtitles_url: string | null
          team_id: string
          thumbnail_url: string | null
          title: string
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          focus_position?: Json | null
          id?: string
          in_point_seconds: number
          metadata_json?: Json | null
          out_point_seconds: number
          recording_id: string
          status?: string | null
          subtitles_url?: string | null
          team_id: string
          thumbnail_url?: string | null
          title: string
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          focus_position?: Json | null
          id?: string
          in_point_seconds?: number
          metadata_json?: Json | null
          out_point_seconds?: number
          recording_id?: string
          status?: string | null
          subtitles_url?: string | null
          team_id?: string
          thumbnail_url?: string | null
          title?: string
          type?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_clips_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "illumina_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_clips_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_destinations: {
        Row: {
          connection_status: string | null
          created_at: string | null
          description: string | null
          id: string
          is_connected: boolean | null
          is_enabled: boolean | null
          last_used_at: string | null
          metadata_json: Json | null
          name: string
          oauth_expires_at: string | null
          oauth_refresh_token_encrypted: string | null
          oauth_tokens_encrypted: string | null
          rtmp_url: string | null
          stream_key_encrypted: string | null
          team_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          connection_status?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_connected?: boolean | null
          is_enabled?: boolean | null
          last_used_at?: string | null
          metadata_json?: Json | null
          name: string
          oauth_expires_at?: string | null
          oauth_refresh_token_encrypted?: string | null
          oauth_tokens_encrypted?: string | null
          rtmp_url?: string | null
          stream_key_encrypted?: string | null
          team_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          connection_status?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_connected?: boolean | null
          is_enabled?: boolean | null
          last_used_at?: string | null
          metadata_json?: Json | null
          name?: string
          oauth_expires_at?: string | null
          oauth_refresh_token_encrypted?: string | null
          oauth_tokens_encrypted?: string | null
          rtmp_url?: string | null
          stream_key_encrypted?: string | null
          team_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_destinations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_recordings: {
        Row: {
          created_at: string | null
          download_count: number | null
          duration_seconds: number | null
          format: string | null
          id: string
          metadata_json: Json | null
          participants_json: Json | null
          resolution: string | null
          session_id: string
          size_bytes: number | null
          status: string | null
          storage_path: string | null
          tags: string[] | null
          team_id: string
          thumbnail_url: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          url_main: string | null
          urls_tracks: Json | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          format?: string | null
          id?: string
          metadata_json?: Json | null
          participants_json?: Json | null
          resolution?: string | null
          session_id: string
          size_bytes?: number | null
          status?: string | null
          storage_path?: string | null
          tags?: string[] | null
          team_id: string
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          url_main?: string | null
          urls_tracks?: Json | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          format?: string | null
          id?: string
          metadata_json?: Json | null
          participants_json?: Json | null
          resolution?: string | null
          session_id?: string
          size_bytes?: number | null
          status?: string | null
          storage_path?: string | null
          tags?: string[] | null
          team_id?: string
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          url_main?: string | null
          urls_tracks?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "illumina_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_recordings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_team_id: string | null
          reward_type: string | null
          reward_value: number | null
          rewarded_at: string | null
          status: string | null
          team_id: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_team_id?: string | null
          reward_type?: string | null
          reward_value?: number | null
          rewarded_at?: string | null
          status?: string | null
          team_id: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_team_id?: string | null
          reward_type?: string | null
          reward_value?: number | null
          rewarded_at?: string | null
          status?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "illumina_referrals_referred_team_id_fkey"
            columns: ["referred_team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_referrals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_scenes: {
        Row: {
          background_color: string | null
          background_type: string | null
          background_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          layout: string | null
          layout_config: Json | null
          lower_thirds: Json | null
          name: string
          overlays: Json | null
          sort_order: number | null
          studio_id: string
          team_id: string
          tickers: Json | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          background_type?: string | null
          background_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout?: string | null
          layout_config?: Json | null
          lower_thirds?: Json | null
          name: string
          overlays?: Json | null
          sort_order?: number | null
          studio_id: string
          team_id: string
          tickers?: Json | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          background_type?: string | null
          background_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout?: string | null
          layout_config?: Json | null
          lower_thirds?: Json | null
          name?: string
          overlays?: Json | null
          sort_order?: number | null
          studio_id?: string
          team_id?: string
          tickers?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_scenes_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "illumina_studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_scenes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_schedules: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          created_by: string | null
          destinations_selected: string[] | null
          end_at: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          run_at: string
          status: string | null
          team_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          created_by?: string | null
          destinations_selected?: string[] | null
          end_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          run_at: string
          status?: string | null
          team_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          destinations_selected?: string[] | null
          end_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          run_at?: string
          status?: string | null
          team_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_schedules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_session_participants: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string
          id: string
          invite_expires_at: string | null
          invite_token: string | null
          is_camera_off: boolean | null
          is_muted: boolean | null
          is_on_stage: boolean | null
          is_screen_sharing: boolean | null
          joined_at: string | null
          left_at: string | null
          lower_third_style: Json | null
          lower_third_text: string | null
          role: string | null
          session_id: string
          status: string | null
          user_id: string | null
          volume_level: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          is_camera_off?: boolean | null
          is_muted?: boolean | null
          is_on_stage?: boolean | null
          is_screen_sharing?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          lower_third_style?: Json | null
          lower_third_text?: string | null
          role?: string | null
          session_id: string
          status?: string | null
          user_id?: string | null
          volume_level?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          is_camera_off?: boolean | null
          is_muted?: boolean | null
          is_on_stage?: boolean | null
          is_screen_sharing?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          lower_third_style?: Json | null
          lower_third_text?: string | null
          role?: string | null
          session_id?: string
          status?: string | null
          user_id?: string | null
          volume_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "illumina_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_sessions: {
        Row: {
          actual_start_at: string | null
          created_at: string | null
          created_by: string | null
          destinations_selected: string[] | null
          end_at: string | null
          id: string
          livekit_room_id: string | null
          livekit_room_name: string | null
          metadata_json: Json | null
          recording_enabled: boolean | null
          recording_type: string | null
          scheduled_start_at: string | null
          session_type: string
          status: string | null
          studio_id: string
          team_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          actual_start_at?: string | null
          created_at?: string | null
          created_by?: string | null
          destinations_selected?: string[] | null
          end_at?: string | null
          id?: string
          livekit_room_id?: string | null
          livekit_room_name?: string | null
          metadata_json?: Json | null
          recording_enabled?: boolean | null
          recording_type?: string | null
          scheduled_start_at?: string | null
          session_type: string
          status?: string | null
          studio_id: string
          team_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_start_at?: string | null
          created_at?: string | null
          created_by?: string | null
          destinations_selected?: string[] | null
          end_at?: string | null
          id?: string
          livekit_room_id?: string | null
          livekit_room_name?: string | null
          metadata_json?: Json | null
          recording_enabled?: boolean | null
          recording_type?: string | null
          scheduled_start_at?: string | null
          session_type?: string
          status?: string | null
          studio_id?: string
          team_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_sessions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "illumina_studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_studios: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          defaults_json: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_participants: number | null
          name: string
          permanent_link: string | null
          slug: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          defaults_json?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_participants?: number | null
          name: string
          permanent_link?: string | null
          slug: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          defaults_json?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_participants?: number | null
          name?: string
          permanent_link?: string | null
          slug?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_studios_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_system_status: {
        Row: {
          component: string
          id: string
          incident_url: string | null
          last_check_at: string | null
          message: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          component: string
          id?: string
          incident_url?: string | null
          last_check_at?: string | null
          message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          component?: string
          id?: string
          incident_url?: string | null
          last_check_at?: string | null
          message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      illumina_team_members: {
        Row: {
          created_at: string | null
          id: string
          invite_expires_at: string | null
          invite_token: string | null
          invited_email: string | null
          role: string | null
          status: string | null
          team_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          invited_email?: string | null
          role?: string | null
          status?: string | null
          team_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_expires_at?: string | null
          invite_token?: string | null
          invited_email?: string | null
          role?: string | null
          status?: string | null
          team_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          plan: string | null
          seats_total: number | null
          seats_used: number | null
          storage_limit_mb: number | null
          storage_used_mb: number | null
          two_factor_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string | null
          seats_total?: number | null
          seats_used?: number | null
          storage_limit_mb?: number | null
          storage_used_mb?: number | null
          two_factor_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string | null
          seats_total?: number | null
          seats_used?: number | null
          storage_limit_mb?: number | null
          storage_used_mb?: number | null
          two_factor_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      illumina_webinar_registrations: {
        Row: {
          access_token: string | null
          attended: boolean | null
          attended_at: string | null
          created_at: string | null
          email: string
          extra_fields_json: Json | null
          id: string
          name: string
          watch_duration_seconds: number | null
          webinar_id: string
        }
        Insert: {
          access_token?: string | null
          attended?: boolean | null
          attended_at?: string | null
          created_at?: string | null
          email: string
          extra_fields_json?: Json | null
          id?: string
          name: string
          watch_duration_seconds?: number | null
          webinar_id: string
        }
        Update: {
          access_token?: string | null
          attended?: boolean | null
          attended_at?: string | null
          created_at?: string | null
          email?: string
          extra_fields_json?: Json | null
          id?: string
          name?: string
          watch_duration_seconds?: number | null
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "illumina_webinar_registrations_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "illumina_webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      illumina_webinars: {
        Row: {
          actual_end_at: string | null
          actual_start_at: string | null
          allow_reactions: boolean | null
          allow_simulcast: boolean | null
          chat_closes_minutes_after: number | null
          chat_opens_minutes_before: number | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          embed_settings_json: Json | null
          id: string
          mode: string | null
          recording_id: string | null
          require_signup: boolean | null
          scheduled_end_at: string | null
          scheduled_start_at: string | null
          signup_fields_json: Json | null
          simulcast_destinations: string[] | null
          slug: string
          status: string | null
          studio_id: string | null
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          allow_reactions?: boolean | null
          allow_simulcast?: boolean | null
          chat_closes_minutes_after?: number | null
          chat_opens_minutes_before?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          embed_settings_json?: Json | null
          id?: string
          mode?: string | null
          recording_id?: string | null
          require_signup?: boolean | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          signup_fields_json?: Json | null
          simulcast_destinations?: string[] | null
          slug: string
          status?: string | null
          studio_id?: string | null
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          allow_reactions?: boolean | null
          allow_simulcast?: boolean | null
          chat_closes_minutes_after?: number | null
          chat_opens_minutes_before?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          embed_settings_json?: Json | null
          id?: string
          mode?: string | null
          recording_id?: string | null
          require_signup?: boolean | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          signup_fields_json?: Json | null
          simulcast_destinations?: string[] | null
          slug?: string
          status?: string | null
          studio_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illumina_webinars_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "illumina_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_webinars_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "illumina_studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "illumina_webinars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "illumina_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      imagens_imovel: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          imovel_id: string
          is_capa: boolean | null
          ordem: number | null
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          imovel_id: string
          is_capa?: boolean | null
          ordem?: number | null
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          imovel_id?: string
          is_capa?: boolean | null
          ordem?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "imagens_imovel_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          aceita_financiamento: boolean | null
          aceita_permuta: boolean | null
          anunciante_id: string | null
          area_construida: number | null
          area_terreno: number | null
          bairro: string
          banheiros: number | null
          cep: string | null
          cidade: string
          codigo: string | null
          complemento: string | null
          condominio_valor: number | null
          created_at: string
          descricao_html: string | null
          destaque: boolean | null
          endereco: string | null
          expires_at: string | null
          external_id: string | null
          external_source: string | null
          favoritos_count: number | null
          features: Json | null
          finalidade: Database["public"]["Enums"]["imovel_finalidade"]
          id: string
          iptu_valor: number | null
          is_condominio: boolean | null
          lancamento: boolean | null
          lat: number | null
          leads_count: number | null
          lng: number | null
          mostrar_endereco_exato: boolean | null
          numero: string | null
          preco: number | null
          preco_anterior: number | null
          preco_m2: number | null
          proximidades: Json | null
          published_at: string | null
          quartos: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["imovel_status"]
          suites: number | null
          tenant_id: string | null
          tipo: Database["public"]["Enums"]["imovel_tipo"]
          titulo: string
          tour_360_url: string | null
          updated_at: string
          vagas: number | null
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          aceita_financiamento?: boolean | null
          aceita_permuta?: boolean | null
          anunciante_id?: string | null
          area_construida?: number | null
          area_terreno?: number | null
          bairro: string
          banheiros?: number | null
          cep?: string | null
          cidade: string
          codigo?: string | null
          complemento?: string | null
          condominio_valor?: number | null
          created_at?: string
          descricao_html?: string | null
          destaque?: boolean | null
          endereco?: string | null
          expires_at?: string | null
          external_id?: string | null
          external_source?: string | null
          favoritos_count?: number | null
          features?: Json | null
          finalidade?: Database["public"]["Enums"]["imovel_finalidade"]
          id?: string
          iptu_valor?: number | null
          is_condominio?: boolean | null
          lancamento?: boolean | null
          lat?: number | null
          leads_count?: number | null
          lng?: number | null
          mostrar_endereco_exato?: boolean | null
          numero?: string | null
          preco?: number | null
          preco_anterior?: number | null
          preco_m2?: number | null
          proximidades?: Json | null
          published_at?: string | null
          quartos?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["imovel_status"]
          suites?: number | null
          tenant_id?: string | null
          tipo?: Database["public"]["Enums"]["imovel_tipo"]
          titulo: string
          tour_360_url?: string | null
          updated_at?: string
          vagas?: number | null
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          aceita_financiamento?: boolean | null
          aceita_permuta?: boolean | null
          anunciante_id?: string | null
          area_construida?: number | null
          area_terreno?: number | null
          bairro?: string
          banheiros?: number | null
          cep?: string | null
          cidade?: string
          codigo?: string | null
          complemento?: string | null
          condominio_valor?: number | null
          created_at?: string
          descricao_html?: string | null
          destaque?: boolean | null
          endereco?: string | null
          expires_at?: string | null
          external_id?: string | null
          external_source?: string | null
          favoritos_count?: number | null
          features?: Json | null
          finalidade?: Database["public"]["Enums"]["imovel_finalidade"]
          id?: string
          iptu_valor?: number | null
          is_condominio?: boolean | null
          lancamento?: boolean | null
          lat?: number | null
          leads_count?: number | null
          lng?: number | null
          mostrar_endereco_exato?: boolean | null
          numero?: string | null
          preco?: number | null
          preco_anterior?: number | null
          preco_m2?: number | null
          proximidades?: Json | null
          published_at?: string | null
          quartos?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["imovel_status"]
          suites?: number | null
          tenant_id?: string | null
          tipo?: Database["public"]["Enums"]["imovel_tipo"]
          titulo?: string
          tour_360_url?: string | null
          updated_at?: string
          vagas?: number | null
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_anunciante_id_fkey"
            columns: ["anunciante_id"]
            isOneToOne: false
            referencedRelation: "anunciantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imoveis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      import_subscriptions: {
        Row: {
          allowed_hours: Json | null
          category_map: Json | null
          created_at: string
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          enabled: boolean
          exclude_categories: string[] | null
          exclude_keywords: string[] | null
          id: string
          import_mode: Database["public"]["Enums"]["import_mode"]
          include_categories: string[] | null
          include_keywords: string[] | null
          max_per_day: number | null
          source_site_id: string
          target_site_id: string
          updated_at: string
        }
        Insert: {
          allowed_hours?: Json | null
          category_map?: Json | null
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          enabled?: boolean
          exclude_categories?: string[] | null
          exclude_keywords?: string[] | null
          id?: string
          import_mode?: Database["public"]["Enums"]["import_mode"]
          include_categories?: string[] | null
          include_keywords?: string[] | null
          max_per_day?: number | null
          source_site_id: string
          target_site_id: string
          updated_at?: string
        }
        Update: {
          allowed_hours?: Json | null
          category_map?: Json | null
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          enabled?: boolean
          exclude_categories?: string[] | null
          exclude_keywords?: string[] | null
          id?: string
          import_mode?: Database["public"]["Enums"]["import_mode"]
          include_categories?: string[] | null
          include_keywords?: string[] | null
          max_per_day?: number | null
          source_site_id?: string
          target_site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_subscriptions_source_site_id_fkey"
            columns: ["source_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_subscriptions_target_site_id_fkey"
            columns: ["target_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_articles: {
        Row: {
          canonical_url: string | null
          created_at: string
          credited_text: string | null
          distribution_job_id: string | null
          id: string
          published_at: string | null
          source_article_id: string
          source_site_id: string
          status: Database["public"]["Enums"]["imported_article_status"]
          target_article_id: string | null
          target_site_id: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          credited_text?: string | null
          distribution_job_id?: string | null
          id?: string
          published_at?: string | null
          source_article_id: string
          source_site_id: string
          status?: Database["public"]["Enums"]["imported_article_status"]
          target_article_id?: string | null
          target_site_id: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          credited_text?: string | null
          distribution_job_id?: string | null
          id?: string
          published_at?: string | null
          source_article_id?: string
          source_site_id?: string
          status?: Database["public"]["Enums"]["imported_article_status"]
          target_article_id?: string | null
          target_site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_articles_distribution_job_id_fkey"
            columns: ["distribution_job_id"]
            isOneToOne: false
            referencedRelation: "distribution_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_articles_source_article_id_fkey"
            columns: ["source_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_articles_source_site_id_fkey"
            columns: ["source_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_articles_target_article_id_fkey"
            columns: ["target_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_articles_target_site_id_fkey"
            columns: ["target_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          invoice_number: string | null
          invoice_type: string | null
          issued_at: string | null
          pdf_url: string | null
          provider_response: Json | null
          receivable_id: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          invoice_number?: string | null
          invoice_type?: string | null
          issued_at?: string | null
          pdf_url?: string | null
          provider_response?: Json | null
          receivable_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          invoice_number?: string | null
          invoice_type?: string | null
          issued_at?: string | null
          pdf_url?: string | null
          provider_response?: Json | null
          receivable_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alert_preferences: {
        Row: {
          categories: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          job_types: string[] | null
          keywords: string | null
          min_salary: number | null
          neighborhoods: string[] | null
          updated_at: string
          user_id: string
          work_modes: string[] | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_types?: string[] | null
          keywords?: string | null
          min_salary?: number | null
          neighborhoods?: string[] | null
          updated_at?: string
          user_id: string
          work_modes?: string[] | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_types?: string[] | null
          keywords?: string | null
          min_salary?: number | null
          neighborhoods?: string[] | null
          updated_at?: string
          user_id?: string
          work_modes?: string[] | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          job_id: string | null
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          job_id?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          job_id?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_saves: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_saves_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_clicks: number | null
          application_link: string | null
          applications_count: number | null
          benefits: string | null
          category: string
          company_logo: string | null
          company_name: string
          company_website: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string
          expires_at: string | null
          featured_until: string | null
          id: string
          is_featured: boolean | null
          job_type: string
          location: string | null
          neighborhood: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          salary_type: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          work_mode: string | null
        }
        Insert: {
          application_clicks?: number | null
          application_link?: string | null
          applications_count?: number | null
          benefits?: string | null
          category: string
          company_logo?: string | null
          company_name: string
          company_website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          job_type: string
          location?: string | null
          neighborhood?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          work_mode?: string | null
        }
        Update: {
          application_clicks?: number | null
          application_link?: string | null
          applications_count?: number | null
          benefits?: string | null
          category?: string
          company_logo?: string | null
          company_name?: string
          company_website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          job_type?: string
          location?: string | null
          neighborhood?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          work_mode?: string | null
        }
        Relationships: []
      }
      journalist_style_profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_refs: number
          max_total_size_mb: number
          name: string
          profile_type: Database["public"]["Enums"]["style_profile_type"]
          site_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_refs?: number
          max_total_size_mb?: number
          name: string
          profile_type?: Database["public"]["Enums"]["style_profile_type"]
          site_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_refs?: number
          max_total_size_mb?: number
          name?: string
          profile_type?: Database["public"]["Enums"]["style_profile_type"]
          site_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journalist_style_profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      journalist_style_refs: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_text: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          kind: Database["public"]["Enums"]["style_ref_kind"]
          mime_type: string | null
          status: Database["public"]["Enums"]["style_ref_status"]
          storage_path: string | null
          style_profile_id: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          kind: Database["public"]["Enums"]["style_ref_kind"]
          mime_type?: string | null
          status?: Database["public"]["Enums"]["style_ref_status"]
          storage_path?: string | null
          style_profile_id: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["style_ref_kind"]
          mime_type?: string | null
          status?: Database["public"]["Enums"]["style_ref_status"]
          storage_path?: string | null
          style_profile_id?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journalist_style_refs_style_profile_id_fkey"
            columns: ["style_profile_id"]
            isOneToOne: false
            referencedRelation: "journalist_style_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journalist_style_versions: {
        Row: {
          created_at: string
          created_by: string | null
          generated_at: string | null
          generated_from_refs: boolean
          id: string
          is_current: boolean
          style_guide_text: string
          style_profile_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          generated_at?: string | null
          generated_from_refs?: boolean
          id?: string
          is_current?: boolean
          style_guide_text: string
          style_profile_id: string
          version_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          generated_at?: string | null
          generated_from_refs?: boolean
          id?: string
          is_current?: boolean
          style_guide_text?: string
          style_profile_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "journalist_style_versions_style_profile_id_fkey"
            columns: ["style_profile_id"]
            isOneToOne: false
            referencedRelation: "journalist_style_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_imoveis: {
        Row: {
          anunciante_id: string | null
          contatado_at: string | null
          created_at: string
          email: string | null
          id: string
          imovel_id: string | null
          intencao: Database["public"]["Enums"]["lead_intencao"] | null
          ip_hash: string | null
          mensagem: string | null
          nome: string
          notas: string | null
          orcamento: number | null
          origem: string | null
          pagina_origem: string | null
          prazo: string | null
          status: Database["public"]["Enums"]["lead_imovel_status"]
          telefone: string | null
          tenant_id: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string | null
        }
        Insert: {
          anunciante_id?: string | null
          contatado_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          imovel_id?: string | null
          intencao?: Database["public"]["Enums"]["lead_intencao"] | null
          ip_hash?: string | null
          mensagem?: string | null
          nome: string
          notas?: string | null
          orcamento?: number | null
          origem?: string | null
          pagina_origem?: string | null
          prazo?: string | null
          status?: Database["public"]["Enums"]["lead_imovel_status"]
          telefone?: string | null
          tenant_id?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Update: {
          anunciante_id?: string | null
          contatado_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          imovel_id?: string | null
          intencao?: Database["public"]["Enums"]["lead_intencao"] | null
          ip_hash?: string | null
          mensagem?: string | null
          nome?: string
          notas?: string | null
          orcamento?: number | null
          origem?: string | null
          pagina_origem?: string | null
          prazo?: string | null
          status?: Database["public"]["Enums"]["lead_imovel_status"]
          telefone?: string | null
          tenant_id?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_imoveis_anunciante_id_fkey"
            columns: ["anunciante_id"]
            isOneToOne: false
            referencedRelation: "anunciantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imoveis_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imoveis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          campaign_id: string | null
          canonical_url: string | null
          channel: string | null
          click_count: number
          created_at: string
          destination_url: string
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          final_url: string | null
          id: string
          owner_id: string | null
          short_url: string | null
          site_id: string | null
          slug: string | null
          status: string
          unique_key: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          campaign_id?: string | null
          canonical_url?: string | null
          channel?: string | null
          click_count?: number
          created_at?: string
          destination_url: string
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          final_url?: string | null
          id?: string
          owner_id?: string | null
          short_url?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string
          unique_key?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          campaign_id?: string | null
          canonical_url?: string | null
          channel?: string | null
          click_count?: number
          created_at?: string
          destination_url?: string
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          final_url?: string | null
          id?: string
          owner_id?: string | null
          short_url?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string
          unique_key?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          is_used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          ai_summary_bullets: string[] | null
          ai_summary_generated_at: string | null
          audio_duration_seconds: number | null
          audio_generated_at: string | null
          audio_status: string | null
          audio_type: string | null
          audio_url: string | null
          audio_voice_id: string | null
          author_id: string | null
          auto_generate_podcast: boolean | null
          auto_generate_webstory: boolean | null
          auto_publish_podcast: boolean | null
          card_image_url: string | null
          category_id: string | null
          content: string | null
          created_at: string
          deleted_at: string | null
          distribute_audio: boolean | null
          editor_id: string | null
          editor_name: string | null
          excerpt: string | null
          featured_image_url: string | null
          gallery_urls: string[] | null
          hat: string | null
          highlight: Database["public"]["Enums"]["highlight_type"]
          id: string
          image_alt: string | null
          image_credit: string | null
          is_featured: boolean | null
          is_home_highlight: boolean | null
          is_indexable: boolean | null
          is_urgent: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image_url: string | null
          origin: Database["public"]["Enums"]["news_origin"] | null
          original_published_at: string | null
          podcast_audio_url: string | null
          podcast_enabled: boolean | null
          podcast_generated_at: string | null
          podcast_status: string | null
          published_at: string | null
          scheduled_at: string | null
          share_count: number
          show_audio_player: boolean | null
          show_summary_button: boolean | null
          slug: string
          social_image_1x1: string | null
          social_image_9x16: string | null
          social_images_generated_at: string | null
          source: string | null
          status: Database["public"]["Enums"]["news_status"]
          subtitle: string | null
          summary_medium: string | null
          summary_short: string | null
          tenant_id: string | null
          title: string
          transcript_text: string | null
          updated_at: string
          updated_at_display: string | null
          view_count: number
        }
        Insert: {
          ai_summary_bullets?: string[] | null
          ai_summary_generated_at?: string | null
          audio_duration_seconds?: number | null
          audio_generated_at?: string | null
          audio_status?: string | null
          audio_type?: string | null
          audio_url?: string | null
          audio_voice_id?: string | null
          author_id?: string | null
          auto_generate_podcast?: boolean | null
          auto_generate_webstory?: boolean | null
          auto_publish_podcast?: boolean | null
          card_image_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          distribute_audio?: boolean | null
          editor_id?: string | null
          editor_name?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          hat?: string | null
          highlight?: Database["public"]["Enums"]["highlight_type"]
          id?: string
          image_alt?: string | null
          image_credit?: string | null
          is_featured?: boolean | null
          is_home_highlight?: boolean | null
          is_indexable?: boolean | null
          is_urgent?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image_url?: string | null
          origin?: Database["public"]["Enums"]["news_origin"] | null
          original_published_at?: string | null
          podcast_audio_url?: string | null
          podcast_enabled?: boolean | null
          podcast_generated_at?: string | null
          podcast_status?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          share_count?: number
          show_audio_player?: boolean | null
          show_summary_button?: boolean | null
          slug: string
          social_image_1x1?: string | null
          social_image_9x16?: string | null
          social_images_generated_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["news_status"]
          subtitle?: string | null
          summary_medium?: string | null
          summary_short?: string | null
          tenant_id?: string | null
          title: string
          transcript_text?: string | null
          updated_at?: string
          updated_at_display?: string | null
          view_count?: number
        }
        Update: {
          ai_summary_bullets?: string[] | null
          ai_summary_generated_at?: string | null
          audio_duration_seconds?: number | null
          audio_generated_at?: string | null
          audio_status?: string | null
          audio_type?: string | null
          audio_url?: string | null
          audio_voice_id?: string | null
          author_id?: string | null
          auto_generate_podcast?: boolean | null
          auto_generate_webstory?: boolean | null
          auto_publish_podcast?: boolean | null
          card_image_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          distribute_audio?: boolean | null
          editor_id?: string | null
          editor_name?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          hat?: string | null
          highlight?: Database["public"]["Enums"]["highlight_type"]
          id?: string
          image_alt?: string | null
          image_credit?: string | null
          is_featured?: boolean | null
          is_home_highlight?: boolean | null
          is_indexable?: boolean | null
          is_urgent?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image_url?: string | null
          origin?: Database["public"]["Enums"]["news_origin"] | null
          original_published_at?: string | null
          podcast_audio_url?: string | null
          podcast_enabled?: boolean | null
          podcast_generated_at?: string | null
          podcast_status?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          share_count?: number
          show_audio_player?: boolean | null
          show_summary_button?: boolean | null
          slug?: string
          social_image_1x1?: string | null
          social_image_9x16?: string | null
          social_images_generated_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["news_status"]
          subtitle?: string | null
          summary_medium?: string | null
          summary_short?: string | null
          tenant_id?: string | null
          title?: string
          transcript_text?: string | null
          updated_at?: string
          updated_at_display?: string | null
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
          {
            foreignKeyName: "news_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      news_audio_analytics: {
        Row: {
          city: string | null
          completed: boolean | null
          country: string | null
          duration_listened_seconds: number | null
          id: string
          listened_at: string | null
          news_id: string | null
          platform: string | null
          referrer: string | null
          tenant_id: string | null
          user_agent: string | null
          user_fingerprint: string | null
        }
        Insert: {
          city?: string | null
          completed?: boolean | null
          country?: string | null
          duration_listened_seconds?: number | null
          id?: string
          listened_at?: string | null
          news_id?: string | null
          platform?: string | null
          referrer?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_fingerprint?: string | null
        }
        Update: {
          city?: string | null
          completed?: boolean | null
          country?: string | null
          duration_listened_seconds?: number | null
          id?: string
          listened_at?: string | null
          news_id?: string | null
          platform?: string | null
          referrer?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_audio_analytics_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_audio_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      news_audio_settings: {
        Row: {
          auto_distribute: boolean | null
          auto_generate_audio: boolean | null
          auto_generate_summary: boolean | null
          created_at: string | null
          default_audio_type: string | null
          default_voice_gender: string | null
          default_voice_id: string | null
          excluded_authors: string[] | null
          excluded_categories: string[] | null
          id: string
          is_enabled: boolean | null
          max_audio_duration_seconds: number | null
          monthly_audio_limit: number | null
          monthly_distribution_limit: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_distribute?: boolean | null
          auto_generate_audio?: boolean | null
          auto_generate_summary?: boolean | null
          created_at?: string | null
          default_audio_type?: string | null
          default_voice_gender?: string | null
          default_voice_id?: string | null
          excluded_authors?: string[] | null
          excluded_categories?: string[] | null
          id?: string
          is_enabled?: boolean | null
          max_audio_duration_seconds?: number | null
          monthly_audio_limit?: number | null
          monthly_distribution_limit?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_distribute?: boolean | null
          auto_generate_audio?: boolean | null
          auto_generate_summary?: boolean | null
          created_at?: string | null
          default_audio_type?: string | null
          default_voice_gender?: string | null
          default_voice_id?: string | null
          excluded_authors?: string[] | null
          excluded_categories?: string[] | null
          id?: string
          is_enabled?: boolean | null
          max_audio_duration_seconds?: number | null
          monthly_audio_limit?: number | null
          monthly_distribution_limit?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_audio_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      news_clicks: {
        Row: {
          browser: string | null
          clicked_at: string
          device_type: string | null
          id: string
          ip_hash: string | null
          news_id: string
          ref_code: string | null
          referrer: string | null
          src: string
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          clicked_at?: string
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          news_id: string
          ref_code?: string | null
          referrer?: string | null
          src?: string
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          clicked_at?: string
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          news_id?: string
          ref_code?: string | null
          referrer?: string | null
          src?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_reading_analytics: {
        Row: {
          audio_play_count: number | null
          audio_played: boolean | null
          audio_total_listen_seconds: number | null
          created_at: string | null
          device_type: string | null
          id: string
          news_id: string | null
          podcast_play_count: number | null
          podcast_played: boolean | null
          read_completed: boolean | null
          referrer: string | null
          scroll_depth_max: number | null
          scroll_depth_percent: number | null
          session_id: string
          share_platform: string | null
          shared: boolean | null
          summary_expanded: boolean | null
          tenant_id: string | null
          time_on_page_seconds: number | null
          toc_clicked: boolean | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          viewport_width: number | null
        }
        Insert: {
          audio_play_count?: number | null
          audio_played?: boolean | null
          audio_total_listen_seconds?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          news_id?: string | null
          podcast_play_count?: number | null
          podcast_played?: boolean | null
          read_completed?: boolean | null
          referrer?: string | null
          scroll_depth_max?: number | null
          scroll_depth_percent?: number | null
          session_id: string
          share_platform?: string | null
          shared?: boolean | null
          summary_expanded?: boolean | null
          tenant_id?: string | null
          time_on_page_seconds?: number | null
          toc_clicked?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_width?: number | null
        }
        Update: {
          audio_play_count?: number | null
          audio_played?: boolean | null
          audio_total_listen_seconds?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          news_id?: string | null
          podcast_play_count?: number | null
          podcast_played?: boolean | null
          read_completed?: boolean | null
          referrer?: string | null
          scroll_depth_max?: number | null
          scroll_depth_percent?: number | null
          session_id?: string
          share_platform?: string | null
          shared?: boolean | null
          summary_expanded?: boolean | null
          tenant_id?: string | null
          time_on_page_seconds?: number | null
          toc_clicked?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_reading_analytics_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_reading_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      news_social_settings: {
        Row: {
          created_at: string
          custom_captions: Json | null
          custom_image_url: string | null
          enabled: boolean
          image_source: string | null
          mode: string
          news_id: string
          platforms: string[] | null
          scheduled_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_captions?: Json | null
          custom_image_url?: string | null
          enabled?: boolean
          image_source?: string | null
          mode?: string
          news_id: string
          platforms?: string[] | null
          scheduled_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_captions?: Json | null
          custom_image_url?: string | null
          enabled?: boolean
          image_source?: string | null
          mode?: string
          news_id?: string
          platforms?: string[] | null
          scheduled_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_social_settings_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: true
            referencedRelation: "news"
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
      paid_highlights: {
        Row: {
          amount_cents: number
          created_at: string
          duration_days: number
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          paid_at: string | null
          starts_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          duration_days: number
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          starts_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          duration_days?: number
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          starts_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partner_relationships: {
        Row: {
          allow_full_content: boolean
          allow_rewrite: boolean
          created_at: string
          default_mode: Database["public"]["Enums"]["delivery_mode"]
          id: string
          rate_limit_day: number | null
          require_approval: boolean
          source_site_id: string
          status: Database["public"]["Enums"]["partnership_status"]
          target_site_id: string
          updated_at: string
        }
        Insert: {
          allow_full_content?: boolean
          allow_rewrite?: boolean
          created_at?: string
          default_mode?: Database["public"]["Enums"]["delivery_mode"]
          id?: string
          rate_limit_day?: number | null
          require_approval?: boolean
          source_site_id: string
          status?: Database["public"]["Enums"]["partnership_status"]
          target_site_id: string
          updated_at?: string
        }
        Update: {
          allow_full_content?: boolean
          allow_rewrite?: boolean
          created_at?: string
          default_mode?: Database["public"]["Enums"]["delivery_mode"]
          id?: string
          rate_limit_day?: number | null
          require_approval?: boolean
          source_site_id?: string
          status?: Database["public"]["Enums"]["partnership_status"]
          target_site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_relationships_source_site_id_fkey"
            columns: ["source_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_relationships_target_site_id_fkey"
            columns: ["target_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_affiliate_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          store: string
          url_template: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          store: string
          url_template: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          store?: string
          url_template?: string
        }
        Relationships: []
      }
      phone_catalog: {
        Row: {
          accessibility_badges: string[] | null
          accessibility_features: string[] | null
          accessibility_score: number | null
          battery_score: number
          brand: string
          camera_score: number
          considerations: string[]
          created_at: string
          drop_resistant: boolean | null
          gaming_score: number
          has_emergency_sos: boolean | null
          has_nfc: boolean | null
          has_physical_buttons: boolean | null
          id: string
          ideal_for: string
          image_url: string | null
          import_source: string | null
          is_active: boolean
          name: string
          price_max: number
          price_min: number
          price_range: string
          screen_size: number | null
          speaker_quality: string | null
          strengths: string[]
          tenant_id: string | null
          updated_at: string
          use_cases: string[]
          vibration_strength: string | null
          water_resistant: boolean | null
          weight_grams: number | null
        }
        Insert: {
          accessibility_badges?: string[] | null
          accessibility_features?: string[] | null
          accessibility_score?: number | null
          battery_score?: number
          brand: string
          camera_score?: number
          considerations?: string[]
          created_at?: string
          drop_resistant?: boolean | null
          gaming_score?: number
          has_emergency_sos?: boolean | null
          has_nfc?: boolean | null
          has_physical_buttons?: boolean | null
          id?: string
          ideal_for: string
          image_url?: string | null
          import_source?: string | null
          is_active?: boolean
          name: string
          price_max: number
          price_min: number
          price_range: string
          screen_size?: number | null
          speaker_quality?: string | null
          strengths?: string[]
          tenant_id?: string | null
          updated_at?: string
          use_cases?: string[]
          vibration_strength?: string | null
          water_resistant?: boolean | null
          weight_grams?: number | null
        }
        Update: {
          accessibility_badges?: string[] | null
          accessibility_features?: string[] | null
          accessibility_score?: number | null
          battery_score?: number
          brand?: string
          camera_score?: number
          considerations?: string[]
          created_at?: string
          drop_resistant?: boolean | null
          gaming_score?: number
          has_emergency_sos?: boolean | null
          has_nfc?: boolean | null
          has_physical_buttons?: boolean | null
          id?: string
          ideal_for?: string
          image_url?: string | null
          import_source?: string | null
          is_active?: boolean
          name?: string
          price_max?: number
          price_min?: number
          price_range?: string
          screen_size?: number | null
          speaker_quality?: string | null
          strengths?: string[]
          tenant_id?: string | null
          updated_at?: string
          use_cases?: string[]
          vibration_strength?: string | null
          water_resistant?: boolean | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_offer_clicks: {
        Row: {
          clicked_at: string
          id: string
          offer_id: string
          phone_id: string
          store: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          offer_id: string
          phone_id: string
          store: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          offer_id?: string
          phone_id?: string
          store?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_offer_clicks_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "phone_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_offer_clicks_phone_id_fkey"
            columns: ["phone_id"]
            isOneToOne: false
            referencedRelation: "phone_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_offers: {
        Row: {
          affiliate_url: string
          button_text: string | null
          created_at: string
          id: string
          is_active: boolean
          phone_id: string
          price: number | null
          priority: number
          store: string
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          button_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          phone_id: string
          price?: number | null
          priority?: number
          store: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          button_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          phone_id?: string
          price?: number | null
          priority?: number
          store?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_offers_phone_id_fkey"
            columns: ["phone_id"]
            isOneToOne: false
            referencedRelation: "phone_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_recommendations: {
        Row: {
          alternative_phones: string[] | null
          answers: Json
          created_at: string
          id: string
          recommended_phone_id: string | null
          user_id: string
        }
        Insert: {
          alternative_phones?: string[] | null
          answers: Json
          created_at?: string
          id?: string
          recommended_phone_id?: string | null
          user_id: string
        }
        Update: {
          alternative_phones?: string[] | null
          answers?: Json
          created_at?: string
          id?: string
          recommended_phone_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_recommendations_recommended_phone_id_fkey"
            columns: ["recommended_phone_id"]
            isOneToOne: false
            referencedRelation: "phone_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_requests: {
        Row: {
          created_at: string
          description: string | null
          from_site_id: string
          id: string
          responded_at: string | null
          responded_by: string | null
          response_message: string | null
          status: Database["public"]["Enums"]["pitch_status"]
          suggested_sources: Json | null
          title: string
          to_site_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          from_site_id: string
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          status?: Database["public"]["Enums"]["pitch_status"]
          suggested_sources?: Json | null
          title: string
          to_site_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          from_site_id?: string
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          status?: Database["public"]["Enums"]["pitch_status"]
          suggested_sources?: Json | null
          title?: string
          to_site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_requests_from_site_id_fkey"
            columns: ["from_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_requests_to_site_id_fkey"
            columns: ["to_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_feeds: {
        Row: {
          amazon_url: string | null
          apple_url: string | null
          author_id: string | null
          category_id: string | null
          copyright: string | null
          cover_image_url: string | null
          created_at: string | null
          deezer_url: string | null
          description: string | null
          explicit: boolean | null
          feed_type: string
          feed_url: string | null
          google_url: string | null
          id: string
          is_active: boolean | null
          itunes_category: string | null
          itunes_explicit: boolean | null
          itunes_subcategory: string | null
          language: string | null
          owner_email: string | null
          owner_name: string | null
          spotify_url: string | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amazon_url?: string | null
          apple_url?: string | null
          author_id?: string | null
          category_id?: string | null
          copyright?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          deezer_url?: string | null
          description?: string | null
          explicit?: boolean | null
          feed_type?: string
          feed_url?: string | null
          google_url?: string | null
          id?: string
          is_active?: boolean | null
          itunes_category?: string | null
          itunes_explicit?: boolean | null
          itunes_subcategory?: string | null
          language?: string | null
          owner_email?: string | null
          owner_name?: string | null
          spotify_url?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amazon_url?: string | null
          apple_url?: string | null
          author_id?: string | null
          category_id?: string | null
          copyright?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          deezer_url?: string | null
          description?: string | null
          explicit?: boolean | null
          feed_type?: string
          feed_url?: string | null
          google_url?: string | null
          id?: string
          is_active?: boolean | null
          itunes_category?: string | null
          itunes_explicit?: boolean | null
          itunes_subcategory?: string | null
          language?: string | null
          owner_email?: string | null
          owner_name?: string | null
          spotify_url?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_feeds_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_feeds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_logs: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          details: string | null
          id: string
          news_id: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          id?: string
          news_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          id?: string
          news_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_logs_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_manual_episodes: {
        Row: {
          audio_url: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          episode_number: number | null
          episode_type: string | null
          feed_id: string
          file_size_bytes: number | null
          id: string
          is_published: boolean | null
          published_at: string | null
          season_number: number | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          episode_type?: string | null
          feed_id: string
          file_size_bytes?: number | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          season_number?: number | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          episode_type?: string | null
          feed_id?: string
          file_size_bytes?: number | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          season_number?: number | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_manual_episodes_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "podcast_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_manual_episodes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_templates: {
        Row: {
          created_at: string | null
          default_modules: Json | null
          description: string | null
          home_sections: Json | null
          icon: string | null
          id: string
          initial_content: Json | null
          is_active: boolean | null
          key: string
          language_style: string | null
          name: string
          preview_image: string | null
          sort_order: number | null
          theme: Json | null
          updated_at: string | null
          vocabulary: Json | null
        }
        Insert: {
          created_at?: string | null
          default_modules?: Json | null
          description?: string | null
          home_sections?: Json | null
          icon?: string | null
          id?: string
          initial_content?: Json | null
          is_active?: boolean | null
          key: string
          language_style?: string | null
          name: string
          preview_image?: string | null
          sort_order?: number | null
          theme?: Json | null
          updated_at?: string | null
          vocabulary?: Json | null
        }
        Update: {
          created_at?: string | null
          default_modules?: Json | null
          description?: string | null
          home_sections?: Json | null
          icon?: string | null
          id?: string
          initial_content?: Json | null
          is_active?: boolean | null
          key?: string
          language_style?: string | null
          name?: string
          preview_image?: string | null
          sort_order?: number | null
          theme?: Json | null
          updated_at?: string | null
          vocabulary?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email_notifications: Json | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          profile_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email_notifications?: Json | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_activity_at?: string | null
          profile_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email_notifications?: Json | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          profile_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      publidoor_advertisers: {
        Row: {
          category: string | null
          city: string | null
          company_name: string
          created_at: string
          google_maps_url: string | null
          id: string
          logo_url: string | null
          neighborhood: string | null
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          company_name: string
          created_at?: string
          google_maps_url?: string | null
          id?: string
          logo_url?: string | null
          neighborhood?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          company_name?: string
          created_at?: string
          google_maps_url?: string | null
          id?: string
          logo_url?: string | null
          neighborhood?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_advertisers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_approvals: {
        Row: {
          action: string
          comment: string | null
          created_at: string
          id: string
          publidoor_id: string
          reviewer_id: string | null
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string
          id?: string
          publidoor_id: string
          reviewer_id?: string | null
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string
          id?: string
          publidoor_id?: string
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_approvals_publidoor_id_fkey"
            columns: ["publidoor_id"]
            isOneToOne: false
            referencedRelation: "publidoor_items"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_exclusive: boolean | null
          name: string
          priority: number | null
          starts_at: string | null
          status:
            | Database["public"]["Enums"]["publidoor_campaign_status"]
            | null
          tenant_id: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_exclusive?: boolean | null
          name: string
          priority?: number | null
          starts_at?: string | null
          status?:
            | Database["public"]["Enums"]["publidoor_campaign_status"]
            | null
          tenant_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_exclusive?: boolean | null
          name?: string
          priority?: number | null
          starts_at?: string | null
          status?:
            | Database["public"]["Enums"]["publidoor_campaign_status"]
            | null
          tenant_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_items: {
        Row: {
          advertiser_id: string | null
          campaign_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          cta_link: string | null
          cta_text: string | null
          id: string
          internal_name: string
          logo_url: string | null
          media_type: string | null
          media_url: string | null
          phrase_1: string
          phrase_2: string | null
          phrase_3: string | null
          status: Database["public"]["Enums"]["publidoor_item_status"] | null
          template_id: string | null
          tenant_id: string | null
          type: Database["public"]["Enums"]["publidoor_item_type"]
          updated_at: string
        }
        Insert: {
          advertiser_id?: string | null
          campaign_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          internal_name: string
          logo_url?: string | null
          media_type?: string | null
          media_url?: string | null
          phrase_1: string
          phrase_2?: string | null
          phrase_3?: string | null
          status?: Database["public"]["Enums"]["publidoor_item_status"] | null
          template_id?: string | null
          tenant_id?: string | null
          type?: Database["public"]["Enums"]["publidoor_item_type"]
          updated_at?: string
        }
        Update: {
          advertiser_id?: string | null
          campaign_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          internal_name?: string
          logo_url?: string | null
          media_type?: string | null
          media_url?: string | null
          phrase_1?: string
          phrase_2?: string | null
          phrase_3?: string | null
          status?: Database["public"]["Enums"]["publidoor_item_status"] | null
          template_id?: string | null
          tenant_id?: string | null
          type?: Database["public"]["Enums"]["publidoor_item_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_items_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "publidoor_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publidoor_items_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "publidoor_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publidoor_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publidoor_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "publidoor_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publidoor_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_location_assignments: {
        Row: {
          created_at: string
          id: string
          is_exclusive: boolean | null
          location_id: string
          publidoor_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_exclusive?: boolean | null
          location_id: string
          publidoor_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_exclusive?: boolean | null
          location_id?: string
          publidoor_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_location_assignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "publidoor_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publidoor_location_assignments_publidoor_id_fkey"
            columns: ["publidoor_id"]
            isOneToOne: false
            referencedRelation: "publidoor_items"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_locations: {
        Row: {
          allows_rotation: boolean | null
          created_at: string
          description: string | null
          device_target: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          max_items: number | null
          name: string
          slug: string
          tenant_id: string | null
        }
        Insert: {
          allows_rotation?: boolean | null
          created_at?: string
          description?: string | null
          device_target?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          max_items?: number | null
          name: string
          slug: string
          tenant_id?: string | null
        }
        Update: {
          allows_rotation?: boolean | null
          created_at?: string
          description?: string | null
          device_target?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          max_items?: number | null
          name?: string
          slug?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_metrics: {
        Row: {
          avg_time_on_screen: number | null
          clicks: number | null
          created_at: string
          date: string
          device: string | null
          id: string
          impressions: number | null
          publidoor_id: string
        }
        Insert: {
          avg_time_on_screen?: number | null
          clicks?: number | null
          created_at?: string
          date?: string
          device?: string | null
          id?: string
          impressions?: number | null
          publidoor_id: string
        }
        Update: {
          avg_time_on_screen?: number | null
          clicks?: number | null
          created_at?: string
          date?: string
          device?: string | null
          id?: string
          impressions?: number | null
          publidoor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_metrics_publidoor_id_fkey"
            columns: ["publidoor_id"]
            isOneToOne: false
            referencedRelation: "publidoor_items"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_schedules: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          id: string
          is_active: boolean | null
          publidoor_id: string
          schedule_type: string
          specific_dates: string[] | null
          time_end: string | null
          time_start: string | null
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean | null
          publidoor_id: string
          schedule_type: string
          specific_dates?: string[] | null
          time_end?: string | null
          time_start?: string | null
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean | null
          publidoor_id?: string
          schedule_type?: string
          specific_dates?: string[] | null
          time_end?: string | null
          time_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_schedules_publidoor_id_fkey"
            columns: ["publidoor_id"]
            isOneToOne: false
            referencedRelation: "publidoor_items"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          tenant_id: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          tenant_id?: string | null
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          tenant_id?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      publidoor_templates: {
        Row: {
          color_palette: Json | null
          created_at: string
          description: string | null
          font_family: string | null
          font_size: string | null
          has_animations: boolean | null
          id: string
          is_active: boolean | null
          name: string
          preview_url: string | null
          slug: string
          tenant_id: string | null
        }
        Insert: {
          color_palette?: Json | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          font_size?: string | null
          has_animations?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_url?: string | null
          slug: string
          tenant_id?: string | null
        }
        Update: {
          color_palette?: Json | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          font_size?: string | null
          has_animations?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_url?: string | null
          slug?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publidoor_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      push_logs: {
        Row: {
          body: string
          created_at: string | null
          error: string | null
          id: string
          notification_id: string | null
          sent_at: string | null
          status: string | null
          subscription_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          error?: string | null
          id?: string
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
          subscription_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          error?: string | null
          id?: string
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
          subscription_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "push_notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          edition_id: string | null
          failed_count: number | null
          icon_url: string | null
          id: string
          image_url: string | null
          sent_at: string | null
          sent_count: number | null
          target_type: string
          target_user_ids: string[] | null
          tenant_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          edition_id?: string | null
          failed_count?: number | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          sent_at?: string | null
          sent_count?: number | null
          target_type?: string
          target_user_ids?: string[] | null
          tenant_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          edition_id?: string | null
          failed_count?: number | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          sent_at?: string | null
          sent_count?: number | null
          target_type?: string
          target_user_ids?: string[] | null
          tenant_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "digital_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          categories: string[] | null
          city: string | null
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          categories?: string[] | null
          city?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          categories?: string[] | null
          city?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          created_at: string
          format: string | null
          id: string
          link_id: string
          owner_id: string | null
          size: number | null
          storage_url: string | null
        }
        Insert: {
          created_at?: string
          format?: string | null
          id?: string
          link_id: string
          owner_id?: string | null
          size?: number | null
          storage_url?: string | null
        }
        Update: {
          created_at?: string
          format?: string | null
          id?: string
          link_id?: string
          owner_id?: string | null
          size?: number | null
          storage_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "quick_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          fiscal_profile_id: string | null
          gross_amount: number
          id: string
          net_amount: number | null
          paid_at: string | null
          platform_fee: number | null
          source_id: string | null
          source_type: string
          status: string | null
          tax_amount: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          fiscal_profile_id?: string | null
          gross_amount: number
          id?: string
          net_amount?: number | null
          paid_at?: string | null
          platform_fee?: number | null
          source_id?: string | null
          source_type: string
          status?: string | null
          tax_amount?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          fiscal_profile_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number | null
          paid_at?: string | null
          platform_fee?: number | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          tax_amount?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receivables_fiscal_profile_id_fkey"
            columns: ["fiscal_profile_id"]
            isOneToOne: false
            referencedRelation: "fiscal_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_ingest_items: {
        Row: {
          canonical_url: string
          content: string | null
          created_at: string | null
          draft_id: string | null
          error_message: string | null
          excerpt: string | null
          generated_image_url: string | null
          id: string
          image_url: string | null
          news_id: string | null
          processed_at: string | null
          processing_started_at: string | null
          published_at: string | null
          published_at_portal: string | null
          raw_payload: Json | null
          retry_count: number | null
          rewritten_content: string | null
          rewritten_title: string | null
          seo_meta_description: string | null
          seo_meta_title: string | null
          source_id: string
          status: string | null
          title: string | null
        }
        Insert: {
          canonical_url: string
          content?: string | null
          created_at?: string | null
          draft_id?: string | null
          error_message?: string | null
          excerpt?: string | null
          generated_image_url?: string | null
          id?: string
          image_url?: string | null
          news_id?: string | null
          processed_at?: string | null
          processing_started_at?: string | null
          published_at?: string | null
          published_at_portal?: string | null
          raw_payload?: Json | null
          retry_count?: number | null
          rewritten_content?: string | null
          rewritten_title?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          source_id: string
          status?: string | null
          title?: string | null
        }
        Update: {
          canonical_url?: string
          content?: string | null
          created_at?: string | null
          draft_id?: string | null
          error_message?: string | null
          excerpt?: string | null
          generated_image_url?: string | null
          id?: string
          image_url?: string | null
          news_id?: string | null
          processed_at?: string | null
          processing_started_at?: string | null
          published_at?: string | null
          published_at_portal?: string | null
          raw_payload?: Json | null
          retry_count?: number | null
          rewritten_content?: string | null
          rewritten_title?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          source_id?: string
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regional_ingest_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "regional_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_ingest_runs: {
        Row: {
          created_at: string | null
          finished_at: string | null
          id: string
          items_duplicated: number | null
          items_errored: number | null
          items_found: number | null
          items_new: number | null
          log: string | null
          result: Json | null
          source_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          finished_at?: string | null
          id?: string
          items_duplicated?: number | null
          items_errored?: number | null
          items_found?: number | null
          items_new?: number | null
          log?: string | null
          result?: Json | null
          source_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          finished_at?: string | null
          id?: string
          items_duplicated?: number | null
          items_errored?: number | null
          items_found?: number | null
          items_new?: number | null
          log?: string | null
          result?: Json | null
          source_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regional_ingest_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "regional_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_sources: {
        Row: {
          city: string
          created_at: string | null
          daily_max_items: number | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_fetched_at: string | null
          last_success_at: string | null
          listing_url: string | null
          mode: string | null
          name: string
          poll_interval_minutes: number | null
          rate_limit_per_hour: number | null
          rss_url: string | null
          selectors: Json | null
          source_url: string | null
          tags_default: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          daily_max_items?: number | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          listing_url?: string | null
          mode?: string | null
          name: string
          poll_interval_minutes?: number | null
          rate_limit_per_hour?: number | null
          rss_url?: string | null
          selectors?: Json | null
          source_url?: string | null
          tags_default?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          daily_max_items?: number | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          listing_url?: string | null
          mode?: string | null
          name?: string
          poll_interval_minutes?: number | null
          rate_limit_per_hour?: number | null
          rss_url?: string | null
          selectors?: Json | null
          source_url?: string | null
          tags_default?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          bairro: string
          created_at: string | null
          endereco: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome_oficial: string
          rede: string
          slug: string
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          bairro: string
          created_at?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_oficial: string
          rede: string
          slug: string
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string
          created_at?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_oficial?: string
          rede?: string
          slug?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_template_config: {
        Row: {
          applied_at: string | null
          branding: Json | null
          created_at: string | null
          id: string
          modules_overrides: Json | null
          radio_config: Json | null
          site_id: string | null
          template_id: string | null
          theme_overrides: Json | null
          tv_config: Json | null
          updated_at: string | null
          vocabulary_overrides: Json | null
        }
        Insert: {
          applied_at?: string | null
          branding?: Json | null
          created_at?: string | null
          id?: string
          modules_overrides?: Json | null
          radio_config?: Json | null
          site_id?: string | null
          template_id?: string | null
          theme_overrides?: Json | null
          tv_config?: Json | null
          updated_at?: string | null
          vocabulary_overrides?: Json | null
        }
        Update: {
          applied_at?: string | null
          branding?: Json | null
          created_at?: string | null
          id?: string
          modules_overrides?: Json | null
          radio_config?: Json | null
          site_id?: string | null
          template_id?: string | null
          theme_overrides?: Json | null
          tv_config?: Json | null
          updated_at?: string | null
          vocabulary_overrides?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "site_template_config_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_template_config_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "portal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      site_users: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["site_user_role"]
          site_id: string
          status: Database["public"]["Enums"]["site_user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["site_user_role"]
          site_id: string
          status?: Database["public"]["Enums"]["site_user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["site_user_role"]
          site_id?: string
          status?: Database["public"]["Enums"]["site_user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_users_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          base_url: string
          created_at: string
          current_template_id: string | null
          default_utm_medium_map: Json | null
          default_utm_source: string | null
          id: string
          is_white_label: boolean | null
          name: string
          news_path_prefix: string | null
          owner_id: string | null
          plan_tier: string | null
          primary_domain: string
          share_enabled: boolean | null
          short_domain: string | null
          updated_at: string
        }
        Insert: {
          base_url: string
          created_at?: string
          current_template_id?: string | null
          default_utm_medium_map?: Json | null
          default_utm_source?: string | null
          id?: string
          is_white_label?: boolean | null
          name: string
          news_path_prefix?: string | null
          owner_id?: string | null
          plan_tier?: string | null
          primary_domain: string
          share_enabled?: boolean | null
          short_domain?: string | null
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          current_template_id?: string | null
          default_utm_medium_map?: Json | null
          default_utm_source?: string | null
          id?: string
          is_white_label?: boolean | null
          name?: string
          news_path_prefix?: string | null
          owner_id?: string | null
          plan_tier?: string | null
          primary_domain?: string
          share_enabled?: boolean | null
          short_domain?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_current_template_id_fkey"
            columns: ["current_template_id"]
            isOneToOne: false
            referencedRelation: "portal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          account_type:
            | Database["public"]["Enums"]["social_account_type"]
            | null
          created_at: string | null
          default_enabled: boolean | null
          display_name: string
          id: string
          is_active: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          provider_account_id: string | null
          settings: Json | null
          token_expires_at: string | null
          token_ref: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          account_type?:
            | Database["public"]["Enums"]["social_account_type"]
            | null
          created_at?: string | null
          default_enabled?: boolean | null
          display_name: string
          id?: string
          is_active?: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          provider_account_id?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          token_ref?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          account_type?:
            | Database["public"]["Enums"]["social_account_type"]
            | null
          created_at?: string | null
          default_enabled?: boolean | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          platform?: Database["public"]["Enums"]["social_platform"]
          provider_account_id?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          token_ref?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      social_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          level: string
          message: string
          social_post_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          level?: string
          message: string
          social_post_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          level?: string
          message?: string
          social_post_id?: string | null
        }
        Relationships: []
      }
      social_post_logs: {
        Row: {
          created_at: string | null
          event: string
          id: string
          level: string | null
          message: string | null
          payload_json: Json | null
          target_id: string
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          level?: string | null
          message?: string | null
          payload_json?: Json | null
          target_id: string
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          level?: string | null
          message?: string | null
          payload_json?: Json | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_post_logs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "social_post_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_targets: {
        Row: {
          assisted_at: string | null
          attempts: number | null
          caption_override: string | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          media_override: Json | null
          next_retry_at: string | null
          post_id: string
          posted_at: string | null
          provider_post_id: string | null
          provider_post_url: string | null
          scheduled_at: string | null
          social_account_id: string
          status: Database["public"]["Enums"]["social_target_status"] | null
          updated_at: string | null
        }
        Insert: {
          assisted_at?: string | null
          attempts?: number | null
          caption_override?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          media_override?: Json | null
          next_retry_at?: string | null
          post_id: string
          posted_at?: string | null
          provider_post_id?: string | null
          provider_post_url?: string | null
          scheduled_at?: string | null
          social_account_id: string
          status?: Database["public"]["Enums"]["social_target_status"] | null
          updated_at?: string | null
        }
        Update: {
          assisted_at?: string | null
          attempts?: number | null
          caption_override?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          media_override?: Json | null
          next_retry_at?: string | null
          post_id?: string
          posted_at?: string | null
          provider_post_id?: string | null
          provider_post_url?: string | null
          scheduled_at?: string | null
          social_account_id?: string
          status?: Database["public"]["Enums"]["social_target_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_post_targets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_post_targets_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          base_caption: string | null
          created_at: string | null
          created_by: string | null
          hashtags: string[] | null
          id: string
          link_url: string | null
          media_json: Json | null
          origin_id: string | null
          origin_type: Database["public"]["Enums"]["social_origin_type"] | null
          status_global:
            | Database["public"]["Enums"]["social_post_status"]
            | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          utm_params: Json | null
        }
        Insert: {
          base_caption?: string | null
          created_at?: string | null
          created_by?: string | null
          hashtags?: string[] | null
          id?: string
          link_url?: string | null
          media_json?: Json | null
          origin_id?: string | null
          origin_type?: Database["public"]["Enums"]["social_origin_type"] | null
          status_global?:
            | Database["public"]["Enums"]["social_post_status"]
            | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          utm_params?: Json | null
        }
        Update: {
          base_caption?: string | null
          created_at?: string | null
          created_by?: string | null
          hashtags?: string[] | null
          id?: string
          link_url?: string | null
          media_json?: Json | null
          origin_id?: string | null
          origin_type?: Database["public"]["Enums"]["social_origin_type"] | null
          status_global?:
            | Database["public"]["Enums"]["social_post_status"]
            | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          utm_params?: Json | null
        }
        Relationships: []
      }
      social_templates: {
        Row: {
          caption_template: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          is_default: boolean | null
          name: string
          origin_type: Database["public"]["Enums"]["social_origin_type"] | null
          platforms: Database["public"]["Enums"]["social_platform"][] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          caption_template: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          is_default?: boolean | null
          name: string
          origin_type?: Database["public"]["Enums"]["social_origin_type"] | null
          platforms?: Database["public"]["Enums"]["social_platform"][] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          caption_template?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          is_default?: boolean | null
          name?: string
          origin_type?: Database["public"]["Enums"]["social_origin_type"] | null
          platforms?: Database["public"]["Enums"]["social_platform"][] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      solutions: {
        Row: {
          benefits: string[] | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          price_monthly: number | null
          price_yearly: number | null
          requires_plan: string | null
          sort_order: number | null
          updated_at: string
          who_should_use: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          requires_plan?: string | null
          sort_order?: number | null
          updated_at?: string
          who_should_use?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          requires_plan?: string | null
          sort_order?: number | null
          updated_at?: string
          who_should_use?: string | null
        }
        Relationships: []
      }
      sso_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          target_app: string
          tenant_id: string | null
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          target_app?: string
          tenant_id?: string | null
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          target_app?: string
          tenant_id?: string | null
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sso_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      super_banners: {
        Row: {
          alt_text: string | null
          campaign_id: string | null
          click_count: number
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link_target: string | null
          link_url: string | null
          managed_by_campaign: boolean | null
          sort_order: number
          starts_at: string | null
          tenant_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          campaign_id?: string | null
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_target?: string | null
          link_url?: string | null
          managed_by_campaign?: boolean | null
          sort_order?: number
          starts_at?: string | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          campaign_id?: string | null
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_target?: string | null
          link_url?: string | null
          managed_by_campaign?: boolean | null
          sort_order?: number
          starts_at?: string | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_banners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_banners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      syndication_inbox: {
        Row: {
          author_name: string | null
          content_html: string | null
          created_at: string | null
          excerpt: string | null
          external_id: string
          featured_image_url: string | null
          id: string
          original_url: string
          pub_date: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string
          status: string | null
          target_news_id: string | null
          tenant_id: string | null
          title: string
        }
        Insert: {
          author_name?: string | null
          content_html?: string | null
          created_at?: string | null
          excerpt?: string | null
          external_id: string
          featured_image_url?: string | null
          id?: string
          original_url: string
          pub_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id: string
          status?: string | null
          target_news_id?: string | null
          tenant_id?: string | null
          title: string
        }
        Update: {
          author_name?: string | null
          content_html?: string | null
          created_at?: string | null
          excerpt?: string | null
          external_id?: string
          featured_image_url?: string | null
          id?: string
          original_url?: string
          pub_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string
          status?: string | null
          target_news_id?: string | null
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndication_inbox_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "syndication_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndication_inbox_target_news_id_fkey"
            columns: ["target_news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndication_inbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      syndication_sources: {
        Row: {
          auto_import: boolean | null
          category_mapping: Json | null
          created_at: string | null
          default_category_id: string | null
          error_count: number | null
          feed_type: string | null
          feed_url: string
          id: string
          is_active: boolean | null
          last_error: string | null
          last_fetched_at: string | null
          last_item_count: number | null
          name: string
          require_approval: boolean | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_import?: boolean | null
          category_mapping?: Json | null
          created_at?: string | null
          default_category_id?: string | null
          error_count?: number | null
          feed_type?: string | null
          feed_url: string
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_item_count?: number | null
          name: string
          require_approval?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_import?: boolean | null
          category_mapping?: Json | null
          created_at?: string | null
          default_category_id?: string | null
          error_count?: number | null
          feed_type?: string | null
          feed_url?: string
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_item_count?: number | null
          name?: string
          require_approval?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syndication_sources_default_category_id_fkey"
            columns: ["default_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndication_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          erro: string
          id: string
          metadata: Json | null
          modulo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          erro: string
          id?: string
          metadata?: Json | null
          modulo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          erro?: string
          id?: string
          metadata?: Json | null
          modulo?: string
          usuario_id?: string | null
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
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          created_at: string
          enabled_at: string | null
          expires_at: string | null
          feature_key: string
          id: string
          is_enabled: boolean
          plan_tier: string | null
          settings: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled_at?: string | null
          expires_at?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean
          plan_tier?: string | null
          settings?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled_at?: string | null
          expires_at?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean
          plan_tier?: string | null
          settings?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_modules: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          module_key: string
          settings: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          module_key: string
          settings?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          module_key?: string
          settings?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles_config: {
        Row: {
          allowed_profiles: string[]
          created_at: string
          default_profile: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowed_profiles?: string[]
          created_at?: string
          default_profile?: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowed_profiles?: string[]
          created_at?: string
          default_profile?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_profiles_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_solutions: {
        Row: {
          activated_at: string | null
          billing_cycle: string | null
          created_at: string
          expires_at: string | null
          id: string
          next_billing_date: string | null
          payment_status: string | null
          settings: Json | null
          solution_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          next_billing_date?: string | null
          payment_status?: string | null
          settings?: Json | null
          solution_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          next_billing_date?: string | null
          payment_status?: string | null
          settings?: Json | null
          solution_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_solutions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          key: string
          sort_order: number | null
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          key: string
          sort_order?: number | null
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          key?: string
          sort_order?: number | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed_at: string | null
          id: string
          step_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          step_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "training_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      training_steps: {
        Row: {
          action_label: string | null
          action_url: string | null
          content_html: string | null
          created_at: string | null
          id: string
          module_id: string
          sort_order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          content_html?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          sort_order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          content_html?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          sort_order?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_steps_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_leads: {
        Row: {
          acessibilidade: string[] | null
          bairro: string
          consentimento: boolean
          contato_whatsapp: string
          created_at: string | null
          id: string
          rede: string
          school_id: string | null
          school_texto: string | null
          status: string | null
          tenant_id: string | null
          turno: string
        }
        Insert: {
          acessibilidade?: string[] | null
          bairro: string
          consentimento?: boolean
          contato_whatsapp: string
          created_at?: string | null
          id?: string
          rede: string
          school_id?: string | null
          school_texto?: string | null
          status?: string | null
          tenant_id?: string | null
          turno: string
        }
        Update: {
          acessibilidade?: string[] | null
          bairro?: string
          consentimento?: boolean
          contato_whatsapp?: string
          created_at?: string | null
          id?: string
          rede?: string
          school_id?: string | null
          school_texto?: string | null
          status?: string | null
          tenant_id?: string | null
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_leads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_reports: {
        Row: {
          contato: string | null
          created_at: string | null
          descricao: string | null
          id: string
          motivo: string
          school_id: string | null
          status: string | null
          tenant_id: string | null
          transporter_id: string | null
        }
        Insert: {
          contato?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          motivo: string
          school_id?: string | null
          status?: string | null
          tenant_id?: string | null
          transporter_id?: string | null
        }
        Update: {
          contato?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          motivo?: string
          school_id?: string | null
          status?: string | null
          tenant_id?: string | null
          transporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_reports_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "transporters"
            referencedColumns: ["id"]
          },
        ]
      }
      transporter_areas: {
        Row: {
          bairro: string
          created_at: string | null
          id: string
          transporter_id: string
          turno: string
        }
        Insert: {
          bairro: string
          created_at?: string | null
          id?: string
          transporter_id: string
          turno: string
        }
        Update: {
          bairro?: string
          created_at?: string | null
          id?: string
          transporter_id?: string
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "transporter_areas_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "transporters"
            referencedColumns: ["id"]
          },
        ]
      }
      transporter_schools: {
        Row: {
          created_at: string | null
          school_id: string
          transporter_id: string
        }
        Insert: {
          created_at?: string | null
          school_id: string
          transporter_id: string
        }
        Update: {
          created_at?: string | null
          school_id?: string
          transporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transporter_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transporter_schools_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "transporters"
            referencedColumns: ["id"]
          },
        ]
      }
      transporters: {
        Row: {
          acessibilidade_tipos: string[] | null
          ar_condicionado: boolean | null
          atende_acessibilidade: boolean | null
          capacidade_aprox: number | null
          cinto_individual: boolean | null
          created_at: string | null
          descricao_curta: string | null
          id: string
          nivel_verificacao: number | null
          nome: string
          status: string | null
          telefone: string | null
          tenant_id: string | null
          tipo_servico: string
          updated_at: string | null
          vagas_status: string | null
          veiculo_tipo: string
          whatsapp: string
        }
        Insert: {
          acessibilidade_tipos?: string[] | null
          ar_condicionado?: boolean | null
          atende_acessibilidade?: boolean | null
          capacidade_aprox?: number | null
          cinto_individual?: boolean | null
          created_at?: string | null
          descricao_curta?: string | null
          id?: string
          nivel_verificacao?: number | null
          nome: string
          status?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tipo_servico: string
          updated_at?: string | null
          vagas_status?: string | null
          veiculo_tipo: string
          whatsapp: string
        }
        Update: {
          acessibilidade_tipos?: string[] | null
          ar_condicionado?: boolean | null
          atende_acessibilidade?: boolean | null
          capacidade_aprox?: number | null
          cinto_individual?: boolean | null
          created_at?: string | null
          descricao_curta?: string | null
          id?: string
          nivel_verificacao?: number | null
          nome?: string
          status?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tipo_servico?: string
          updated_at?: string | null
          vagas_status?: string | null
          veiculo_tipo?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "transporters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_sources: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_allowed: boolean
          name: string
          tenant_id: string | null
          type: Database["public"]["Enums"]["trusted_source_type"]
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_allowed?: boolean
          name: string
          tenant_id?: string | null
          type?: Database["public"]["Enums"]["trusted_source_type"]
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_allowed?: boolean
          name?: string
          tenant_id?: string | null
          type?: Database["public"]["Enums"]["trusted_source_type"]
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "trusted_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          role: string
          status: string
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          token?: string | null
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
      user_push_preferences: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_preferences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      user_sessions_log: {
        Row: {
          browser: string | null
          created_at: string | null
          device_info: string | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tenant_preferences: {
        Row: {
          active_profile: string
          created_at: string
          dismissed_onboarding: boolean
          id: string
          last_seen_at: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_profile?: string
          created_at?: string
          dismissed_onboarding?: boolean
          id?: string
          last_seen_at?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_profile?: string
          created_at?: string
          dismissed_onboarding?: boolean
          id?: string
          last_seen_at?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tenant_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      web_stories: {
        Row: {
          audio_type: string | null
          audio_url: string | null
          author_id: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_title: string | null
          news_id: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["story_status"]
          tenant_id: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          audio_type?: string | null
          audio_url?: string | null
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          news_id?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["story_status"]
          tenant_id?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          audio_type?: string | null
          audio_url?: string | null
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          news_id?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["story_status"]
          tenant_id?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "web_stories_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web_stories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          headline_text: string | null
          id: string
          slide_audio_url: string | null
          sort_order: number
          story_id: string
          subheadline_text: string | null
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
          headline_text?: string | null
          id?: string
          slide_audio_url?: string | null
          sort_order?: number
          story_id: string
          subheadline_text?: string | null
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
          headline_text?: string | null
          id?: string
          slide_audio_url?: string | null
          sort_order?: number
          story_id?: string
          subheadline_text?: string | null
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
      v_legacy_ads_campaigns: {
        Row: {
          advertiser: string | null
          ends_at: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          name: string | null
          slot_type: string | null
          source: string | null
          starts_at: string | null
        }
        Insert: {
          advertiser?: string | null
          ends_at?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          slot_type?: string | null
          source?: never
          starts_at?: string | null
        }
        Update: {
          advertiser?: string | null
          ends_at?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          slot_type?: string | null
          source?: never
          starts_at?: string | null
        }
        Relationships: []
      }
      vw_news_clicks_aggregated_14d: {
        Row: {
          click_count: number | null
          news_id: string | null
          ref_code: string | null
          src: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_aggregated_30d: {
        Row: {
          click_count: number | null
          news_id: string | null
          ref_code: string | null
          src: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_aggregated_7d: {
        Row: {
          click_count: number | null
          news_id: string | null
          ref_code: string | null
          src: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_by_neighborhood_14d: {
        Row: {
          city: string | null
          neighborhood: string | null
          total_clicks: number | null
          unique_refs: number | null
        }
        Relationships: []
      }
      vw_news_clicks_by_neighborhood_30d: {
        Row: {
          city: string | null
          neighborhood: string | null
          total_clicks: number | null
          unique_refs: number | null
        }
        Relationships: []
      }
      vw_news_clicks_by_neighborhood_7d: {
        Row: {
          city: string | null
          neighborhood: string | null
          total_clicks: number | null
          unique_refs: number | null
        }
        Relationships: []
      }
      vw_news_clicks_by_neighborhood_news_14d: {
        Row: {
          city: string | null
          neighborhood: string | null
          news_id: string | null
          total_clicks: number | null
          unique_refs: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_by_neighborhood_news_30d: {
        Row: {
          city: string | null
          neighborhood: string | null
          news_id: string | null
          total_clicks: number | null
          unique_refs: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_by_neighborhood_news_7d: {
        Row: {
          city: string | null
          neighborhood: string | null
          news_id: string | null
          total_clicks: number | null
          unique_refs: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_by_news_14d: {
        Row: {
          news_id: string | null
          total_clicks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_by_news_30d: {
        Row: {
          news_id: string | null
          total_clicks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_news_clicks_by_news_7d: {
        Row: {
          news_id: string | null
          total_clicks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_clicks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_community_level: {
        Args: { _points: number }
        Returns: Database["public"]["Enums"]["community_level"]
      }
      calculate_next_run_time: {
        Args: {
          p_frequency_minutes: number
          p_hours_end: number
          p_hours_start: number
        }
        Returns: string
      }
      can_invite_to_community: { Args: { _user_id: string }; Returns: boolean }
      check_autopost_duplicate: {
        Args: {
          p_content_hash: string
          p_original_url: string
          p_tenant_id: string
          p_title_fingerprint: string
          p_window_days?: number
        }
        Returns: {
          existing_id: string
          is_duplicate: boolean
          match_type: string
          similarity_score: number
        }[]
      }
      check_duplicate_news: {
        Args: { p_slug: string; p_source_url: string; p_title: string }
        Returns: {
          existing_id: string
          is_duplicate: boolean
          match_type: string
        }[]
      }
      check_edition_access: {
        Args: { _edition_id: string; _user_id: string }
        Returns: {
          free_until: string
          has_access: boolean
          reason: string
          required_points: number
          user_points: number
        }[]
      }
      cleanup_expired_sso_codes: { Args: never; Returns: undefined }
      generate_content_hash: { Args: { content: string }; Returns: string }
      get_autopost_stats: {
        Args: { p_days?: number; p_tenant_id: string }
        Returns: {
          avg_processing_time: unknown
          captured_today: number
          duplicates_blocked: number
          in_queue: number
          published_today: number
          sources_with_errors: number
        }[]
      }
      get_business_stats: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          period_clicks: number
          period_leads: number
          period_views: number
          total_leads: number
          total_phone_clicks: number
          total_views: number
          total_website_clicks: number
          total_whatsapp_clicks: number
        }[]
      }
      get_partner_advertiser_id: { Args: { _user_id: string }; Returns: string }
      has_community_access: { Args: { _user_id: string }; Returns: boolean }
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
      increment_business_views: { Args: { p_id: string }; Returns: undefined }
      increment_button_clicks: {
        Args: { p_button_id: string }
        Returns: undefined
      }
      increment_classified_interest: {
        Args: { p_classified_id: string; p_click_type: string }
        Returns: undefined
      }
      increment_classified_views: { Args: { p_id: string }; Returns: undefined }
      increment_imovel_views: { Args: { p_id: string }; Returns: undefined }
      increment_job_views: { Args: { p_id: string }; Returns: undefined }
      increment_link_clicks: { Args: { p_link_id: string }; Returns: undefined }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      is_illumina_team_admin: {
        Args: { p_team_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_illumina_team_member: {
        Args: { p_team_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_module_enabled: {
        Args: { _module_key: string; _tenant_id: string }
        Returns: boolean
      }
      is_publidoor_partner: { Args: { _user_id: string }; Returns: boolean }
      is_site_admin: {
        Args: { _site_id: string; _user_id: string }
        Returns: boolean
      }
      is_site_editor: {
        Args: { _site_id: string; _user_id: string }
        Returns: boolean
      }
      is_site_member: {
        Args: { _site_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_business_click: {
        Args: {
          p_business_id: string
          p_click_type: string
          p_source_page?: string
        }
        Returns: undefined
      }
      normalize_title_fingerprint: { Args: { title: string }; Returns: string }
      owns_publidoor_item: {
        Args: { _publidoor_id: string; _user_id: string }
        Returns: boolean
      }
      should_notify_classified_interest: {
        Args: { p_classified_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      tenant_has_feature: {
        Args: { _feature_key: string; _tenant_id: string }
        Returns: boolean
      }
      tenant_has_solution: {
        Args: { _solution_key: string; _tenant_id: string }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_autopost_source_health: {
        Args: { p_source_id: string }
        Returns: number
      }
    }
    Enums: {
      anunciante_plano: "free" | "pro" | "partner"
      anunciante_tipo: "corretor" | "imobiliaria"
      app_role:
        | "super_admin"
        | "admin"
        | "editor"
        | "columnist"
        | "moderator"
        | "editor_chief"
        | "reporter"
        | "collaborator"
        | "commercial"
        | "financial"
        | "support"
      article_kind: "original" | "imported" | "rewritten" | "edited"
      autopost_import_mode: "auto_publish" | "queue_review" | "capture_only"
      autopost_item_status:
        | "captured"
        | "processed"
        | "queued"
        | "approved"
        | "scheduled"
        | "published"
        | "rejected"
        | "duplicate"
      autopost_job_status: "running" | "success" | "failed" | "partial"
      autopost_publish_status:
        | "draft"
        | "ready"
        | "scheduled"
        | "published"
        | "rejected"
      autopost_source_status: "active" | "paused" | "error"
      autopost_source_type:
        | "rss"
        | "sitemap"
        | "html_crawler"
        | "api"
        | "manual_url"
      business_plan: "free" | "pro" | "premium"
      campaign_asset_type:
        | "banner"
        | "publidoor"
        | "story_cover"
        | "story_slide"
        | "logo"
        | "banner_intro"
        | "floating_ad"
        | "exit_full"
      campaign_channel_type:
        | "ads"
        | "publidoor"
        | "webstories"
        | "push"
        | "newsletter"
        | "exit_intent"
        | "login_panel"
        | "banner_intro"
        | "floating_ad"
      campaign_event_type:
        | "impression"
        | "click"
        | "cta_click"
        | "story_open"
        | "story_complete"
        | "slide_view"
        | "push_sent"
        | "push_delivered"
        | "newsletter_sent"
        | "newsletter_open"
      community_level: "supporter" | "collaborator" | "ambassador" | "leader"
      delivery_mode: "teaser" | "full" | "rewrite"
      distribution_status:
        | "queued"
        | "processing"
        | "needs_approval"
        | "published"
        | "failed"
        | "blocked"
      fact_check_input_type: "link" | "text" | "title" | "image"
      fact_check_status:
        | "NEW"
        | "UNDER_REVIEW"
        | "EDITORIAL_QUEUE"
        | "REVIEWED"
        | "PUBLISHED"
      fact_check_verdict:
        | "CONFIRMADO"
        | "PROVAVELMENTE_VERDADEIRO"
        | "ENGANOSO"
        | "PROVAVELMENTE_FALSO"
        | "FALSO"
        | "NAO_VERIFICAVEL_AINDA"
      highlight_type: "none" | "home" | "urgent" | "featured"
      imovel_finalidade: "venda" | "aluguel" | "venda_aluguel"
      imovel_status:
        | "rascunho"
        | "pendente"
        | "ativo"
        | "vendido"
        | "alugado"
        | "inativo"
      imovel_tipo:
        | "casa"
        | "apartamento"
        | "terreno"
        | "comercial"
        | "chacara"
        | "cobertura"
        | "studio"
        | "kitnet"
        | "galpao"
        | "sala_comercial"
      import_mode: "manual" | "auto" | "auto_with_approval"
      imported_article_status: "inbox" | "published" | "rejected"
      lead_imovel_status:
        | "novo"
        | "contatado"
        | "qualificado"
        | "visita_agendada"
        | "proposta"
        | "fechado"
        | "perdido"
      lead_intencao: "comprar" | "alugar" | "investir" | "avaliar"
      lead_status: "new" | "contacted" | "converted" | "lost"
      news_origin: "manual" | "ai"
      news_status:
        | "draft"
        | "scheduled"
        | "published"
        | "archived"
        | "trash"
        | "review"
        | "approved"
      partnership_status: "pending" | "active" | "suspended" | "rejected"
      pitch_status: "sent" | "approved" | "rejected" | "needs_info"
      publidoor_campaign_status: "draft" | "active" | "paused" | "ended"
      publidoor_item_status: "draft" | "review" | "approved" | "published"
      publidoor_item_type:
        | "narrativo"
        | "contextual"
        | "geografico"
        | "editorial"
        | "impacto_total"
      site_user_role: "admin" | "editor" | "journalist" | "reviewer"
      site_user_status: "active" | "pending" | "suspended"
      social_account_type:
        | "page"
        | "business"
        | "creator"
        | "channel"
        | "personal"
      social_origin_type: "news" | "ad" | "publidoor" | "campaign360" | "manual"
      social_platform:
        | "instagram"
        | "facebook"
        | "x"
        | "linkedin"
        | "tiktok"
        | "youtube"
        | "pinterest"
        | "whatsapp"
        | "telegram"
      social_post_status:
        | "draft"
        | "scheduled"
        | "processing"
        | "done"
        | "failed"
      social_target_status:
        | "draft"
        | "scheduled"
        | "queued"
        | "processing"
        | "done"
        | "failed"
        | "assisted"
      story_status: "draft" | "published" | "archived"
      style_profile_type: "journalist" | "site_default"
      style_ref_kind: "link" | "txt" | "pdf"
      style_ref_status: "uploaded" | "ingested" | "failed"
      trusted_source_type: "PRIMARY" | "JOURNALISM" | "CHECKER" | "OTHER"
      verification_status: "pending" | "verified" | "rejected"
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
      anunciante_plano: ["free", "pro", "partner"],
      anunciante_tipo: ["corretor", "imobiliaria"],
      app_role: [
        "super_admin",
        "admin",
        "editor",
        "columnist",
        "moderator",
        "editor_chief",
        "reporter",
        "collaborator",
        "commercial",
        "financial",
        "support",
      ],
      article_kind: ["original", "imported", "rewritten", "edited"],
      autopost_import_mode: ["auto_publish", "queue_review", "capture_only"],
      autopost_item_status: [
        "captured",
        "processed",
        "queued",
        "approved",
        "scheduled",
        "published",
        "rejected",
        "duplicate",
      ],
      autopost_job_status: ["running", "success", "failed", "partial"],
      autopost_publish_status: [
        "draft",
        "ready",
        "scheduled",
        "published",
        "rejected",
      ],
      autopost_source_status: ["active", "paused", "error"],
      autopost_source_type: [
        "rss",
        "sitemap",
        "html_crawler",
        "api",
        "manual_url",
      ],
      business_plan: ["free", "pro", "premium"],
      campaign_asset_type: [
        "banner",
        "publidoor",
        "story_cover",
        "story_slide",
        "logo",
        "banner_intro",
        "floating_ad",
        "exit_full",
      ],
      campaign_channel_type: [
        "ads",
        "publidoor",
        "webstories",
        "push",
        "newsletter",
        "exit_intent",
        "login_panel",
        "banner_intro",
        "floating_ad",
      ],
      campaign_event_type: [
        "impression",
        "click",
        "cta_click",
        "story_open",
        "story_complete",
        "slide_view",
        "push_sent",
        "push_delivered",
        "newsletter_sent",
        "newsletter_open",
      ],
      community_level: ["supporter", "collaborator", "ambassador", "leader"],
      delivery_mode: ["teaser", "full", "rewrite"],
      distribution_status: [
        "queued",
        "processing",
        "needs_approval",
        "published",
        "failed",
        "blocked",
      ],
      fact_check_input_type: ["link", "text", "title", "image"],
      fact_check_status: [
        "NEW",
        "UNDER_REVIEW",
        "EDITORIAL_QUEUE",
        "REVIEWED",
        "PUBLISHED",
      ],
      fact_check_verdict: [
        "CONFIRMADO",
        "PROVAVELMENTE_VERDADEIRO",
        "ENGANOSO",
        "PROVAVELMENTE_FALSO",
        "FALSO",
        "NAO_VERIFICAVEL_AINDA",
      ],
      highlight_type: ["none", "home", "urgent", "featured"],
      imovel_finalidade: ["venda", "aluguel", "venda_aluguel"],
      imovel_status: [
        "rascunho",
        "pendente",
        "ativo",
        "vendido",
        "alugado",
        "inativo",
      ],
      imovel_tipo: [
        "casa",
        "apartamento",
        "terreno",
        "comercial",
        "chacara",
        "cobertura",
        "studio",
        "kitnet",
        "galpao",
        "sala_comercial",
      ],
      import_mode: ["manual", "auto", "auto_with_approval"],
      imported_article_status: ["inbox", "published", "rejected"],
      lead_imovel_status: [
        "novo",
        "contatado",
        "qualificado",
        "visita_agendada",
        "proposta",
        "fechado",
        "perdido",
      ],
      lead_intencao: ["comprar", "alugar", "investir", "avaliar"],
      lead_status: ["new", "contacted", "converted", "lost"],
      news_origin: ["manual", "ai"],
      news_status: [
        "draft",
        "scheduled",
        "published",
        "archived",
        "trash",
        "review",
        "approved",
      ],
      partnership_status: ["pending", "active", "suspended", "rejected"],
      pitch_status: ["sent", "approved", "rejected", "needs_info"],
      publidoor_campaign_status: ["draft", "active", "paused", "ended"],
      publidoor_item_status: ["draft", "review", "approved", "published"],
      publidoor_item_type: [
        "narrativo",
        "contextual",
        "geografico",
        "editorial",
        "impacto_total",
      ],
      site_user_role: ["admin", "editor", "journalist", "reviewer"],
      site_user_status: ["active", "pending", "suspended"],
      social_account_type: [
        "page",
        "business",
        "creator",
        "channel",
        "personal",
      ],
      social_origin_type: ["news", "ad", "publidoor", "campaign360", "manual"],
      social_platform: [
        "instagram",
        "facebook",
        "x",
        "linkedin",
        "tiktok",
        "youtube",
        "pinterest",
        "whatsapp",
        "telegram",
      ],
      social_post_status: [
        "draft",
        "scheduled",
        "processing",
        "done",
        "failed",
      ],
      social_target_status: [
        "draft",
        "scheduled",
        "queued",
        "processing",
        "done",
        "failed",
        "assisted",
      ],
      story_status: ["draft", "published", "archived"],
      style_profile_type: ["journalist", "site_default"],
      style_ref_kind: ["link", "txt", "pdf"],
      style_ref_status: ["uploaded", "ingested", "failed"],
      trusted_source_type: ["PRIMARY", "JOURNALISM", "CHECKER", "OTHER"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
