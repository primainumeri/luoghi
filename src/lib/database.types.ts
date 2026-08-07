// Tipi del database Supabase.
// NOTA: file provvisorio scritto a mano per l'MVP. In seguito potrà essere
// rigenerato con `supabase gen types typescript` una volta applicate le migrazioni.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          label: string;
          color: string;
          icon: string | null;
          types: string[];
          active: boolean;
          sort: number;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          color?: string;
          icon?: string | null;
          types?: string[];
          active?: boolean;
          sort?: number;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      places: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          description: string | null;
          type: string;
          category_id: string;
          proposal: string | null;
          public_status: string;
          geom: unknown;
          location_label: string | null;
          first_observed: string | null;
          published_at: string;
          updated_at: string;
          source_submission_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          description?: string | null;
          type: string;
          category_id: string;
          proposal?: string | null;
          public_status?: string;
          geom: unknown;
          location_label?: string | null;
          first_observed?: string | null;
          published_at?: string;
          updated_at?: string;
          source_submission_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['places']['Insert']>;
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          category_id: string;
          proposal: string | null;
          geom: unknown;
          location_label: string | null;
          first_observed: string | null;
          internal_status: string;
          reject_reason: string | null;
          created_at: string;
          moderated_at: string | null;
          moderator_id: string | null;
          honeypot: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: string;
          category_id: string;
          proposal?: string | null;
          geom: unknown;
          location_label?: string | null;
          first_observed?: string | null;
          internal_status?: string;
          reject_reason?: string | null;
          created_at?: string;
          moderated_at?: string | null;
          moderator_id?: string | null;
          honeypot?: string | null;
        };
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>;
        Relationships: [];
      };
      submitter_contacts: {
        Row: {
          submission_id: string;
          email: string;
          consent: boolean;
          created_at: string;
        };
        Insert: {
          submission_id: string;
          email: string;
          consent?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['submitter_contacts']['Insert']>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          submission_id: string | null;
          place_id: string | null;
          bucket: string;
          path: string;
          mime: string;
          size: number;
          width: number | null;
          height: number | null;
          status: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id?: string | null;
          place_id?: string | null;
          bucket: string;
          path: string;
          mime: string;
          size: number;
          width?: number | null;
          height?: number | null;
          status?: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
        Relationships: [];
      };
      place_updates: {
        Row: {
          id: string;
          place_id: string;
          old_status: string | null;
          new_status: string;
          note: string | null;
          moderator_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          old_status?: string | null;
          new_status: string;
          note?: string | null;
          moderator_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['place_updates']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: string;
          display_name: string | null;
          active: boolean;
        };
        Insert: {
          id: string;
          role?: string;
          display_name?: string | null;
          active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      moderation_log: {
        Row: {
          id: string;
          moderator_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          detail: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moderator_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          detail?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['moderation_log']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      places_public: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          description: string | null;
          type: string;
          category_id: string;
          proposal: string | null;
          public_status: string;
          lng: number;
          lat: number;
          location_label: string | null;
          first_observed: string | null;
          published_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_moderator: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      submit_report: {
        Args: {
          p_title: string;
          p_description: string;
          p_type: string;
          p_category_id: string;
          p_proposal: string | null;
          p_lng: number;
          p_lat: number;
          p_location_label: string | null;
          p_first_observed: string | null;
          p_email: string;
          p_consent: boolean;
          p_media_paths: string[];
        };
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      reject_submission: {
        Args: { p_submission_id: string; p_reason: string };
        Returns: undefined;
      };
      publish_submission: {
        Args: {
          p_submission_id: string;
          p_title: string;
          p_summary: string | null;
          p_description: string | null;
          p_proposal: string | null;
          p_public_status: string;
        };
        Returns: string;
      };
      set_place_status: {
        Args: { p_place_id: string; p_status: string; p_note: string | null };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
