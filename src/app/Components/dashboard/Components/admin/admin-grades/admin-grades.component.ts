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
import { ToastService } from '../../../../../Services/UtilServices/toast.service';

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
  showConfirmModal = false;
  showRemoveConfirmModal = false;

  // Modal data
  modalMessage = '';
  modalTitle = '';
  deleteGradeId = '';
  confirmAction: 'deleteGrade' | 'removeClass' | 'removeSubject' | 'moveClass' | 'bulkMove' | null = null;
  confirmData: any = null;

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

  //property to store deletion error info
  deleteErrorData: { gradeName: string, classes: number, subjects: number } | null = null;
  showDeleteErrorModal = false;

  constructor(
    private gradeService: GradeService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private curriculumService: CurriculumService,
    private fb: FormBuilder,
    private toast: ToastService
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
        this.toast.error('GRADE.ERRORS.LOAD_CURRICULA_FAILED');
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
        this.toast.error('GRADE.ERRORS.LOAD_GRADES_FAILED');
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
        this.toast.error('GRADE.ERRORS.LOAD_DETAILS_FAILED');
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
        this.toast.error('GRADE.ERRORS.LOAD_CLASSES_FAILED');
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
        this.toast.error('GRADE.ERRORS.LOAD_SUBJECTS_FAILED');
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
      this.toast.warning('GRADE.ALERTS.SELECT_CLASSES_TO_MOVE');
      return;
    }

    this.selectedClasses = [...selection.selected];
    this.currentSelectedGradeId = gradeId; // Set the current grade ID
    this.bulkMoveForm.reset({ gradeId: '' });
    this.showBulkMoveModal = true;
  }

  openDeleteModal(gradeId: string, gradeName: string): void {
    const classes = this.getClassesForGrade(gradeId);
    const subjects = this.getSubjectsForGrade(gradeId);
    
    if (classes.length > 0 || subjects.length > 0) {
      this.deleteErrorData = {
        gradeName: gradeName,
        classes: classes.length,
        subjects: subjects.length
      };
      this.showDeleteErrorModal = true;
    } else {
      this.deleteGradeId = gradeId;
      this.modalTitle = 'GRADE.MODALS.DELETE_CONFIRM';
      this.modalMessage = 'GRADE.MODALS.DELETE_GRADE_CONFIRM';
      this.confirmAction = 'deleteGrade';
      this.confirmData = { gradeId, gradeName };
      this.showConfirmModal = true;
    }
  }

  openRemoveConfirmModal(type: 'class' | 'subject', id: string, name: string, gradeId: string): void {
    this.confirmData = { id, name, gradeId };
    
    if (type === 'class') {
      this.modalTitle = 'GRADE.MODALS.REMOVE_CLASS_CONFIRM';
      this.modalMessage = 'GRADE.MODALS.REMOVE_CLASS_MESSAGE';
      this.confirmAction = 'removeClass';
    } else {
      this.modalTitle = 'GRADE.MODALS.REMOVE_SUBJECT_CONFIRM';
      this.modalMessage = 'GRADE.MODALS.REMOVE_SUBJECT_MESSAGE';
      this.confirmAction = 'removeSubject';
    }
    
    this.showRemoveConfirmModal = true;
  }

  openBulkMoveConfirmModal(): void {
    if (this.bulkMoveForm.invalid || this.selectedClasses.length === 0) {
      this.toast.warning('GRADE.ALERTS.SELECT_TARGET_GRADE');
      return;
    }

    const targetGradeId = this.bulkMoveForm.value.gradeId;
    const targetGrade = this.grades.find(g => g.id === targetGradeId);
    
    this.modalTitle = 'GRADE.MODALS.BULK_MOVE_CONFIRM';
    this.modalMessage = 'GRADE.MODALS.BULK_MOVE_MESSAGE';
    this.confirmAction = 'bulkMove';
    this.confirmData = {
      targetGradeId: targetGradeId,
      classIds: this.selectedClasses,
      currentGradeId: this.currentSelectedGradeId,
      targetGradeName: targetGrade?.gradeName || '',
      count: this.selectedClasses.length
    };
    this.showConfirmModal = true;
  }

  confirmActionHandler(): void {
    if (!this.confirmAction) return;

    switch (this.confirmAction) {
      case 'deleteGrade':
        this.deleteGrade();
        break;
      case 'removeClass':
        this.removeClassFromGrade();
        break;
      case 'removeSubject':
        this.removeSubjectFromGrade();
        break;
      case 'bulkMove':
        this.bulkMoveClasses();
        break;
    }
  }

  closeErrorModal(): void {
    this.deleteErrorData = null;
    this.showDeleteErrorModal = false;
  }

  closeModals(): void {
    this.showGradeModal = false;
    this.showClassModal = false;
    this.showSubjectModal = false;
    this.showBulkMoveModal = false;
    this.showDeleteModal = false;
    this.showDeleteErrorModal = false;
    this.showConfirmModal = false;
    this.showRemoveConfirmModal = false;
    
    this.gradeForm.reset();
    this.classForm.reset();
    this.subjectForm.reset();
    this.bulkMoveForm.reset();
    
    this.selectedClasses = [];
    this.currentSelectedGradeId = null;
    this.deleteErrorData = null;
    this.confirmAction = null;
    this.confirmData = null;
    this.modalTitle = '';
    this.modalMessage = '';
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

    if (this.isEditMode) {
      const updateDto: UpdateGradeDto = {
        id: formValue.id,
        gradeName: formValue.gradeName,
        description: description === '' ? undefined : description,
        curriculumId: formValue.curriculumId
      };

      this.gradeService.update(updateDto.id, updateDto).subscribe({
        next: (response: ApiResponse<GradeViewDto>) => {
          if (response.success && response.data) {
            this.toast.success('GRADE.MESSAGES.UPDATE_SUCCESS');
            this.refreshAll();
            this.closeModals();
          } else {
            this.toast.error(response.message || 'GRADE.ERRORS.UPDATE_FAILED');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update grade:', error);
          this.handleApiError(error, 'GRADE.ERRORS.UPDATE_FAILED');
          this.loading = false;
        }
      });
    } else {
      const createDto: CreateGradeDto = {
        gradeName: formValue.gradeName,
        description: description === '' ? undefined : description,
        curriculumId: formValue.curriculumId
      };

      this.gradeService.create(createDto).subscribe({
        next: (response: ApiResponse<GradeViewDto>) => {
          if (response.success && response.data) {
            this.toast.success('GRADE.MESSAGES.CREATE_SUCCESS');
            this.refreshAll();
            this.closeModals();
          } else {
            this.toast.error(response.message || 'GRADE.ERRORS.CREATE_FAILED');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to create grade:', error);
          this.handleApiError(error, 'GRADE.ERRORS.CREATE_FAILED');
          this.loading = false;
        }
      });
    }
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
            this.toast.success('GRADE.MESSAGES.CLASS_UPDATE_SUCCESS');
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadClassesForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            this.toast.error(response.message || 'GRADE.ERRORS.CLASS_UPDATE_FAILED');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update class:', error);
          this.toast.error('GRADE.ERRORS.CLASS_UPDATE_FAILED');
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
            this.toast.success('GRADE.MESSAGES.CLASS_CREATE_SUCCESS');
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadClassesForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            this.toast.error(response.message || 'GRADE.ERRORS.CLASS_CREATE_FAILED');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to create class:', error);
          this.toast.error('GRADE.ERRORS.CLASS_CREATE_FAILED');
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
            this.toast.success('GRADE.MESSAGES.SUBJECT_UPDATE_SUCCESS');
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadSubjectsForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            this.toast.error(response.message || 'GRADE.ERRORS.SUBJECT_UPDATE_FAILED');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update subject:', error);
          this.toast.error('GRADE.ERRORS.SUBJECT_UPDATE_FAILED');
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
            this.toast.success('GRADE.MESSAGES.SUBJECT_ADD_SUCCESS');
            this.clearGradeCache(gradeId);
            if (this.expandedGrades.has(gradeId)) {
              this.loadSubjectsForGrade(gradeId);
            }
            this.refreshAll();
            this.closeModals();
          } else {
            this.toast.error(response.message || 'GRADE.ERRORS.SUBJECT_ADD_FAILED');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to add subject:', error);
          this.toast.error('GRADE.ERRORS.SUBJECT_ADD_FAILED');
          this.loading = false;
        }
      });
    }
  }

  deleteGrade(): void {
    if (!this.confirmData?.gradeId) return;

    this.loading = true;
    this.gradeService.delete(this.confirmData.gradeId).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          this.toast.success('GRADE.MESSAGES.DELETE_SUCCESS');
          this.clearGradeCache(this.confirmData.gradeId);
          this.expandedGrades.delete(this.confirmData.gradeId);
          this.clearSelectionsForGrade(this.confirmData.gradeId);
          this.refreshAll();
          this.closeModals();
        } else {
          this.toast.error(response.message || 'GRADE.ERRORS.DELETE_FAILED');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to delete grade:', error);
        this.toast.error('GRADE.ERRORS.DELETE_FAILED');
        this.loading = false;
      }
    });
  }

  removeClassFromGrade(): void {
    if (!this.confirmData) return;

    const { id, gradeId } = this.confirmData;

    this.gradeService.removeClass(id).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          this.toast.success('GRADE.MESSAGES.CLASS_REMOVE_SUCCESS');
          this.clearGradeCache(gradeId);
          if (this.expandedGrades.has(gradeId)) {
            this.loadClassesForGrade(gradeId);
          }
          this.refreshAll();
          this.closeModals();
        } else {
          this.toast.error(response.message || 'GRADE.ERRORS.CLASS_REMOVE_FAILED');
        }
      },
      error: (error) => {
        console.error('Failed to remove class:', error);
        this.toast.error('GRADE.ERRORS.CLASS_REMOVE_FAILED');
      }
    });
  }

  removeSubjectFromGrade(): void {
    if (!this.confirmData) return;

    const { id, gradeId } = this.confirmData;

    this.gradeService.removeSubject(id).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          this.toast.success('GRADE.MESSAGES.SUBJECT_REMOVE_SUCCESS');
          this.clearGradeCache(gradeId);
          if (this.expandedGrades.has(gradeId)) {
            this.loadSubjectsForGrade(gradeId);
          }
          this.refreshAll();
          this.closeModals();
        } else {
          this.toast.error(response.message || 'GRADE.ERRORS.SUBJECT_REMOVE_FAILED');
        }
      },
      error: (error) => {
        console.error('Failed to remove subject:', error);
        this.toast.error('GRADE.ERRORS.SUBJECT_REMOVE_FAILED');
      }
    });
  }

  bulkMoveClasses(): void {
    if (!this.confirmData) return;

    const dto: BulkMoveClassesDto = {
      classIds: this.confirmData.classIds,
      newGradeId: this.confirmData.targetGradeId
    };

    this.loading = true;
    this.gradeService.bulkMoveClasses(dto).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success && response.data) {
          this.toast.success('GRADE.MESSAGES.BULK_MOVE_SUCCESS');
          
          if (this.currentSelectedGradeId) {
            this.clearGradeCache(this.currentSelectedGradeId);
          }
          this.clearGradeCache(this.confirmData.targetGradeId);

          if (this.currentSelectedGradeId) {
            this.clearSelectionsForGrade(this.currentSelectedGradeId);
          }
          this.selectedClasses = [];

          if (this.currentSelectedGradeId && this.expandedGrades.has(this.currentSelectedGradeId)) {
            this.loadClassesForGrade(this.currentSelectedGradeId);
          }
          if (this.expandedGrades.has(this.confirmData.targetGradeId)) {
            this.loadClassesForGrade(this.confirmData.targetGradeId);
          }

          this.refreshAll();
          this.closeModals();
        } else {
          this.toast.error(response.message || 'GRADE.ERRORS.BULK_MOVE_FAILED');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to move classes:', error);
        this.toast.error('GRADE.ERRORS.BULK_MOVE_FAILED');
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

  private handleApiError(error: any, defaultMessageKey: string): void {
    if (error.error?.errors) {
      let errorMessages = [];
      for (const [field, messages] of Object.entries(error.error.errors)) {
        errorMessages.push(`${field}: ${(messages as string[]).join(', ')}`);
      }
      this.toast.error(errorMessages.join('\n'), 'COMMON.VALIDATION_ERROR');
    } else {
      this.toast.error(error.error?.title || defaultMessageKey);
    }
  }

  getCurriculumName(curriculumId: string): string {
    const curriculum = this.curricula.find(c => c.id === curriculumId);
    return curriculum ? curriculum.name : 'GRADE.UNKNOWN_CURRICULUM';
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