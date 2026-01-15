import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BulkMoveClassesDto, ClassViewDto, CreateClassDto, UpdateClassDto } from '../../../../../Interfaces/iclass';
import { SubjectCreateDto, SubjectViewDto, SubjectUpdateDto } from '../../../../../Interfaces/isubject';
import { CreateClassInGradeDto, CreateGradeDto, GradeViewDto, GradeWithDetailsDto, UpdateGradeDto } from '../../../../../Interfaces/igrade';
import { Curriculum } from '../../../../../Interfaces/icurriculum';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { GradeService } from '../../../../../Services/grade.service';
import { ClassService } from '../../../../../Services/class.service';
import { SubjectService } from '../../../../../Services/subject.service';
import { CurriculumService } from '../../../../../Services/curriculum.service';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse } from '../../../../../Interfaces/auth';

@Component({
  selector: 'app-admin-grades',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './admin-grades.component.html',
  styleUrl: './admin-grades.component.css'
})
export class AdminGradesComponent implements OnInit {
  // Grade Properties
  grades: GradeViewDto[] = [];
  curricula: Curriculum[] = [];
  // Store details for each grade separately
  gradeDetailsMap: Map<string, GradeWithDetailsDto> = new Map();
  gradeClassesMap: Map<string, ClassViewDto[]> = new Map();
  gradeSubjectsMap: Map<string, SubjectViewDto[]> = new Map();

  loading = false;
  gradesLoading = false;
  detailsLoading = false;
  curriculaLoading = false;

  // Search and Filter
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Forms
  gradeForm!: FormGroup;
  classForm!: FormGroup;
  subjectForm!: FormGroup;
  bulkMoveForm!: FormGroup;

  // Modal flags
  showGradeModal = false;
  showClassModal = false;
  showSubjectModal = false;
  showBulkMoveModal = false;
  showDeleteModal = false;

  // Modal data
  modalMessage = '';
  deleteGradeId = '';

  // Mode flags
  isEditMode = false;
  isClassEditMode = false;
  isSubjectEditMode = false;

  // Bulk Operations
  selectedClasses: string[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Expanded sections
  expandedGrades: Set<string> = new Set();
  loadingGrades: Set<string> = new Set();

  // Filter
  selectedCurriculumId: string = 'all';

  // Store the currently selected grade for form operations
  currentSelectedGradeId: string | null = null;

  // Grade selections per grade
  gradeSelections: Map<string, { selected: string[], selectAll: boolean }> = new Map();

  // Store target grade for bulk move operations
  private targetGradeIdForMove: string | null = null;

  constructor(
    private gradeService: GradeService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private curriculumService: CurriculumService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadGrades();
    this.loadCurricula();
  }

  private initializeForms(): void {
    // Grade Form
    this.gradeForm = this.fb.group({
      id: [''],
      gradeName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.maxLength(500)]],
      curriculumId: ['', [Validators.required]]
    });

    // Class Form
    this.classForm = this.fb.group({
      id: [''],
      className: ['', [Validators.required, Validators.minLength(2)]],
      gradeId: ['', [Validators.required]]
    });

    // Subject Form
    this.subjectForm = this.fb.group({
      id: [''],
      subjectName: ['', [Validators.required, Validators.minLength(2)]],
      gradeId: ['', [Validators.required]],
      creditHours: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });

