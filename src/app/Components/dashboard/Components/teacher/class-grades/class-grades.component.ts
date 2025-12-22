import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ClassService } from '../../../../../Services/class.service';
import { DegreeService } from '../../../../../Services/degree.service';
import { TeacherService } from '../../../../../Services/teacher.service';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { SubjectViewDto } from '../../../../../Interfaces/isubject';
import { ServiceResult } from '../../../../../Interfaces/iteacher';

@Component({
  selector: 'app-class-grades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './class-grades.component.html',
  styleUrls: ['./class-grades.component.css']
})
export class ClassGradesComponent implements OnInit {
  teacherClasses: ClassViewDto[] = [];
  teacherSubjects: SubjectViewDto[] = [];
  teacherId: string = '';
  
  // Forms per class and per student
  classForms: { [classId: string]: { [studentId: string]: FormGroup } } = {};
  expandedClassId: string | null = null;
  expandedStudentId: { [classId: string]: string | null } = {};
  
  // Existing grades for students
  existingGrades: { [studentId: string]: any[] } = {};
  
  // Loading states
  isLoadingClasses = false;
  isLoadingSubjects = false;
  savingStudentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private degreeService: DegreeService,
    private classService: ClassService
  ) { }

  ngOnInit(): void {
    this.getTeacherIdFromLocalStorage();
    if (this.teacherId) {
      this.loadTeacherData();
    }
  }

  getTeacherIdFromLocalStorage(): void {
    // Check if running in browser (for SSR compatibility)
    if (typeof window !== 'undefined' && window.localStorage) {
      this.teacherId = localStorage.getItem('teacherId') || '';
      console.log('Teacher ID from localStorage:', this.teacherId);
    }
    
    if (!this.teacherId) {
      console.error('No teacherId found in localStorage');
      // Try alternative storage if needed
      if (typeof window !== 'undefined' && window.sessionStorage) {
        this.teacherId = sessionStorage.getItem('teacherId') || '';
        console.log('Teacher ID from sessionStorage:', this.teacherId);
      }
    }
  }

  loadTeacherData(): void {
    if (!this.teacherId) {
      console.error('Teacher ID is required');
      return;
    }

    console.log('Loading teacher data for ID:', this.teacherId);

    // Load teacher's classes
    this.isLoadingClasses = true;
    this.teacherService.getTeacherClasses(this.teacherId).subscribe({
      next: (res: ServiceResult<ClassViewDto[]>) => {
        console.log('Teacher classes response:', res);
        if (res.success) {
          this.teacherClasses = res.data || [];
          console.log('Teacher classes loaded:', this.teacherClasses.length, 'classes');
          
          if (this.teacherClasses.length > 0) {
            this.loadClassesDetails();
          } else {
            console.warn('Teacher has no classes assigned');
          }
        } else {
          console.error('Failed to load classes:', res.message);
        }
        this.isLoadingClasses = false;
      },
      error: (err: any) => {
        console.error('Error loading classes:', err);
        this.isLoadingClasses = false;
      }
    });

    // Load teacher's subjects
    this.isLoadingSubjects = true;
    this.teacherService.getTeacherSubjects(this.teacherId).subscribe({
      next: (res: ServiceResult<SubjectViewDto[]>) => {
        console.log('Teacher subjects response:', res);
        if (res.success) {
          this.teacherSubjects = res.data || [];
          console.log('Teacher subjects loaded:', this.teacherSubjects.length, 'subjects');
        } else {
          console.error('Failed to load subjects:', res.message);
        }
        this.isLoadingSubjects = false;
      },
      error: (err: any) => {
        console.error('Error loading subjects:', err);
        this.isLoadingSubjects = false;
      }
    });
  }

  loadClassesDetails(): void {
    // Initialize forms for each class
    this.teacherClasses.forEach(cls => {
      this.classForms[cls.id] = {};
      this.expandedStudentId[cls.id] = null;
      
      // Load students for this class
      this.classService.getStudentsByClass(cls.id).subscribe({
        next: (res: any) => {
          console.log(`Students for class ${cls.id}:`, res);
          const students = res.data || [];
          console.log(`Found ${students.length} students in class ${cls.id}`);
          
          // Initialize form for each student
          students.forEach((student: any) => {
            // Load existing grades for this student
            this.loadExistingGrades(student.id);
            
            // Create form for this student
            this.initializeStudentForm(cls.id, student);
          });
        },
        error: (err: any) => {
          console.error(`Error loading students for class ${cls.id}:`, err);
        }
      });
    });
  }

  loadExistingGrades(studentId: string): void {
    this.degreeService.getStudentDegrees(studentId).subscribe({
      next: (res: any) => {
        console.log(`Existing grades for student ${studentId}:`, res);
        if (res.success && res.data) {
          this.existingGrades[studentId] = res.data.degrees || [];
          console.log(`Loaded ${this.existingGrades[studentId].length} existing grades for student ${studentId}`);
        }
      },
      error: (err: any) => {
        console.error(`Error loading grades for student ${studentId}:`, err);
      }
    });
  }

  initializeStudentForm(classId: string, student: any): void {
    // Check if student already has existing grades
    const existingDegrees = this.existingGrades[student.id] || [];
    
    this.classForms[classId][student.id] = this.fb.group({
      studentId: [student.id],
      studentName: [student.fullName],
      classId: [classId],
      
      // Separate exams
      midterm1: this.createExamSubjects(this.teacherSubjects, 20, existingDegrees, 'Midterm1'),
      final1: this.createExamSubjects(this.teacherSubjects, 80, existingDegrees, 'Final1'),
      midterm2: this.createExamSubjects(this.teacherSubjects, 20, existingDegrees, 'Midterm2'),
      final2: this.createExamSubjects(this.teacherSubjects, 80, existingDegrees, 'Final2')
    });
    
    console.log(`Created form for student ${student.id} in class ${classId}`);
  }

  createExamSubjects(subjects: SubjectViewDto[], maxScore: number, existingDegrees: any[], examType: string): FormArray {
    const formArray = this.fb.array<FormGroup>([]);
    
    subjects.forEach(subject => {
      // Find existing grade for this subject and exam type
      const existingGrade = existingDegrees.find(
        (d: any) => d.subjectId === subject.id && d.degreeType === examType
      );
      
      const subjectGroup = this.fb.group({
        subjectId: [subject.id],
        subjectName: [subject.subjectName],
        score: [
          existingGrade?.score || 0,
          [Validators.required, Validators.min(0), Validators.max(maxScore)]
        ],
        maxScore: [maxScore]
      });
      
      formArray.push(subjectGroup);
    });
    
    return formArray;
  }

  // Get exam array from form
  getExamArray(studentForm: FormGroup, examName: string): FormArray {
    return studentForm.get(examName) as FormArray;
  }

  // Get student form for a class
  getStudentForm(classId: string, studentId: string): FormGroup {
    return this.classForms[classId][studentId];
  }

  // Get students for a class
  getStudentsForClass(classId: string): string[] {
    return Object.keys(this.classForms[classId] || {});
  }

  // Toggle class expansion
  toggleExpandClass(classId: string): void {
    this.expandedClassId = this.expandedClassId === classId ? null : classId;
  }

  // Toggle student expansion
  toggleExpandStudent(classId: string, studentId: string): void {
    this.expandedStudentId[classId] = 
      this.expandedStudentId[classId] === studentId ? null : studentId;
  }

  // Check if student has existing grades
  hasExistingGrades(studentId: string): boolean {
    return this.existingGrades[studentId] && this.existingGrades[studentId].length > 0;
  }

  // Get existing grade for display
  getExistingGrade(studentId: string, subjectId: string, examType: string): any {
    if (!this.existingGrades[studentId]) return null;
    
    return this.existingGrades[studentId].find(
      (grade: any) => 
        grade.subjectId === subjectId && 
        grade.degreeType === examType
    );
  }

  // Calculate total score for a student
  calculateStudentTotal(studentId: string): number {
    if (!this.existingGrades[studentId]) return 0;
    
    return this.existingGrades[studentId].reduce(
      (total: number, grade: any) => total + (grade.score || 0), 
      0
    );
  }

  // Calculate total possible for a student
  calculateStudentTotalPossible(studentId: string): number {
    if (!this.existingGrades[studentId]) return 0;
    
    return this.existingGrades[studentId].reduce(
      (total: number, grade: any) => total + (grade.maxScore || 0), 
      0
    );
  }

  // Save grades for a single student
  saveStudentGrades(classId: string, studentId: string): void {
    const studentForm = this.classForms[classId][studentId];
    
    if (studentForm.invalid) {
      alert('Please fill all fields correctly before saving.');
      return;
    }

    this.savingStudentId = studentId;
    
    const formValue = studentForm.getRawValue();
    const degrees: any[] = [];

    // Collect all exam types
    ['midterm1', 'final1', 'midterm2', 'final2'].forEach(examType => {
      const examArray = formValue[examType];
      if (examArray) {
        examArray.forEach((subjectGrade: any) => {
          if (subjectGrade.score > 0) { // Only add if score is entered
            degrees.push({
              subjectId: subjectGrade.subjectId,
              score: subjectGrade.score,
              maxScore: subjectGrade.maxScore,
              degreeType: this.mapExamTypeToDegreeType(examType)
            });
          }
        });
      }
    });

    if (degrees.length === 0) {
      alert('Please enter at least one score before saving.');
      this.savingStudentId = null;
      return;
    }

    const dto = {
      studentId: studentId,
      degrees: degrees
    };

    console.log('Saving degrees:', dto);

    this.degreeService.addDegrees(dto).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Reload existing grades
          this.loadExistingGrades(studentId);
          alert('Grades saved successfully!');
        } else {
          alert(`Failed to save grades: ${res.message}`);
        }
        this.savingStudentId = null;
      },
      error: (err: any) => {
        console.error('Error saving grades:', err);
        alert('Error saving grades. Please try again.');
        this.savingStudentId = null;
      }
    });
  }

  // Map form exam type to degree type
  private mapExamTypeToDegreeType(examType: string): string {
    const map: { [key: string]: string } = {
      'midterm1': 'Midterm1',
      'final1': 'Final1',
      'midterm2': 'Midterm2',
      'final2': 'Final2'
    };
    return map[examType] || examType;
  }
}