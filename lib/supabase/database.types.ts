export type Profile = {
  id: string;
  username: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type Recipe = {
  id: string;
  created_at: string | null;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  cooking_time: number | null;
  difficulty: string | null;
  category: string;
  instructions: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: Recipe;
        Insert: {
          id?: string;
          created_at?: string | null;
          user_id: string;
          title: string;
          description?: string | null;
          ingredients: string[];
          cooking_time?: number | null;
          difficulty?: string | null;
          category: string;
          instructions: string[];
        };
        Update: {
          id?: string;
          created_at?: string | null;
          user_id?: string;
          title?: string;
          description?: string | null;
          ingredients?: string[];
          cooking_time?: number | null;
          difficulty?: string | null;
          category?: string;
          instructions?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
