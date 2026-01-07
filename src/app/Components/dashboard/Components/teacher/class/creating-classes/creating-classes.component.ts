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
  classes: ClassViewDto[] | undefined= [];
  subjects: SubjectViewDto[] | undefined= [];
  teacherId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private subjectService: SubjectService,
    private appointmentService: ClassappointmentService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    private teacherService: TeacherService
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

    this.loadDropdowns();
  }

  loadDropdowns(): void {

    this.teacherService.getTeacherClasses(this.teacherId).subscribe(res => {
      this.classes = res.data;
      console.log(res);
    });

    this.teacherService.getTeacherSubjects(this.teacherId).subscribe(res => {
      this.subjects = res.data;
      console.log(res);
    });
  }

  get f() {
    return this.classForm.controls;
  }

  createClass(): void {
    if (!this.teacherId) {
      alert(this.translate.instant('CLASSES.ALERTS.TEACHER_ID_NOT_FOUND'));
      return;
    }

    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    const form = this.classForm.getRawValue();

    // FIX: Handle timezone issue - get local time components
    const localStartDate = new Date(form.startTime);

    // Get local time components (without timezone conversion)
    const localStartTimeString = this.formatLocalTime(localStartDate);

    // Calculate end time
    const localEndDate = new Date(localStartDate.getTime() + form.duration * 60000);
    const localEndTimeString = this.formatLocalTime(localEndDate);

    const body = {
      id: '',
      link: form.link,
      startTime: localStartTimeString, // Use local time string
      endTime: localEndTimeString,     // Use local time string
      status: 'Scheduled',
      classId: form.classId,
      subjectId: form.subjectId,
      teacherId: this.teacherId
    };

    console.log('Creating appointment with:', body); // Debug log

    this.appointmentService.create(body).subscribe(() => {
      alert(this.translate.instant('CLASSES.ALERTS.APPOINTMENT_CREATED'));
      this.classForm.reset({ duration: 60 });
    });
  }

  // Helper method to format date in local time without timezone offset
  private formatLocalTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format: YYYY-MM-DDTHH:mm:ss (local time)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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