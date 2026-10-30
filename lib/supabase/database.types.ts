export type Profile = {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
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

export type RecipeLike = {
  id: string;
  created_at: string;
  user_id: string;
  recipe_id: string;
};

export type RecipeComment = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  recipe_id: string;
  body: string;
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
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          bio?: string | null;
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
      recipe_likes: {
        Row: RecipeLike;
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          recipe_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_comments: {
        Row: RecipeComment;
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          recipe_id: string;
          body: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          recipe_id?: string;
          body?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
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
