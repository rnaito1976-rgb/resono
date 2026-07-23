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
