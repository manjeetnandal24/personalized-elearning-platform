export type UserRole = "STUDENT" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
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