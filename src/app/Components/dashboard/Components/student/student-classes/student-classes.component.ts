import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ClassAppointmentsService } from '../../../../../Services/class-appointments.service';
import { iclassAppointments } from '../../../../../Interfaces/iclassAppointments';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-classes',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-classes.component.html',
  styleUrl: './student-classes.component.css'
})
export class StudentClassesComponent implements OnInit {
  classes?: iclassAppointments[];
  _ClassAppointments = inject(ClassAppointmentsService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(
    private AuthService: AuthService,
    private route: ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Try to get classId from route parameters first
    this.route.paramMap.subscribe(params => {
      this.classId = params.get('classId') || '';
      if (this.classId) {
        this.getClassAppointments();
      }
    });

    // If no route parameter, try localStorage (only in browser)
    if (!this.classId && this.isBrowser) {
      const storedClassId = localStorage.getItem('studentClassId');
      if (storedClassId) {
        this.classId = storedClassId;
        this.getClassAppointments();
      } else {
        console.warn('No class ID found in route parameters or localStorage');
      }
    }
  }

  classId: string = '';
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

  attendLecture(lecture: any) {
    if (lecture.canAttend) {
      lecture.attended = true;
      alert(`تم تسجيل حضورك في محاضرة ${lecture.subject}`);
    }
  }

  getClassAppointments() {
    if (!this.classId) {
      console.error('Cannot get appointments: classId is empty');
      return;
    }

    this._ClassAppointments.GetClassAppointmentsForStudent(this.classId).subscribe({
      next: (response: ApiResponse<iclassAppointments[]>) => {
        if (response.success && response.data) {
          this.classes = response.data;
          console.log('Appointments loaded:', response.data);
          console.log('Total appointments:', response.data.length);
        } else {
          console.log('No appointments found:', response.message);
          this.classes = [];
        }
      },
      error: (error: ApiResponse<iclassAppointments>) => {
        console.error('Error loading appointments:', error.message || error);
        this.classes = [];
      }
    });
  }
}