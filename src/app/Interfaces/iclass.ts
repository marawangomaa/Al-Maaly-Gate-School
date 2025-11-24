import { iclassAppointments } from "./iclassAppointments";
import { istudent } from "./istudent";
import { Teacher } from "./teacher";

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
  teachers: Teacher[];
  students: istudent[];
  classAssets: any[];
  classAppointments: iclassAppointments[];
}


export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
