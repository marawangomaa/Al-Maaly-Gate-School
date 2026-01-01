import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { DegreeComponentTypeDto } from '../../../../../Interfaces/icomponenttype';
import { DegreeService } from '../../../../../Services/degree.service';
import { DegreeComponentTypeService } from '../../../../../Services/degrees-component-type.service';
import { TeacherService } from '../../../../../Services/teacher.service';
import { AddDegreesDto, DegreeComponent, DegreeInput, ExamTypeConfig, SubjectWithComponents, DegreeType } from '../../../../../Interfaces/idegree';
import { ToastService } from '../../../../../Services/toast.service';
import { AuthService } from '../../../../../Services/auth.service';
import { ClassService } from '../../../../../Services/class.service';
import { StudentModel } from '../../../../../Interfaces/istudent';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ShortenIdPipe } from '../../../../../Pipes/shorten-id.pipe';

@Component({
  selector: 'app-class-grades',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule, ShortenIdPipe],
  templateUrl: './class-grades.component.html',
  styleUrls: ['./class-grades.component.css']
})
export class ClassGradesComponent implements OnInit {
  // Data
  teacherClasses: ClassViewDto[] = [];
  teacherSubjects: SubjectWithComponents[] = [];
  allStudents: Map<string, StudentModel[]> = new Map();
  existingDegrees: Map<string, any[]> = new Map();
  componentTypes: Map<string, DegreeComponentTypeDto[]> = new Map(); // Added back
  
  // Exam type configuration
  examTypes: ExamTypeConfig[] = [
    { name: 'MidTerm1', type: 1, maxScore: 20, weight: 0.2 },
    { name: 'Final1', type: 2, maxScore: 80, weight: 0.8 },
    { name: 'MidTerm2', type: 3, maxScore: 20, weight: 0.2 },
    { name: 'Final2', type: 4, maxScore: 80, weight: 0.8 }
  ];
  
  // UI State
  isLoadingClasses: boolean = true;
  isLoadingSubjects: boolean = true;
  isLoadingStudents: boolean = true;
  expandedClassId: string | null = null;
  expandedStudentId: { [key: string]: string } = {};
  allExpanded: boolean = false;
  activeExamType: ExamTypeConfig = this.examTypes[0];
  savingStudentId: string | null = null;
  
  // Current Teacher ID
  currentTeacherId: string | null = '';
  isBrowser: boolean;
  
  // Forms
  studentForms: Map<string, FormGroup> = new Map();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private degreeService: DegreeService,
    private componentTypeService: DegreeComponentTypeService,
    private teacherService: TeacherService,
    private toastService: ToastService,
    private authService: AuthService,
    private classService: ClassService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoadingClasses = true;
    this.isLoadingSubjects = true;
    this.isLoadingStudents = true;
    if(isPlatformBrowser(this.platformId)) {
      this.currentTeacherId = localStorage.getItem('teacherId');
    }

