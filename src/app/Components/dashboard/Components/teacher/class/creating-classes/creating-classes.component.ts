import { ClassappointmentService } from './../../../../../../Services/classappointment.service';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ClassService } from '../../../../../../Services/class.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectService } from '../../../../../../Services/subject.service';

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
  classes: any[] = [];
  subjects: any[] = [];
  teacherId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private subjectService: SubjectService,
    private appointmentService: ClassappointmentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
    this.classService.getAll().subscribe(res => {
      this.classes = res.data;
      console.log(res);
      
    });

    this.subjectService.getAll().subscribe(res => {
      this.subjects = res.data;
      console.log(res);
      
    });
  }

  get f() {
    return this.classForm.controls;
  }

  createClass(): void {
    if (!this.teacherId) {
      alert('Teacher ID not found.');
      return;
    }

    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    const form = this.classForm.getRawValue();

    const body = {
      id: '',
      link: form.link,
      startTime: form.startTime,
      endTime: new Date(new Date(form.startTime).getTime() + form.duration * 60000).toISOString(),
      status: 'Scheduled',
      classId: form.classId,
      subjectId: form.subjectId,
      teacherId: this.teacherId
    };

    this.appointmentService.create(body).subscribe(() => {
      alert('Appointment created successfully!');
      this.classForm.reset({ duration: 60 });
    });
  }
}
