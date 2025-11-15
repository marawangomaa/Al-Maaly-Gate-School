import { Injectable } from '@angular/core';
import { ApiResponse, ClassAppointmentDto, StudentClassAppointmentDto } from '../Interfaces/iclassappointment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class ClassappointmentService {

  private readonly apiUrl = `${environment.apiBaseUrl}/ClassAppointment`;

  constructor(private http: HttpClient) {}

  // ✅ GET: Appointments by Teacher
  getByTeacher(teacherId: string): Observable<ApiResponse<ClassAppointmentDto[]>> {
    return this.http.get<ApiResponse<ClassAppointmentDto[]>>(
      `${this.apiUrl}/teacher/${teacherId}`
    );
  }

  // ✅ GET: Student Appointments (by ClassId)
  getForStudent(classId: string): Observable<ApiResponse<StudentClassAppointmentDto[]>> {
    return this.http.get<ApiResponse<StudentClassAppointmentDto[]>>(
      `${this.apiUrl}/student/${classId}`
    );
  }

  // ✅ GET: ALL Appointments
  getAll(): Observable<ApiResponse<ClassAppointmentDto[]>> {
    return this.http.get<ApiResponse<ClassAppointmentDto[]>>(this.apiUrl);
  }

  // ✅ GET: Appointment by Id
  getById(id: string): Observable<ApiResponse<ClassAppointmentDto>> {
    return this.http.get<ApiResponse<ClassAppointmentDto>>(
      `${this.apiUrl}/${id}`
    );
  }

  // ✅ POST: Create Appointment
  create(dto: ClassAppointmentDto): Observable<ApiResponse<ClassAppointmentDto>> {
    return this.http.post<ApiResponse<ClassAppointmentDto>>(this.apiUrl, dto);
  }

  // ✅ PUT: Update Appointment
  update(id: string, dto: ClassAppointmentDto): Observable<ApiResponse<ClassAppointmentDto>> {
    return this.http.put<ApiResponse<ClassAppointmentDto>>(
      `${this.apiUrl}/${id}`,
      dto
    );
  }

  // ✅ DELETE: Appointment
  delete(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/${id}`
    );
  }
}
