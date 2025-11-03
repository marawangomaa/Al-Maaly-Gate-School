import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Student {
  id: string;
  name: string;
}

interface ClassModel {
  id: string;
  grade: string;
  section: string;
  subject: string;
  students: Student[];
}

@Component({
  selector: 'app-class-grades',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './class-grades.component.html',
  styleUrl: './class-grades.component.css'
})
export class ClassGradesComponent {
  classes: ClassModel[] = [];
  gradeForms: { [classId: string]: FormGroup } = {};
  expandedClassId: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Simulated data (later you can fetch from service)
    this.classes = [
      {
        id: '1',
        grade: 'Grade 2',
        section: 'A',
        subject: 'Math',
        students: [
          { id: 's1', name: 'Ahmed Hassan' },
          { id: 's2', name: 'Mona Khaled' },
        ],
      },
      {
        id: '2',
        grade: 'Grade 3',
        section: 'B',
        subject: 'Science',
        students: [
          { id: 's3', name: 'Ali Ibrahim' },
          { id: 's4', name: 'Sara Mostafa' },
        ],
      },
    ];

    // Create form for each class
    this.classes.forEach((cls) => {
      this.gradeForms[cls.id] = this.fb.group({
        students: this.fb.array(
          cls.students.map((s) =>
            this.fb.group({
              studentId: [s.id],
              name: [s.name],
              testGrade: [null],
              midtermGrade: [null],
              attendance: [null],
            })
          )
        ),
      });
    });
  }

  getStudentArray(classId: string): FormArray {
    return this.gradeForms[classId].get('students') as FormArray;
  }

  toggleExpand(classId: string): void {
    this.expandedClassId = this.expandedClassId === classId ? null : classId;
  }

  saveGrades(classId: string): void {
    const formValue = this.gradeForms[classId].getRawValue();
    console.log('Saved grades for class:', classId, formValue);
    alert('Grades saved successfully!');
  }
}