    // Bulk Move Form
    this.bulkMoveForm = this.fb.group({
      gradeId: ['', [Validators.required]]
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadGrades();
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Load Curricula
  loadCurricula(): void {
    this.curriculaLoading = true;
    this.curriculumService.getAll().subscribe({
      next: (curricula: Curriculum[]) => {
        this.curricula = curricula;
        this.curriculaLoading = false;
      },
      error: (error) => {
        console.error('Failed to load curricula:', error);
        this.curriculaLoading = false;
      }
    });
  }

  // Load Grades
  loadGrades(): void {
    this.gradesLoading = true;

    let apiCall: Observable<ApiResponse<GradeViewDto[]>>;

    if (this.selectedCurriculumId && this.selectedCurriculumId !== 'all') {
      apiCall = this.gradeService.getByCurriculum(this.selectedCurriculumId);
    } else {
      apiCall = this.gradeService.getAll();
    }

    apiCall.subscribe({
      next: (response: ApiResponse<GradeViewDto[]>) => {
        if (response.success && response.data) {
          this.grades = this.searchTerm
            ? response.data.filter(grade =>
              grade.gradeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              grade.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              grade.curriculumName?.toLowerCase().includes(this.searchTerm.toLowerCase())
            )
            : response.data;
          this.totalItems = this.grades.length;
        }
        this.gradesLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load grades:', error);
        this.gradesLoading = false;
      }
    });
  }

  // Refresh everything
  refreshAll(): void {
    this.loadGrades();
    this.loadCurricula();
    // Clear expanded details and reload them if needed
    this.expandedGrades.forEach(gradeId => {
      this.clearGradeCache(gradeId);
      this.loadGradeDetails(gradeId);
    });
  }

  // Refresh specific grades
  refreshGrades(gradeIds: string[]): void {
    gradeIds.forEach(gradeId => {
      this.clearGradeCache(gradeId);
      if (this.expandedGrades.has(gradeId)) {
        this.loadGradeDetails(gradeId);
      }
    });
  }

  onCurriculumFilterChange(): void {
    this.currentPage = 1;
    this.loadGrades();
  }

  loadGradeDetails(gradeId: string): void {
    // Toggle expansion
    if (this.expandedGrades.has(gradeId)) {
      this.expandedGrades.delete(gradeId);
      this.clearSelectionsForGrade(gradeId);
      if (this.currentSelectedGradeId === gradeId) {
        this.currentSelectedGradeId = null;
        this.selectedClasses = [];
      }
      return;
    }

    this.loadingGrades.add(gradeId);
    this.expandedGrades.add(gradeId);
    this.currentSelectedGradeId = gradeId;

    if (this.gradeDetailsMap.has(gradeId)) {
      this.loadingGrades.delete(gradeId);
      return;
    }

    this.gradeService.getWithDetails(gradeId).subscribe({
      next: (response: ApiResponse<GradeWithDetailsDto>) => {
        if (response.success && response.data) {
          this.gradeDetailsMap.set(gradeId, response.data);
          this.loadClassesForGrade(gradeId);
          this.loadSubjectsForGrade(gradeId);
        }
        this.loadingGrades.delete(gradeId);
      },
      error: (error) => {
        console.error('Failed to load grade details:', error);
        this.loadingGrades.delete(gradeId);
        this.expandedGrades.delete(gradeId);
      }
    });
  }

  loadClassesForGrade(gradeId: string): void {
    this.gradeService.getClassesByGrade(gradeId).subscribe({
      next: (response: ApiResponse<ClassViewDto[]>) => {
        if (response.success && response.data) {
          this.gradeClassesMap.set(gradeId, response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load classes:', error);
        this.gradeClassesMap.set(gradeId, []);
      }
    });
  }

  loadSubjectsForGrade(gradeId: string): void {
    this.gradeService.getSubjectsByGrade(gradeId).subscribe({
      next: (response: ApiResponse<SubjectViewDto[]>) => {
        if (response.success && response.data) {
          this.gradeSubjectsMap.set(gradeId, response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load subjects:', error);
        this.gradeSubjectsMap.set(gradeId, []);
      }
    });
  }

  // Helper methods
  getGradeDetails(gradeId: string | undefined): GradeWithDetailsDto | null {
    if (!gradeId) return null;
    return this.gradeDetailsMap.get(gradeId) || null;
  }

  getClassesForGrade(gradeId: string): ClassViewDto[] {
    return this.gradeClassesMap.get(gradeId) || [];
  }

  getSubjectsForGrade(gradeId: string): SubjectViewDto[] {
    return this.gradeSubjectsMap.get(gradeId) || [];
  }

  isGradeLoading(gradeId: string): boolean {
    return this.loadingGrades.has(gradeId);
  }

  isGradeExpanded(gradeId: string): boolean {
    return this.expandedGrades.has(gradeId);
  }

  // Selection Management
  toggleClassSelection(gradeId: string, classId: string): void {
    if (!this.gradeSelections.has(gradeId)) {
      this.gradeSelections.set(gradeId, { selected: [], selectAll: false });
    }

    const selection = this.gradeSelections.get(gradeId)!;
    const index = selection.selected.indexOf(classId);

    if (index > -1) {
      selection.selected.splice(index, 1);
    } else {
      selection.selected.push(classId);
    }

    const classes = this.getClassesForGrade(gradeId);
    selection.selectAll = selection.selected.length === classes.length;
  }

  toggleSelectAllClasses(gradeId: string): void {
    if (!this.gradeSelections.has(gradeId)) {
      this.gradeSelections.set(gradeId, { selected: [], selectAll: false });
    }

    const selection = this.gradeSelections.get(gradeId)!;
    const classes = this.getClassesForGrade(gradeId);

    if (selection.selectAll) {
      selection.selected = [];
    } else {
      selection.selected = classes.map(c => c.id);
    }

    selection.selectAll = !selection.selectAll;
  }

  isClassSelected(gradeId: string, classId: string): boolean {
    if (!this.gradeSelections.has(gradeId)) {
      return false;
    }
    return this.gradeSelections.get(gradeId)!.selected.includes(classId);
  }

  isSelectAllChecked(gradeId: string): boolean {
    if (!this.gradeSelections.has(gradeId)) {
      return false;
    }
    return this.gradeSelections.get(gradeId)!.selectAll;
  }

  clearSelectionsForGrade(gradeId: string): void {
    this.gradeSelections.delete(gradeId);
  }

  // Modal Operations
  openGradeModal(grade?: GradeViewDto): void {
    this.isEditMode = !!grade;

    if (grade) {
      this.gradeForm.patchValue({
        id: grade.id,
        gradeName: grade.gradeName,
        description: grade.description,
        curriculumId: grade.curriculumId
      });
    } else {
      this.gradeForm.reset({
        curriculumId: ''
      });
    }

    this.showGradeModal = true;
  }

  openClassModal(gradeId?: string, classData?: ClassViewDto): void {
    this.isClassEditMode = !!classData;
    const targetGradeId = gradeId || this.currentSelectedGradeId || '';

    if (classData) {
      this.classForm.patchValue({
        id: classData.id,
        className: classData.className,
        gradeId: classData.gradeId
      });
    } else {
      this.classForm.reset({
        gradeId: targetGradeId
      });
    }

    this.showClassModal = true;
  }

  openSubjectModal(gradeId?: string, subject?: SubjectViewDto): void {
    this.isSubjectEditMode = !!subject;
    const targetGradeId = gradeId || this.currentSelectedGradeId || '';

    if (subject) {
      this.subjectForm.patchValue({
        id: subject.id,
        subjectName: subject.subjectName,
        gradeId: subject.gradeId,
        creditHours: subject.creditHours
      });
    } else {
      this.subjectForm.reset({
        gradeId: targetGradeId,
        creditHours: 1
      });
    }

    this.showSubjectModal = true;
  }

  openBulkMoveModal(gradeId: string): void {
    const selection = this.gradeSelections.get(gradeId);
    if (!selection || selection.selected.length === 0) {
      alert('Please select classes to move');
      return;
    }

    this.selectedClasses = [...selection.selected];
    this.currentSelectedGradeId = gradeId; // Set the current grade ID
    this.bulkMoveForm.reset({ gradeId: '' });
    this.showBulkMoveModal = true;
  }

  openDeleteModal(gradeId: string, gradeName: string): void {
    this.deleteGradeId = gradeId;
    this.modalMessage = `Are you sure you want to delete grade "${gradeName}"? This action cannot be undone.`;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showGradeModal = false;
    this.showClassModal = false;
    this.showSubjectModal = false;
    this.showBulkMoveModal = false;
    this.showDeleteModal = false;
    this.gradeForm.reset();
    this.classForm.reset();
    this.subjectForm.reset();
    this.bulkMoveForm.reset();
    this.selectedClasses = []; // Clear selected classes
    this.currentSelectedGradeId = null;
  }

  // CRUD Operations
  saveGrade(): void {
    if (this.gradeForm.invalid) {
      this.markFormGroupTouched(this.gradeForm);
      return;
    }

    this.loading = true;
    const formValue = this.gradeForm.value;
    const description = formValue.description?.trim();

    const createDto: CreateGradeDto = {
      gradeName: formValue.gradeName,
      description: description === '' ? undefined : description,
      curriculumId: formValue.curriculumId
    };

    this.gradeService.create(createDto).subscribe({
      next: (response: ApiResponse<GradeViewDto>) => {
        if (response.success && response.data) {
          alert('Grade created successfully');
          this.refreshAll();
          this.closeModals();
        } else {
          alert(response.message || 'Failed to create grade');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to create grade:', error);
        if (error.error?.errors) {
          let errorMessages = [];
          for (const [field, messages] of Object.entries(error.error.errors)) {
            errorMessages.push(`${field}: ${(messages as string[]).join(', ')}`);
          }
          alert('Validation errors:\n' + errorMessages.join('\n'));
        } else {
          alert(error.error?.title || 'Failed to create grade');
        }
        this.loading = false;
      }
    });
  }

  saveClass(): void {
    if (this.classForm.invalid) {
      this.markFormGroupTouched(this.classForm);
      return;
    }

    this.loading = true;
    const formValue = this.classForm.value;
    const gradeId = formValue.gradeId;

    if (this.isClassEditMode) {
      const updateDto: UpdateClassDto = {
        id: formValue.id,
        className: formValue.className,
        gradeId: formValue.gradeId
      };

      this.classService.update(formValue.id, updateDto).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Class updated successfully');
            // Clear cache for the grade and refresh
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadClassesForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update class:', error);
          alert('Failed to update class');
          this.loading = false;
        }
      });
    } else {
      const createDto: CreateClassInGradeDto = {
        className: formValue.className
      };

      this.gradeService.createClass(gradeId, createDto).subscribe({
        next: (response: ApiResponse<ClassViewDto>) => {
          if (response.success && response.data) {
            alert('Class created successfully');
            // Clear cache for the grade and refresh
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadClassesForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            alert(response.message || 'Failed to create class');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to create class:', error);
          alert('Failed to create class');
          this.loading = false;
        }
      });
    }
  }

  saveSubject(): void {
    if (this.subjectForm.invalid) {
      this.markFormGroupTouched(this.subjectForm);
      return;
    }

    this.loading = true;
    const formValue = this.subjectForm.value;
    const gradeId = formValue.gradeId;

    if (this.isSubjectEditMode) {
      const updateDto: SubjectUpdateDto = {
        id: formValue.id,
        subjectName: formValue.subjectName,
        gradeId: formValue.gradeId,
        creditHours: formValue.creditHours
      };

      this.subjectService.update(formValue.id, updateDto).subscribe({
        next: (response: ApiResponse<SubjectViewDto>) => {
          if (response.success && response.data) {
            alert('Subject updated successfully');
            // Clear cache for the grade and refresh
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadSubjectsForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            alert(response.message || 'Failed to update subject');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update subject:', error);
          alert('Failed to update subject');
          this.loading = false;
        }
      });
    } else {
      const createDto: SubjectCreateDto = {
        subjectName: formValue.subjectName,
        gradeId: formValue.gradeId,
        creditHours: formValue.creditHours
      };

      this.gradeService.addSubject(gradeId, createDto).subscribe({
        next: (response: ApiResponse<SubjectViewDto>) => {
          if (response.success && response.data) {
            alert('Subject added successfully');
            // Clear cache for the grade and refresh
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadSubjectsForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            alert(response.message || 'Failed to add subject');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to add subject:', error);
          alert('Failed to add subject');
          this.loading = false;
        }
      });
    }
  }

  deleteGrade(): void {
    if (!this.deleteGradeId) return;

    this.loading = true;
    this.gradeService.delete(this.deleteGradeId).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          alert('Grade deleted successfully');
          // Clean up local data
          this.clearGradeCache(this.deleteGradeId);
          this.expandedGrades.delete(this.deleteGradeId);
          this.clearSelectionsForGrade(this.deleteGradeId);

          this.refreshAll();
          this.closeModals();
        } else {
          alert(response.message || 'Failed to delete grade');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to delete grade:', error);
        alert('Failed to delete grade');
        this.loading = false;
      }
    });
  }

  removeClassFromGrade(classId: string, gradeId: string): void {
    if (!confirm('Are you sure you want to remove this class from the grade?')) {
      return;
    }

    this.gradeService.removeClass(classId).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          alert('Class removed from grade');
          // Clear cache for the grade and refresh
          this.clearGradeCache(gradeId);
          if (this.expandedGrades.has(gradeId)) {
            this.loadClassesForGrade(gradeId);
          }
          this.refreshAll();
        } else {
          alert(response.message || 'Failed to remove class');
        }
      },
      error: (error) => {
        console.error('Failed to remove class:', error);
        alert('Failed to remove class');
      }
    });
  }

