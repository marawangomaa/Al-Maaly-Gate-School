import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ClassAppointmentsService } from '../../../../../Services/class-appointments.service';
import { iclassAppointments } from '../../../../../Interfaces/iclassAppointments';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StudentService } from '../../../../../Services/student.service';

@Component({
  selector: 'app-student-classes',
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './student-classes.component.html',
  styleUrl: './student-classes.component.css'
})
export class StudentClassesComponent implements OnInit {
  classId: string | null = null;
  classes?: iclassAppointments[];
  _ClassAppointments = inject(ClassAppointmentsService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private translate = inject(TranslateService);

  constructor(
    private AuthService: AuthService,
    private route: ActivatedRoute,
    private StudentService: StudentService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const studentId = localStorage.getItem('studentId')!;
      this.GetStudentEntity(studentId);
    }
  }

  GetStudentEntity(studentId: string) {
    this.StudentService.GetStudentEntity(studentId).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success && response.data) {
          this.classId = response.data.classId;
          this.getClassAppointments();
          return response.data.id;
        } else {
          // console.error(this.translate.instant('STUDENT_CLASSES_TS.ERRORS.FAILED_TO_GET_STUDENT_ID'), response.message);
          return null;
        }
      },
      error: (error: ApiResponse<any>) => {
        // console.error(this.translate.instant('STUDENT_CLASSES_TS.ERRORS.FAILED_TO_GET_STUDENT_ID'), error.message || error);
        return null;
      }
    });
  }

  filter: 'all' | 'Running' | 'Finished' | 'Upcoming' = 'all';

  get filteredLectures() {
    switch (this.filter) {
      case 'Running':
        return this.classes?.filter(l => l.status === 'Running');
      case 'Finished':
        return this.classes?.filter(l => l.status === 'Finished');
      case 'Upcoming':
        return this.classes?.filter(l => l.status === 'Upcoming');
      default:
        return this.classes;
    }
  }

  attendLecture(lecture: iclassAppointments) {
    window.open(lecture.link, '_blank');
  }

  openLectureLink(lecture: iclassAppointments) {
    if (lecture.link && (lecture.status === 'Running' || lecture.status === 'Upcoming')) {
      // Open link in new tab
      window.open(lecture.link, '_blank');
    } else {
      alert(this.translate.instant('STUDENT_CLASSES.NO_LINK_AVAILABLE'));
    }
  }

  getClassAppointments() {
    if (!this.classId) {
      // console.error(this.translate.instant('STUDENT_CLASSES_TS.ERRORS.NO_CLASS_ID'));
      return;
    }

    this._ClassAppointments.GetClassAppointmentsForStudent(this.classId).subscribe({
      next: (response: ApiResponse<iclassAppointments[]>) => {
        if (response.success && response.data) {
          this.classes = response.data;
          // console.log(this.translate.instant('STUDENT_CLASSES_TS.INFO.APPOINTMENTS_LOADED'), response.data);
          // console.log(this.translate.instant('STUDENT_CLASSES_TS.INFO.TOTAL_APPOINTMENTS'), response.data.length);
        } else {
          // console.log(this.translate.instant('STUDENT_CLASSES_TS.ERRORS.NO_APPOINTMENTS'), response.message);
          this.classes = [];
        }
      },
      error: (error: ApiResponse<iclassAppointments>) => {
        // console.error(this.translate.instant('STUDENT_CLASSES_TS.ERRORS.LOADING_ERROR'), error.message || error);
        this.classes = [];
      }
    });
  }
}