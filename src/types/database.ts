export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          resonance_rate: number;
          tags: string[];
          ai_comment: string;
          photo: string;
          portrait: Json;
          music: Json;
          fashion: Json;
          mood: Json;
          looking_for: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          name: string;
          resonance_rate: number;
          tags?: string[];
          ai_comment: string;
          photo: string;
          portrait: Json;
          music: Json;
          fashion: Json;
          mood: Json;
          looking_for: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          resonance_rate?: number;
          tags?: string[];
          ai_comment?: string;
          photo?: string;
          portrait?: Json;
          music?: Json;
          fashion?: Json;
          mood?: Json;
          looking_for?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      resonances: {
        Row: {
          id: string;
          from_member_id: string;
          to_member_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_member_id: string;
          to_member_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_member_id?: string;
          to_member_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          member_a_id: string;
          member_b_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_a_id: string;
          member_b_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_a_id?: string;
          member_b_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_member_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_member_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_member_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversation_reads: {
        Row: {
          conversation_id: string;
          member_id: string;
          last_read_at: string;
        };
        Insert: {
          conversation_id: string;
          member_id: string;
          last_read_at?: string;
        };
        Update: {
          conversation_id?: string;
          member_id?: string;
          last_read_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          frequency_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          frequency_color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          frequency_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bands: {
        Row: {
          id: string;
          name: string;
          accent_color: string | null;
          activity_status: string;
          created_by_member_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          accent_color?: string | null;
          activity_status?: string;
          created_by_member_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          accent_color?: string | null;
          activity_status?: string;
          created_by_member_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      band_members: {
        Row: {
          band_id: string;
          member_id: string;
          joined_at: string;
        };
        Insert: {
          band_id: string;
          member_id: string;
          joined_at?: string;
        };
        Update: {
          band_id?: string;
          member_id?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      band_timeline_events: {
        Row: {
          id: string;
          band_id: string;
          kind: string;
          title: string;
          body: string | null;
          occurred_at: string;
          activity_id: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          band_id: string;
          kind: string;
          title: string;
          body?: string | null;
          occurred_at?: string;
          activity_id?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          band_id?: string;
          kind?: string;
          title?: string;
          body?: string | null;
          occurred_at?: string;
          activity_id?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      band_activities: {
        Row: {
          id: string;
          band_id: string;
          author_member_id: string;
          kind: string;
          title: string | null;
          body: string | null;
          media_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          band_id: string;
          author_member_id: string;
          kind: string;
          title?: string | null;
          body?: string | null;
          media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          band_id?: string;
          author_member_id?: string;
          kind?: string;
          title?: string | null;
          body?: string | null;
          media_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      band_cover_songs: {
        Row: {
          id: string;
          band_id: string;
          added_by_member_id: string;
          artist: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          band_id: string;
          added_by_member_id: string;
          artist?: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          band_id?: string;
          added_by_member_id?: string;
          artist?: string;
          title?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      band_member_reads: {
        Row: {
          band_id: string;
          member_id: string;
          last_seen_at: string;
        };
        Insert: {
          band_id: string;
          member_id: string;
          last_seen_at?: string;
        };
        Update: {
          band_id?: string;
          member_id?: string;
          last_seen_at?: string;
        };
        Relationships: [];
      };
      live_events: {
        Row: {
          id: string;
          kind: string;
          title: string;
          subtitle: string | null;
          href: string;
          photo: string | null;
          actor_member_id: string | null;
          band_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: string;
          title: string;
          subtitle?: string | null;
          href: string;
          photo?: string | null;
          actor_member_id?: string | null;
          band_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: string;
          title?: string;
          subtitle?: string | null;
          href?: string;
          photo?: string | null;
          actor_member_id?: string | null;
          band_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      email_notification_preferences: {
        Row: {
          member_id: string;
          resonance_members: boolean;
          messages: boolean;
          band_recruitment: boolean;
          updated_at: string;
        };
        Insert: {
          member_id: string;
          resonance_members?: boolean;
          messages?: boolean;
          band_recruitment?: boolean;
          updated_at?: string;
        };
        Update: {
          member_id?: string;
          resonance_members?: boolean;
          messages?: boolean;
          band_recruitment?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      band_recruitment_applications: {
        Row: {
          id: string;
          target_member_id: string;
          applicant_member_id: string;
          part: string;
          part_normalized: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_member_id: string;
          applicant_member_id: string;
          part: string;
          part_normalized: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_member_id?: string;
          applicant_member_id?: string;
          part?: string;
          part_normalized?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      community_catalog_items: {
        Row: {
          id: string;
          catalog_key: string;
          value: string;
          value_normalized: string;
          created_by_member_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          catalog_key: string;
          value: string;
          value_normalized: string;
          created_by_member_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          catalog_key?: string;
          value?: string;
          value_normalized?: string;
          created_by_member_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_member_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
