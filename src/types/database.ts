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
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