    this.teacherService.getTeacherClasses(this.currentTeacherId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.teacherClasses = response.data;
          
          this.teacherService.getTeacherSubjects(this.currentTeacherId).subscribe({
            next: (subjectsResponse) => {
              if (subjectsResponse.success && subjectsResponse.data) {
                // Initialize with empty componentTypes array
                this.teacherSubjects = subjectsResponse.data.map(subject => ({
                  ...subject,
                  componentTypes: []
                }));
                
                this.loadComponentTypes();
                this.loadStudentsForClasses();
              } else {
                this.toastService.showError('Failed to load subjects');
              }
              this.isLoadingSubjects = false;
            },
            error: (error) => {
              this.toastService.showError('Failed to load subjects');
              console.error('Subjects error:', error);
              this.isLoadingSubjects = false;
            }
          });
        } else {
          this.toastService.showError('Failed to load classes');
        }
        this.isLoadingClasses = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to load classes');
        console.error('Classes error:', error);
        this.isLoadingClasses = false;
      }
    });
  }

  loadComponentTypes(): void {
    if (this.teacherSubjects.length === 0) return;

    const requests = this.teacherSubjects.map(subject =>
      this.componentTypeService.getComponentTypesBySubject(subject.id)
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        responses.forEach((response, index) => {
          if (response.success && response.data) {
            const subjectId = this.teacherSubjects[index].id;
            const componentTypes = response.data.sort((a, b) => a.order - b.order);
            
            // Store in map
            this.componentTypes.set(subjectId, componentTypes);
            
            // Update subject with component types
            this.teacherSubjects[index].componentTypes = componentTypes;
            
            // Adjust max scores
            this.adjustComponentMaxScores(subjectId, componentTypes);
          }
        });
      },
      error: (error) => {
        this.toastService.showError('Failed to load component types');
        console.error('Component types error:', error);
      }
    });
  }

  adjustComponentMaxScores(subjectId: string, componentTypes: DegreeComponentTypeDto[]): void {
    if (componentTypes.length === 0) return;
    
    const totalComponentMax = componentTypes.reduce((sum, comp) => sum + comp.maxScore, 0);
    
    const midtermRatio = 20 / totalComponentMax;
    const finalRatio = 80 / totalComponentMax;
    
    componentTypes.forEach(component => {
      (component as any).midtermMaxScore = Math.round(component.maxScore * midtermRatio * 100) / 100;
      (component as any).finalMaxScore = Math.round(component.maxScore * finalRatio * 100) / 100;
    });
  }

  loadStudentsForClasses(): void {
    const studentRequests = this.teacherClasses.map(cls =>
      this.classService.getStudentsByClass(cls.id)
    );

    forkJoin(studentRequests).subscribe({
      next: (responses) => {
        responses.forEach((response, index) => {
          const classId = this.teacherClasses[index].id;
          if (response.success && response.data) {
            this.allStudents.set(classId, response.data);
            this.loadExistingDegreesForClass(classId, response.data);
          }
        });
        this.isLoadingStudents = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to load students');
        console.error('Students error:', error);
        this.isLoadingStudents = false;
      }
    });
  }

  loadExistingDegreesForClass(classId: string, students: StudentModel[]): void {
    students.forEach(student => {
      this.degreeService.getStudentDegrees(student.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.existingDegrees.set(student.id, response.data.degrees);
            
            if (!this.studentForms.has(student.id)) {
              this.initializeStudentForm(classId, student.id);
            }
          }
        },
        error: (error) => {
          console.error(`Error loading degrees for student ${student.id}:`, error);
          if (!this.studentForms.has(student.id)) {
            this.initializeStudentForm(classId, student.id);
          }
        }
      });
    });
  }

  initializeStudentForm(classId: string, studentId: string): void {
    const student = this.getStudentById(classId, studentId);
    if (!student) return;

    const form = this.fb.group({
      studentId: [studentId],
      studentName: [student.fullName],
      useComponents: [false],
      degrees: this.fb.array([])
    });

    this.initializeDegreesArray(form, studentId);
    
    this.studentForms.set(studentId, form);
  }

  initializeDegreesArray(form: FormGroup, studentId: string): void {
    const degreesArray = form.get('degrees') as FormArray;
    degreesArray.clear();

    this.teacherSubjects.forEach(subject => {
      const existingDegree = this.getExistingGrade(studentId, subject.id, this.activeExamType.type);
      const componentTypes = this.componentTypes.get(subject.id) || [];
      
      const maxScore = this.activeExamType.maxScore;
      
      const degreeForm = this.fb.group({
        subjectId: [subject.id],
        subjectName: [subject.subjectName],
        degreeType: [this.activeExamType.type],
        useComponents: [componentTypes.length > 0],
        score: [existingDegree?.score || null, [
          Validators.min(0), 
          Validators.max(maxScore)
        ]],
        maxScore: [maxScore, [Validators.required, Validators.min(0)]],
        components: this.fb.array([])
      });

      if (existingDegree?.hasComponents && existingDegree.components?.length > 0) {
        degreeForm.get('useComponents')?.setValue(true);
        this.initializeComponents(degreeForm, existingDegree.components, componentTypes);
      } else if (componentTypes.length > 0) {
        this.initializeComponents(degreeForm, [], componentTypes);
      } else {
        degreeForm.get('useComponents')?.setValue(false);
      }

      degreesArray.push(degreeForm);
    });
  }

  initializeComponents(degreeForm: FormGroup, existingComponents: any[], componentTypes: DegreeComponentTypeDto[]): void {
    const componentsArray = degreeForm.get('components') as FormArray;
    componentsArray.clear();

    const isMidterm = this.activeExamType.type === 1 || this.activeExamType.type === 3;

    componentTypes.forEach(componentType => {
      const existingComponent = existingComponents?.find(c => c.componentTypeId === componentType.id);
      
      const componentMaxScore = isMidterm ? 
        ((componentType as any).midtermMaxScore || componentType.maxScore) : 
        ((componentType as any).finalMaxScore || componentType.maxScore);
      
      const componentForm = this.fb.group({
        componentTypeId: [componentType.id],
        componentName: [componentType.componentName],
        score: [existingComponent?.score || 0, [Validators.required, Validators.min(0)]],
        maxScore: [componentMaxScore, [Validators.required, Validators.min(0)]],
        order: [componentType.order]
      });

      if (existingComponent?.score && existingComponent?.maxScore) {
        const ratio = existingComponent.score / existingComponent.maxScore;
        const newScore = Math.round(ratio * componentMaxScore * 100) / 100;
        componentForm.get('score')?.setValue(newScore);
      }

      componentsArray.push(componentForm);
    });
  }

  // UI Helper Methods
  toggleAllStudents(): void {
    this.allExpanded = !this.allExpanded;
    if (this.allExpanded) {
      this.teacherClasses.forEach(cls => {
        this.expandedClassId = cls.id;
        const students = this.getStudentsForClass(cls.id);
        students.forEach(studentId => {
          this.expandedStudentId[cls.id] = studentId;
        });
      });
    } else {
      this.expandedStudentId = {};
      this.expandedClassId = null;
    }
  }

  toggleExpandClass(classId: string): void {
    if (this.expandedClassId === classId) {
      this.expandedClassId = null;
      delete this.expandedStudentId[classId];
    } else {
      this.expandedClassId = classId;
    }
  }

  toggleExpandStudent(classId: string, studentId: string): void {
    if (this.expandedStudentId[classId] === studentId) {
      delete this.expandedStudentId[classId];
    } else {
      this.expandedStudentId[classId] = studentId;
      
      const form = this.getStudentForm(classId, studentId);
      if (form) {
        this.initializeDegreesArray(form, studentId);
      }
    }
  }

  setActiveExamType(examType: ExamTypeConfig): void {
    this.activeExamType = examType;
    
    Object.keys(this.expandedStudentId).forEach(classId => {
      const studentId = this.expandedStudentId[classId];
      const form = this.getStudentForm(classId, studentId);
      if (form) {
        this.initializeDegreesArray(form, studentId);
      }
    });
  }

  // Helper to get degree type for template (keep this for backward compatibility)
  getActiveDegreeType(): number {
    return this.activeExamType.type;
  }

  // Form Getters
  getStudentForm(classId: string, studentId: string): FormGroup | null {
    return this.studentForms.get(studentId) || null;
  }

  getActiveExamArray(classId: string, studentId: string): FormArray {
    const form = this.getStudentForm(classId, studentId);
    return form?.get('degrees') as FormArray;
  }

  getComponentsArray(degreeControl: AbstractControl): FormArray {
    const degreeForm = degreeControl as FormGroup;
    return degreeForm.get('components') as FormArray;
  }

  // Student Data Helpers
  getStudentsForClass(classId: string): string[] {
    const students = this.allStudents.get(classId) || [];
    return students.map(s => s.id);
  }

  getStudentById(classId: string, studentId: string): StudentModel | undefined {
    const students = this.allStudents.get(classId) || [];
    return students.find(s => s.id === studentId);
  }

  getStudentName(classId: string, studentId: string): string {
    const student = this.getStudentById(classId, studentId);
    return student?.fullName || 'Unknown Student';
  }

  // Grade Calculations
  hasExistingGrades(studentId: string): boolean {
    const degrees = this.existingDegrees.get(studentId);
    return !!(degrees && degrees.length > 0);
  }

  getExistingGrade(studentId: string, subjectId: string, degreeType: number): any {
    const degrees = this.existingDegrees.get(studentId) || [];
    return degrees.find(d => 
      d.subjectId === subjectId && 
      d.degreeType === degreeType.toString()
    );
  }

  calculateStudentTotal(studentId: string): number {
    const degrees = this.existingDegrees.get(studentId) || [];
    let total = 0;
    
    degrees.forEach(degree => {
      const examType = this.examTypes.find(et => et.type === parseInt(degree.degreeType));
      const weight = examType?.weight || 1;
      
      if (degree.hasComponents && degree.components?.length > 0) {
        const componentTotal = degree.components.reduce((sum: number, comp: any) => sum + (comp.score || 0), 0);
        const componentMaxTotal = degree.components.reduce((sum: number, comp: any) => sum + (comp.maxScore || 0), 0);
        
        if (componentMaxTotal > 0) {
          const percentage = (componentTotal / componentMaxTotal) * 100;
          total += (percentage * weight) / 100;
        }
      } else {
        total += (degree.score || 0) * weight;
      }
    });
    
    return Math.round(total * 100) / 100;
  }

  calculateStudentTotalPossible(studentId: string): number {
    return 200; // 20+80+20+80
  }

  calculateStudentAverage(studentId: string): number {
    const total = this.calculateStudentTotal(studentId);
    const totalPossible = this.calculateStudentTotalPossible(studentId);
    if (totalPossible === 0) return 0;
    const percentage = (total / totalPossible) * 100;
    return Math.round(percentage * 100) / 100;
  }

  calculateClassAverage(classId: string): number {
    const studentIds = this.getStudentsForClass(classId);
    if (studentIds.length === 0) return 0;
    
    const totalAverage = studentIds.reduce((sum, studentId) => {
      return sum + this.calculateStudentAverage(studentId);
    }, 0);
    
    return Math.round(totalAverage / studentIds.length);
  }

  calculateComponentTotalControl(degreeControl: AbstractControl): number {
    const degreeForm = degreeControl as FormGroup;
    const componentsArray = degreeForm.get('components') as FormArray;
    const total = componentsArray.controls.reduce((sum, control: AbstractControl) => {
      const score = (control as FormGroup).get('score')?.value || 0;
      return sum + (parseFloat(score) || 0);
    }, 0);
    
    return Math.round(total * 100) / 100;
  }

  calculateComponentMaxTotalControl(degreeControl: AbstractControl): number {
    const degreeForm = degreeControl as FormGroup;
    const componentsArray = degreeForm.get('components') as FormArray;
    const total = componentsArray.controls.reduce((sum, control: AbstractControl) => {
      const maxScore = (control as FormGroup).get('maxScore')?.value || 0;
      return sum + (parseFloat(maxScore) || 0);
    }, 0);
    
    return Math.round(total * 100) / 100;
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 85) return 'bg-success';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 60) return 'bg-info';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  // Form Actions
  toggleComponents(classId: string, studentId: string, event: any): void {
    const form = this.getStudentForm(classId, studentId);
    if (!form) return;

    const useComponents = event.target.checked;
    form.get('useComponents')?.setValue(useComponents);
    
    const degreesArray = form.get('degrees') as FormArray;
    degreesArray.controls.forEach((degreeControl: AbstractControl) => {
      const degreeForm = degreeControl as FormGroup;
      const subjectId = degreeForm.get('subjectId')?.value;
      const componentTypes = this.componentTypes.get(subjectId) || [];
      
      if (useComponents && componentTypes.length > 0) {
        degreeForm.get('useComponents')?.setValue(true);
        this.initializeComponents(degreeForm, [], componentTypes);
      } else {
        degreeForm.get('useComponents')?.setValue(false);
        const componentsArray = degreeForm.get('components') as FormArray;
        componentsArray.clear();
      }
    });
  }

  toggleSubjectComponents(degreeControl: AbstractControl): void {
    const degreeForm = degreeControl as FormGroup;
    const useComponents = degreeForm.get('useComponents')?.value;
    const subjectId = degreeForm.get('subjectId')?.value;
    const componentTypes = this.componentTypes.get(subjectId) || [];
    
    if (useComponents && componentTypes.length > 0) {
      this.initializeComponents(degreeForm, [], componentTypes);
    } else {
      const componentsArray = degreeForm.get('components') as FormArray;
      componentsArray.clear();
    }
  }

  resetForm(classId: string, studentId: string): void {
    const form = this.getStudentForm(classId, studentId);
    if (form) {
      this.initializeDegreesArray(form, studentId);
      this.toastService.showInfo('Form reset to original values');
    }
  }

  saveAsDraft(classId: string, studentId: string): void {
    const form = this.getStudentForm(classId, studentId);
    if (!form || form.invalid) {
      this.toastService.showError('Form has invalid data');
      return;
    }
    
    this.toastService.showSuccess('Draft saved successfully');
  }

  saveStudentGrades(classId: string, studentId: string): void {
    const form = this.getStudentForm(classId, studentId);
    if (!form || form.invalid) {
      this.toastService.showError('Please fill all required fields correctly');
      this.markFormGroupTouched(form!);
      return;
    }

    this.savingStudentId = studentId;
    
    const formValue = form.value;
    const degreesInput: DegreeInput[] = [];
    
    formValue.degrees.forEach((degree: any) => {
      if (degree.useComponents && degree.components && degree.components.length > 0) {
        const components: DegreeComponent[] = degree.components.map((comp: any) => ({
          componentTypeId: comp.componentTypeId,
          componentName: comp.componentName,
          score: parseFloat(comp.score) || 0,
          maxScore: parseFloat(comp.maxScore) || 0
        }));
        
        degreesInput.push({
          subjectId: degree.subjectId,
          degreeType: degree.degreeType,
          components: components
        });
      } else if (degree.score !== null && degree.score !== undefined) {
        const maxScore = degree.maxScore || this.activeExamType.maxScore;
        
        degreesInput.push({
          subjectId: degree.subjectId,
          degreeType: degree.degreeType,
          score: parseFloat(degree.score) || 0,
          maxScore: parseFloat(maxScore) || this.activeExamType.maxScore
        });
      }
    });

    const validDegrees = degreesInput.filter(d => 
      (d.components && d.components.length > 0) || 
      (d.score !== null && d.score !== undefined)
    );

    if (validDegrees.length === 0) {
      this.toastService.showError('No valid grades to save');
      this.savingStudentId = null;
      return;
    }

    const dto: AddDegreesDto = {
      studentId: studentId,
      degrees: validDegrees
    };

    this.degreeService.addDegrees(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess(response.message || 'Grades saved successfully');
          this.degreeService.getStudentDegrees(studentId).subscribe({
            next: (degreesResponse) => {
              if (degreesResponse.success && degreesResponse.data) {
                this.existingDegrees.set(studentId, degreesResponse.data.degrees);
              }
            },
            error: (error) => {
              console.error('Error reloading degrees:', error);
            }
          });
        } else {
          this.toastService.showError(response.message || 'Failed to save grades');
        }
        this.savingStudentId = null;
      },
      error: (error) => {
        this.toastService.showError('Failed to save grades: ' + (error.error?.message || error.message));
        console.error('Save error:', error);
        this.savingStudentId = null;
      }
    });
  }

  // Helper methods
  shortenId(id: string): string {
    return id.length > 8 ? id.substring(0, 8) + '...' : id;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((ctrl: AbstractControl) => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          }
        });
      }
    });
  }

  // Helper to cast AbstractControl to FormGroup
  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  // Helper to get component types for template
  getComponentTypesForSubject(subjectId: string): DegreeComponentTypeDto[] {
    return this.componentTypes.get(subjectId) || [];
  }

  // Helper to check if subject has components
  subjectHasComponents(subjectId: string): boolean {
    const components = this.componentTypes.get(subjectId);
    return !!(components && components.length > 0);
  }
}