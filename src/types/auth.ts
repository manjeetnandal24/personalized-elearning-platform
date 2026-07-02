export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
};

export type AuthData = {
  user: User;
  token: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: AuthData;
};

export type MeResponse = {
  success: boolean;
  data: {
    user: User;
  };
};