  removeSubjectFromGrade(subjectId: string, gradeId: string): void {
    if (!confirm('Are you sure you want to remove this subject from the grade?')) {
      return;
    }

    this.gradeService.removeSubject(subjectId).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          alert('Subject removed from grade');
          // Clear cache for the grade and refresh
          this.clearGradeCache(gradeId);
          if (this.expandedGrades.has(gradeId)) {
            this.loadSubjectsForGrade(gradeId);
          }
          this.refreshAll();
        } else {
          alert(response.message || 'Failed to remove subject');
        }
      },
      error: (error) => {
        console.error('Failed to remove subject:', error);
        alert('Failed to remove subject');
      }
    });
  }

  moveClass(classId: string, newGradeId: string, currentGradeId: string): void {
    if (!confirm('Are you sure you want to move this class to another grade?')) {
      return;
    }

    this.gradeService.moveClass(classId, newGradeId).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          alert('Class moved successfully');
          // Clear cache for BOTH grades and refresh
          this.clearGradeCache(currentGradeId);
          this.clearGradeCache(newGradeId);

          if (this.expandedGrades.has(currentGradeId)) {
            this.loadClassesForGrade(currentGradeId);
          }
          if (this.expandedGrades.has(newGradeId)) {
            this.loadClassesForGrade(newGradeId);
          }

          this.refreshAll();
        } else {
          alert(response.message || 'Failed to move class');
        }
      },
      error: (error) => {
        console.error('Failed to move class:', error);
        alert('Failed to move class');
      }
    });
  }

  bulkMoveClasses(): void {
    if (this.bulkMoveForm.invalid || this.selectedClasses.length === 0) {
      return;
    }

    const targetGradeId = this.bulkMoveForm.value.gradeId;
    if (!targetGradeId) {
      alert('Please select a target grade');
      return;
    }

    const dto: BulkMoveClassesDto = {
      classIds: this.selectedClasses,
      newGradeId: targetGradeId
    };

    this.loading = true;
    this.gradeService.bulkMoveClasses(dto).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          alert('Classes moved successfully');

          // Clear cache for BOTH grades
          if (this.currentSelectedGradeId) {
            this.clearGradeCache(this.currentSelectedGradeId);
          }
          this.clearGradeCache(targetGradeId);

          // Clear selections
          if (this.currentSelectedGradeId) {
            this.clearSelectionsForGrade(this.currentSelectedGradeId);
          }
          this.selectedClasses = [];

          // Refresh both grades if they're expanded
          if (this.currentSelectedGradeId && this.expandedGrades.has(this.currentSelectedGradeId)) {
            this.loadClassesForGrade(this.currentSelectedGradeId);
          }
          if (this.expandedGrades.has(targetGradeId)) {
            this.loadClassesForGrade(targetGradeId);
          }

          // Refresh everything
          this.refreshAll();
          this.closeModals();
        } else {
          alert(response.message || 'Failed to move classes');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to move classes:', error);
        alert('Failed to move classes');
        this.loading = false;
      }
    });
  }

  // Helper Methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getCurriculumName(curriculumId: string): string {
    const curriculum = this.curricula.find(c => c.id === curriculumId);
    return curriculum ? curriculum.name : 'Unknown Curriculum';
  }

  clearGradeCache(gradeId: string): void {
    this.gradeDetailsMap.delete(gradeId);
    this.gradeClassesMap.delete(gradeId);
    this.gradeSubjectsMap.delete(gradeId);
  }

  refreshGrade(gradeId: string): void {
    this.clearGradeCache(gradeId);
    if (this.expandedGrades.has(gradeId)) {
      this.loadGradeDetails(gradeId);
    }
  }

  // Pagination
  get paginatedGrades(): GradeViewDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.grades.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}