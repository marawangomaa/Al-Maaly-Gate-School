import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ClassAppointmentsService } from '../../../../../Services/class-appointments.service';
import { iclassAppointments } from '../../../../../Interfaces/iclassAppointments';
import { ApiResponse } from '../../../../../Interfaces/auth';

@Component({
  selector: 'app-student-classes',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-classes.component.html',
  styleUrl: './student-classes.component.css'
})
export class StudentClassesComponent implements OnInit {
  classes?: iclassAppointments[];
  _ClassAppointments = inject(ClassAppointmentsService);


  ngOnInit(): void {
    this.getClassAppointments();
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

  attendLecture(lecture: any) {
    if (lecture.canAttend) {
      lecture.attended = true;
      alert(`تم تسجيل حضورك في محاضرة ${lecture.subject}`);
    }
  }

  getClassAppointments() {
    this._ClassAppointments.GetClassAppointmentsForStudent("ecc98cc7-debe-486e-863a-7c2b032ffc2e").subscribe({
      next: (response: ApiResponse<iclassAppointments[]>) => {
        this.classes = response.data;
        console.log(response.data, response.success);
      },
      error: (error: ApiResponse<iclassAppointments>) => {
        console.log(error.message || error);
      }
    })
  }

}
