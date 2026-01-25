import { ClassappointmentService } from './../../../../../../Services/classappointment.service';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ClassService } from '../../../../../../Services/class.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SubjectService } from '../../../../../../Services/subject.service';
import { TeacherService } from '../../../../../../Services/teacher.service';
import { ClassViewDto } from '../../../../../../Interfaces/iclass';
import { SubjectViewDto } from '../../../../../../Interfaces/isubject';
import { ToastService } from '../../../../../../Services/UtilServices/toast.service';
import { error } from 'node:console';

interface ClassFormModel {
  classId: FormControl<string>;
  subjectId: FormControl<string>;
  link: FormControl<string>;
  startTime: FormControl<string>;
  duration: FormControl<number>;
}

@Component({
  selector: 'app-creating-classes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './creating-classes.component.html',
  styleUrls: ['./creating-classes.component.css'],
})
export class CreatingClassesComponent implements OnInit {

  classForm!: FormGroup<ClassFormModel>;
  classes: ClassViewDto[] | undefined = [];
  subjects: SubjectViewDto[] | undefined = [];
  teacherId: string | null = null;

  isConfirmModalOpen: boolean = false;
  confirmModalMessage: string = '';
  private confirmAction?: () => void;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private subjectService: SubjectService,
    private appointmentService: ClassappointmentService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    private teacherService: TeacherService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {

    // ✅ SSR-safe teacherId read
    if (isPlatformBrowser(this.platformId)) {
      this.teacherId = localStorage.getItem('teacherId');
    }

    this.classForm = this.fb.group<ClassFormModel>({
      classId: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      subjectId: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      link: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^https?:\/\//)], nonNullable: true }),
      startTime: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      duration: this.fb.control(60, { validators: [Validators.required, Validators.min(10)], nonNullable: true }),
    });
    const now = new Date();
    this.classForm.controls.startTime.setValue(this.formatLocalTime(now));

    this.loadDropdowns();
  }

  //Modal  Methods
  openConfirmAsync(message: string, action: () => Promise<void>): void {
    this.confirmModalMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }
  openConfirm(message: string, action: () => void): void {
    this.confirmModalMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  confirmYes(): void {
    this.confirmAction?.();
    this.closeConfirm();
  }

  closeConfirm(): void {
    this.isConfirmModalOpen = false;
    this.confirmModalMessage = '';
    this.confirmAction = undefined;
  }

  loadDropdowns(): void {

    this.teacherService.getTeacherClasses(this.teacherId).subscribe(res => {
      this.classes = res.data;
      // console.log(res);
    });

    this.teacherService.getTeacherSubjects(this.teacherId).subscribe(res => {
      this.subjects = res.data;
      // console.log(res);
    });
  }

  get f() {
    return this.classForm.controls;
  }
  createClass(): void {
    const confirmMsg = this.translate.instant('Confirm creating this class?');

    if (!this.teacherId) {
      this.toastService.error(this.translate.instant('CLASSES.ALERTS.TEACHER_ID_NOT_FOUND'), 'Error');
      return;
    }

    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    const form = this.classForm.getRawValue();

    const start = new Date(form.startTime);

    const end = new Date(start.getTime() + form.duration * 60000);

    const body = {
      id: '',
      link: form.link,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'Scheduled',
      classId: form.classId,
      subjectId: form.subjectId,
      teacherId: this.teacherId
    };

    // console.log('Creating appointment with:', body); // Debug log
    this.openConfirm(confirmMsg, () => {
      this.appointmentService.create(body).subscribe(() => {
        next: () => {
          this.toastService.created(this.translate.instant('CLASSES.ALERTS.APPOINTMENT_CREATED'), 'Success');
          this.classForm.reset({ duration: 60 });
        };
        error: (err: any) => {
          // console.error('Error creating appointment:', err);
          this.toastService.error(this.translate.instant('CLASSES.ALERTS.ERROR_CREATING_APPOINTMENT'), 'Error');
        };
      });
    });
  }

  // Helper method to format date in local time without timezone offset
  private formatLocalTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Format: YYYY-MM-DDTHH:mm(local time)
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Alternative: If your backend expects UTC, use this method
  private formatToUTC(date: Date): string {
    // Get UTC time components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format: YYYY-MM-DDTHH:mm:ssZ (UTC)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  }
}