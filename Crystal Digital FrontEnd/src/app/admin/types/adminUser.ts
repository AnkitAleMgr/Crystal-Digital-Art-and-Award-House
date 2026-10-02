export type AdminRole = "admin" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface AdminUserCreate {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}
