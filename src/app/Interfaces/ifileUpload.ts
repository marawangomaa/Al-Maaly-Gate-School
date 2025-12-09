// Frontend representation of a file (simplified)
export interface ifileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}