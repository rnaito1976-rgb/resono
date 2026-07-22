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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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
