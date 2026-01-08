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
      sites: {
        Row: {
          base_url: string
          created_at: string
          default_utm_medium_map: Json | null
          default_utm_source: string | null
          id: string
          name: string
          news_path_prefix: string | null
          owner_id: string | null
          primary_domain: string
          share_enabled: boolean | null
          short_domain: string | null
          updated_at: string
        }
        Insert: {
          base_url: string
          created_at?: string
          default_utm_medium_map?: Json | null
          default_utm_source?: string | null
          id?: string
          name: string
          news_path_prefix?: string | null
          owner_id?: string | null
          primary_domain: string
          share_enabled?: boolean | null
          short_domain?: string | null
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          default_utm_medium_map?: Json | null
          default_utm_source?: string | null
          id?: string
          name?: string
          news_path_prefix?: string | null
          owner_id?: string | null
          primary_domain?: string
          share_enabled?: boolean | null
          short_domain?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          created_at: string
          credentials_encrypted: Json | null
          enabled: boolean
          id: string
          platform: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials_encrypted?: Json | null
          enabled?: boolean
          id?: string
          platform: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials_encrypted?: Json | null
          enabled?: boolean
          id?: string
          platform?: string
          settings?: Json | null
          updated_at?: string
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
        Relationships: [
          {
            foreignKeyName: "social_logs_social_post_id_fkey"
            columns: ["social_post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          external_post_id: string | null
          external_post_url: string | null
          id: string
          news_id: string | null
          payload: Json | null
          platform: string
          posted_at: string | null
          retries_count: number
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_post_id?: string | null
          external_post_url?: string | null
          id?: string
          news_id?: string | null
          payload?: Json | null
          platform: string
          posted_at?: string | null
          retries_count?: number
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_post_id?: string | null
          external_post_url?: string | null
          id?: string
          news_id?: string | null
          payload?: Json | null
          platform?: string
          posted_at?: string | null
          retries_count?: number
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
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
      check_duplicate_news: {
        Args: { p_slug: string; p_source_url: string; p_title: string }
        Returns: {
          existing_id: string
          is_duplicate: boolean
          match_type: string
        }[]
      }
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
      increment_button_clicks: {
        Args: { p_button_id: string }
        Returns: undefined
      }
      increment_link_clicks: { Args: { p_link_id: string }; Returns: undefined }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
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
