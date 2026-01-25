import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ClassappointmentService } from '../../../../../../Services/classappointment.service';
import { ClassAppointmentDto } from '../../../../../../Interfaces/iclassappointment';
import { ToastService } from '../../../../../../Services/UtilServices/toast.service';

export interface ClassAppointmentView {
  id: string;
  grade: string;
  section: string;
  subject: string;
  meetingLink: string;
  startTime: string;
  duration: number;
  ended: boolean;
}

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, NgIf, DatePipe, TranslateModule],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.css'
})
export class ClassListComponent {
  classes$!: Observable<ClassAppointmentView[]>;

  constructor(
    private classAppointmentService: ClassappointmentService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    const teacherId = localStorage.getItem('teacherId') || '';

    this.classes$ = this.classAppointmentService.getByTeacher(teacherId).pipe(
      map(response => {
        // console.log('Raw data from API:', response.data); // <-- debug the raw data

        return response.data.map((appt: ClassAppointmentDto) => {
          const start = new Date(appt.startTime);
          const end = new Date(appt.endTime);
          const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

          const mapped: ClassAppointmentView = {
            id: appt.id,
            grade: '', // Optional: replace if your backend returns it
            section: '', // Optional: replace if your backend returns it
            subject: appt.subjectId, // <-- we only have the id, maybe backend returns subjectName separately?
            meetingLink: appt.link || '',
            startTime: appt.startTime,
            duration,
            ended: appt.status.toLowerCase() === 'ended'
          };

          // console.log('Mapped appointment:', mapped); // <-- debug each mapped object
          return mapped;
        });
      })
    );
  }


  endClass(id: string) {
    // Get the appointment by ID to keep other fields intact
    this.classAppointmentService.getById(id).subscribe(res => {
      if (res.success && res.data) {
        const updated: ClassAppointmentDto = {
          ...res.data,
          status: 'Ended'
        };
        this.classAppointmentService.update(id, updated).subscribe(() => {
          // Reload the list after ending the class
          this.ngOnInit();
        });
      }
    });
  }
}
