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
import { ShortenIdPipe } from '../../../../../Pipes/shorten-id.pipe';

@Component({
  selector: 'app-class-grades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ShortenIdPipe], // Add pipe here
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
  allExpanded = false;
  
  // Active exam type for tabs
  activeExamType: 'midterm1' | 'final1' | 'midterm2' | 'final2' = 'midterm1';
  
  // Existing grades for students
  existingGrades: { [studentId: string]: any[] } = {};
  studentDrafts: { [studentId: string]: any } = {};
  
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
    
    // Check for saved drafts
    this.loadDrafts();
  }

  getTeacherIdFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.teacherId = localStorage.getItem('teacherId') || '';
    }
    
    if (!this.teacherId && typeof window !== 'undefined' && window.sessionStorage) {
      this.teacherId = sessionStorage.getItem('teacherId') || '';
    }
  }

  loadDrafts(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const drafts = localStorage.getItem('gradeDrafts');
      if (drafts) {
        this.studentDrafts = JSON.parse(drafts);
      }
    }
  }

  saveDraft(classId: string, studentId: string): void {
    const formData = this.classForms[classId][studentId].getRawValue();
    this.studentDrafts[studentId] = formData;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('gradeDrafts', JSON.stringify(this.studentDrafts));
    }
  }

  loadTeacherData(): void {
    if (!this.teacherId) {
      console.error('Teacher ID is required');
      return;
    }

    // Load teacher's classes
    this.isLoadingClasses = true;
    this.teacherService.getTeacherClasses(this.teacherId).subscribe({
      next: (res: ServiceResult<ClassViewDto[]>) => {
        if (res.success) {
          this.teacherClasses = res.data || [];
          if (this.teacherClasses.length > 0) {
            this.loadClassesDetails();
          }
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
        if (res.success) {
          this.teacherSubjects = res.data || [];
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
    this.teacherClasses.forEach(cls => {
      this.classForms[cls.id] = {};
      this.expandedStudentId[cls.id] = null;
      
      this.classService.getStudentsByClass(cls.id).subscribe({
        next: (res: any) => {
          const students = res.data || [];
          students.forEach((student: any) => {
            this.loadExistingGrades(student.id);
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
        if (res.success && res.data) {
          this.existingGrades[studentId] = res.data.degrees || [];
        }
      },
      error: (err: any) => {
        console.error(`Error loading grades for student ${studentId}:`, err);
      }
    });
  }

  initializeStudentForm(classId: string, student: any): void {
    const existingDegrees = this.existingGrades[student.id] || [];
    const draftData = this.studentDrafts[student.id];
    
    this.classForms[classId][student.id] = this.fb.group({
      studentId: [student.id],
      studentName: [student.fullName],
      classId: [classId],
      useComponents: [false],
      
      midterm1: this.createExamSubjects(this.teacherSubjects, 20, existingDegrees, 'Midterm1', draftData?.midterm1),
      final1: this.createExamSubjects(this.teacherSubjects, 80, existingDegrees, 'Final1', draftData?.final1),
      midterm2: this.createExamSubjects(this.teacherSubjects, 20, existingDegrees, 'Midterm2', draftData?.midterm2),
      final2: this.createExamSubjects(this.teacherSubjects, 80, existingDegrees, 'Final2', draftData?.final2)
    });
  }

  createExamSubjects(
    subjects: SubjectViewDto[], 
    maxScore: number, 
    existingDegrees: any[], 
    examType: string,
    draftData?: any[]
  ): FormArray {
    const formArray = this.fb.array<FormGroup>([]);
    
    subjects.forEach((subject, index) => {
      const existingGrade = existingDegrees.find(
        (d: any) => d.subjectId === subject.id && d.degreeType === examType
      );
      
      const draftSubject = draftData?.[index];
      const hasComponents = draftSubject?.useComponents || false;
      
      const subjectGroup = this.fb.group({
        subjectId: [subject.id],
        subjectName: [subject.subjectName],
        useComponents: [hasComponents],
        
        // Simple score
        score: [
          draftSubject?.score || existingGrade?.score || 0,
          [Validators.min(0), Validators.max(maxScore)]
        ],
        maxScore: [maxScore],
        
        // Component scores
        oralScore: [draftSubject?.oralScore || existingGrade?.oralScore || 0, [Validators.min(0)]],
        oralMaxScore: [draftSubject?.oralMaxScore || existingGrade?.oralMaxScore || 0, [Validators.min(0)]],
        examScore: [draftSubject?.examScore || existingGrade?.examScore || 0, [Validators.min(0)]],
        examMaxScore: [draftSubject?.examMaxScore || existingGrade?.examMaxScore || 0, [Validators.min(0)]],
        practicalScore: [draftSubject?.practicalScore || existingGrade?.practicalScore || 0, [Validators.min(0)]],
        practicalMaxScore: [draftSubject?.practicalMaxScore || existingGrade?.practicalMaxScore || 0, [Validators.min(0)]]
      });
      
      // Disable component fields if not using components
      if (!hasComponents) {
        ['oralScore', 'oralMaxScore', 'examScore', 'examMaxScore', 'practicalScore', 'practicalMaxScore'].forEach(field => {
          subjectGroup.get(field)?.disable();
        });
      }
      
      formArray.push(subjectGroup);
    });
    
    return formArray;
  }

  // Get active exam array based on selected tab
  getActiveExamArray(classId: string, studentId: string): FormArray {
    return this.classForms[classId][studentId].get(this.activeExamType) as FormArray;
  }

  getActiveDegreeType(): string {
    const map: { [key: string]: string } = {
      'midterm1': 'Midterm1',
      'final1': 'Final1',
      'midterm2': 'Midterm2',
      'final2': 'Final2'
    };
    return map[this.activeExamType] || this.activeExamType;
  }

  getStudentForm(classId: string, studentId: string): FormGroup {
    return this.classForms[classId][studentId];
  }

  getStudentsForClass(classId: string): string[] {
    return Object.keys(this.classForms[classId] || {});
  }

  toggleExpandClass(classId: string): void {
    this.expandedClassId = this.expandedClassId === classId ? null : classId;
  }

  toggleExpandStudent(classId: string, studentId: string): void {
    this.expandedStudentId[classId] = 
      this.expandedStudentId[classId] === studentId ? null : studentId;
  }

  toggleAllStudents(): void {
    this.allExpanded = !this.allExpanded;
    if (this.allExpanded) {
      this.teacherClasses.forEach(cls => {
        this.expandedClassId = cls.id;
        this.getStudentsForClass(cls.id).forEach(studentId => {
          this.expandedStudentId[cls.id] = studentId;
        });
      });
    } else {
      this.expandedClassId = null;
      this.teacherClasses.forEach(cls => {
        this.expandedStudentId[cls.id] = null;
      });
    }
  }

  setActiveExamType(examType: 'midterm1' | 'final1' | 'midterm2' | 'final2'): void {
    this.activeExamType = examType;
  }

  toggleComponents(classId: string, studentId: string, event: any): void {
    const useComponents = event.target.checked;
    const form = this.classForms[classId][studentId];
    form.get('useComponents')?.setValue(useComponents);
    
    // Update all subjects in all exam types
    ['midterm1', 'final1', 'midterm2', 'final2'].forEach(examType => {
      const examArray = form.get(examType) as FormArray;
      examArray.controls.forEach(control => {
        const subjectFormGroup = control as FormGroup; // Cast to FormGroup
        subjectFormGroup.get('useComponents')?.setValue(useComponents);
        this.toggleSubjectComponents(subjectFormGroup, useComponents);
      });
    });
  }

  toggleSubjectComponents(subjectGroup: FormGroup, enabled: boolean): void {
    const componentFields = ['oralScore', 'oralMaxScore', 'examScore', 'examMaxScore', 'practicalScore', 'practicalMaxScore'];
    
    if (enabled) {
      componentFields.forEach(field => subjectGroup.get(field)?.enable());
      subjectGroup.get('score')?.disable();
    } else {
      componentFields.forEach(field => subjectGroup.get(field)?.disable());
      subjectGroup.get('score')?.enable();
    }
  }

  calculateComponentTotal(subjectGroup: FormGroup): number {
    const oral = subjectGroup.get('oralScore')?.value || 0;
    const exam = subjectGroup.get('examScore')?.value || 0;
    const practical = subjectGroup.get('practicalScore')?.value || 0;
    return oral + exam + practical;
  }

  calculateComponentMaxTotal(subjectGroup: FormGroup): number {
    const oral = subjectGroup.get('oralMaxScore')?.value || 0;
    const exam = subjectGroup.get('examMaxScore')?.value || 0;
    const practical = subjectGroup.get('practicalMaxScore')?.value || 0;
    return oral + exam + practical;
  }

  hasExistingGrades(studentId: string): boolean {
    return this.existingGrades[studentId] && this.existingGrades[studentId].length > 0;
  }

  getExistingGrade(studentId: string, subjectId: string, examType: string): any {
    if (!this.existingGrades[studentId]) return null;
    return this.existingGrades[studentId].find(
      (grade: any) => grade.subjectId === subjectId && grade.degreeType === examType
    );
  }

  calculateStudentTotal(studentId: string): number {
    if (!this.existingGrades[studentId]) return 0;
    return this.existingGrades[studentId].reduce((total: number, grade: any) => 
      total + (grade.score || 0), 0);
  }

  calculateStudentTotalPossible(studentId: string): number {
    if (!this.existingGrades[studentId]) return 0;
    return this.existingGrades[studentId].reduce((total: number, grade: any) => 
      total + (grade.maxScore || 0), 0);
  }

  calculateStudentAverage(studentId: string): number {
    const total = this.calculateStudentTotal(studentId);
    const possible = this.calculateStudentTotalPossible(studentId);
    return possible > 0 ? Math.round((total / possible) * 100) : 0;
  }

  calculateClassAverage(classId: string): number {
    const students = this.getStudentsForClass(classId);
    if (students.length === 0) return 0;
    
    const totalAverage = students.reduce((sum, studentId) => 
      sum + this.calculateStudentAverage(studentId), 0);
    return Math.round(totalAverage / students.length);
  }

  getProgressBarClass(average: number): string {
    if (average >= 85) return 'bg-success';
    if (average >= 70) return 'bg-primary';
    if (average >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  resetForm(classId: string, studentId: string): void {
    const form = this.classForms[classId][studentId];
    const existingDegrees = this.existingGrades[studentId] || [];
    
    ['midterm1', 'final1', 'midterm2', 'final2'].forEach(examType => {
      const examArray = form.get(examType) as FormArray;
      examArray.controls.forEach((control, index) => {
        const subjectGroup = control as FormGroup; // Cast to FormGroup
        const degreeType = this.mapExamTypeToDegreeType(examType);
        const existingGrade = existingDegrees.find(
          (d: any) => d.subjectId === subjectGroup.get('subjectId')?.value && 
                      d.degreeType === degreeType
        );
        
        subjectGroup.patchValue({
          score: existingGrade?.score || 0,
          oralScore: existingGrade?.oralScore || 0,
          oralMaxScore: existingGrade?.oralMaxScore || 0,
          examScore: existingGrade?.examScore || 0,
          examMaxScore: existingGrade?.examMaxScore || 0,
          practicalScore: existingGrade?.practicalScore || 0,
          practicalMaxScore: existingGrade?.practicalMaxScore || 0,
          useComponents: false
        });
        
        this.toggleSubjectComponents(subjectGroup, false);
      });
    });
    
    form.get('useComponents')?.setValue(false);
  }

  saveAsDraft(classId: string, studentId: string): void {
    this.saveDraft(classId, studentId);
    alert('Draft saved successfully!');
  }

  saveStudentGrades(classId: string, studentId: string): void {
    const studentForm = this.classForms[classId][studentId];
    
    if (studentForm.invalid) {
      alert('Please fill all fields correctly before saving.');
      return;
    }

    this.savingStudentId = studentId;
    const formValue = studentForm.getRawValue();
    const degrees: any[] = [];

    ['midterm1', 'final1', 'midterm2', 'final2'].forEach(examType => {
      const examArray = formValue[examType];
      if (examArray) {
        examArray.forEach((subjectGrade: any) => {
          const degree: any = {
            subjectId: subjectGrade.subjectId,
            degreeType: this.mapExamTypeToDegreeType(examType)
          };

          if (subjectGrade.useComponents) {
            // Use component scores
            degree.oralScore = subjectGrade.oralScore || 0;
            degree.oralMaxScore = subjectGrade.oralMaxScore || 0;
            degree.examScore = subjectGrade.examScore || 0;
            degree.examMaxScore = subjectGrade.examMaxScore || 0;
            degree.practicalScore = subjectGrade.practicalScore || 0;
            degree.practicalMaxScore = subjectGrade.practicalMaxScore || 0;
          } else {
            // Use simple score
            degree.score = subjectGrade.score || 0;
            degree.maxScore = subjectGrade.maxScore || 0;
          }

          // Only add if there's some data
          if (degree.score > 0 || degree.oralScore > 0 || degree.examScore > 0 || degree.practicalScore > 0) {
            degrees.push(degree);
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

    this.degreeService.addDegrees(dto).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Clear draft
          delete this.studentDrafts[studentId];
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('gradeDrafts', JSON.stringify(this.studentDrafts));
          }
          
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

  private mapExamTypeToDegreeType(examType: string): string {
    const map: { [key: string]: string } = {
      'midterm1': 'MidTerm1',
      'final1': 'Final1',
      'midterm2': 'MidTerm2',
      'final2': 'Final2'
    };
    return map[examType] || examType;
  }

  // Add these methods to your ClassGradesComponent
getSubjectFormGroup(control: any): FormGroup {
  return control as FormGroup;
}

calculateComponentTotalControl(control: any): number {
  const subjectGroup = control as FormGroup;
  return this.calculateComponentTotal(subjectGroup);
}

calculateComponentMaxTotalControl(control: any): number {
  const subjectGroup = control as FormGroup;
  return this.calculateComponentMaxTotal(subjectGroup);
}
}