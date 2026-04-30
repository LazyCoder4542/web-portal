export type Gender = "male" | "female";
export type AgeGroup = "child" | "teenager" | "adult" | "senior";
export type UserRole = "admin" | "analyst";

export type Profile = {
  id: string;
  name: string;
  gender: Gender;
  gender_probability: number;
  age: number;
  age_group: AgeGroup;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
};

export type User = {
  id: string;
  github_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
};

export type PaginatedResponse<T> = {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: {
    self: string;
    next: string | null;
    prev: string | null;
  };
  data: T[];
};

export type ProfilesQuery = {
  gender?: Gender;
  age_group?: AgeGroup;
  country_id?: string;
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
  sort_by?: "age" | "created_at" | "gender_probability";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};
