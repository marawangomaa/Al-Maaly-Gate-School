// models/auth-response.model.ts
export interface AuthResponse {
  userId: string;
  token: string;
  refreshToken: string;
  email: string;
  fullName: string;
  userName: string;
  roles: string[];
  profileImageUrl?: string;
  roleEntityIds?: { [key: string]: string };
  accountStatus: string;
  requiresConfirmation: boolean;
}

// models/update-profile-request.model.ts
export interface UpdateProfileRequest {
  fullName: string;
  contactInfo: string;
}

// models/change-password-request.model.ts
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// models/api-response.model.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  errors?: string[];
}

// models/file-upload-response.model.ts
export interface FileUploadResponse {
  success: boolean;
  data?: string;
  message?: string;
}

// models/file-record.model.ts
export interface FileRecord {
  id: string;
  fileName: string;
  fileSize: number;
  relativePath: string;
  absolutePath: string;
  fileType?: string;
  uploadedAt: Date;
  userId: string;
}