export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface CreateRoleRequest {
  roleName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
