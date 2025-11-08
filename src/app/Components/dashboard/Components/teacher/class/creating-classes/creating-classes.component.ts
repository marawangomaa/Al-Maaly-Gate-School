import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ClassService } from '../../../../../../Services/class.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface ClassFormModel {
  grade: FormControl<string>;
  section: FormControl<string>;
  subject: FormControl<string>;
  meetingLink: FormControl<string>;
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

  constructor(private fb: FormBuilder, private classService: ClassService) {}

  ngOnInit(): void {
    this.classForm = this.fb.group<ClassFormModel>({
      grade: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      section: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      subject: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      meetingLink: this.fb.control('', {
        validators: [Validators.required, Validators.pattern(/^https?:\/\//)],
        nonNullable: true,
      }),
      startTime: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      duration: this.fb.control(60, {
        validators: [Validators.required, Validators.min(10)],
        nonNullable: true,
      }),
    });
  }

  get f() {
    return this.classForm.controls;
  }

  createClass(): void {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    this.classService.addClass(this.classForm.getRawValue());
    alert('Class created successfully!');
    this.classForm.reset({ duration: 60 });
  }
}
