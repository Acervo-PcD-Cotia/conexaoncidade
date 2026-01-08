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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_tenant_id_fkey"
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
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          published_at: string | null
          slug: string
          status: string | null
          tenant_id: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          published_at?: string | null
          slug: string
          status?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tenant_id?: string | null
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "news_tenant_id_fkey"
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
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials_encrypted?: Json | null
          enabled?: boolean
          id?: string
          platform: string
          settings?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials_encrypted?: Json | null
          enabled?: boolean
          id?: string
          platform?: string
          settings?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "social_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_banners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
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
        | "commercial"
        | "financial"
        | "support"
      article_kind: "original" | "imported" | "rewritten" | "edited"
      delivery_mode: "teaser" | "full" | "rewrite"
      distribution_status:
        | "queued"
        | "processing"
        | "needs_approval"
        | "published"
        | "failed"
        | "blocked"
      highlight_type: "none" | "home" | "urgent" | "featured"
      import_mode: "manual" | "auto" | "auto_with_approval"
      imported_article_status: "inbox" | "published" | "rejected"
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
      site_user_role: "admin" | "editor" | "journalist" | "reviewer"
      site_user_status: "active" | "pending" | "suspended"
      story_status: "draft" | "published" | "archived"
      style_profile_type: "journalist" | "site_default"
      style_ref_kind: "link" | "txt" | "pdf"
      style_ref_status: "uploaded" | "ingested" | "failed"
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
        "commercial",
        "financial",
        "support",
      ],
      article_kind: ["original", "imported", "rewritten", "edited"],
      delivery_mode: ["teaser", "full", "rewrite"],
      distribution_status: [
        "queued",
        "processing",
        "needs_approval",
        "published",
        "failed",
        "blocked",
      ],
      highlight_type: ["none", "home", "urgent", "featured"],
      import_mode: ["manual", "auto", "auto_with_approval"],
      imported_article_status: ["inbox", "published", "rejected"],
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
      site_user_role: ["admin", "editor", "journalist", "reviewer"],
      site_user_status: ["active", "pending", "suspended"],
      story_status: ["draft", "published", "archived"],
      style_profile_type: ["journalist", "site_default"],
      style_ref_kind: ["link", "txt", "pdf"],
      style_ref_status: ["uploaded", "ingested", "failed"],
    },
  },
} as const
