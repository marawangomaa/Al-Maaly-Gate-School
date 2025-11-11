export interface ClassDto {
  classYear: string;
  className: string;
  id?: string;
}

export interface ClassViewDto {
  id: string;
  classYear: string;
  className: string;
  teacherId: string;
  teacher: any;
  students: any[];
  classAssets: any[];
  classAppointments: any[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
