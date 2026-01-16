import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateCurriculum, Curriculum, CurriculumDetails, UpdateCurriculum } from '../../../../../Interfaces/icurriculum';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CurriculumService } from '../../../../../Services/curriculum.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ApiError } from '../../../../../Interfaces/api-error';

@Component({
  selector: 'app-curriculum',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './curriculum.component.html',
  styleUrl: './curriculum.component.css'
})
export class CurriculumComponent {
  @ViewChild('createModal') createModal!: ElementRef;
  @ViewChild('editModal') editModal!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;
  @ViewChild('deleteModal') deleteModal!: ElementRef;
  @ViewChild('checkModal') checkModal!: ElementRef;
  @ViewChild('errorModal') errorModal!: ElementRef;

  showErrorModal: boolean = false;
  errorModalMessage: string = '';

  get searchTermControl(): FormControl {
    return this.searchForm.get('searchTerm') as FormControl;
  }

  get createNameControl(): FormControl {
    return this.createForm.get('name') as FormControl;
  }

  get createCodeControl(): FormControl {
    return this.createForm.get('code') as FormControl;
  }

  get createDescriptionControl(): FormControl {
    return this.createForm.get('description') as FormControl;
  }

  get editNameControl(): FormControl {
    return this.editForm.get('name') as FormControl;
  }

  get editCodeControl(): FormControl {
    return this.editForm.get('code') as FormControl;
  }

  get editDescriptionControl(): FormControl {
    return this.editForm.get('description') as FormControl;
  }

  curricula: Curriculum[] = [];
  selectedCurriculum: Curriculum | null = null;
  curriculumDetails: CurriculumDetails | null = null;

  createForm: FormGroup;
  editForm: FormGroup;
  searchForm: FormGroup;

  loading = false;
  detailsLoading = false;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showCheckModal = false;

  currentAction: 'delete' | 'checkStudents' | 'checkTeachers' | null = null;
  checkResult: boolean = false;

  sortColumn: keyof Curriculum = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Toast messages
  toastMessages: { message: string, type: 'success' | 'error' | 'info', id: number }[] = [];
  private toastId = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private curriculumService: CurriculumService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(500)]]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(500)]]
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurricula();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearch(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.searchTerm = term.toLowerCase();
      });
  }

  loadCurricula(): void {
    this.loading = true;
    this.curriculumService.getAll()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.curricula = data;
          this.showToast('Curricula loaded successfully', 'success');
        },
        error: (error) => {
          this.showToast('Failed to load curricula', 'error');
          console.error('Error loading curricula:', error);
        }
      });
  }

  // Toast system
  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastId;
    this.toastMessages.push({ message, type, id });

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }

  removeToast(id: number): void {
    this.toastMessages = this.toastMessages.filter(toast => toast.id !== id);
  }

  // Modal handlers
  openCreateModal(): void {
    this.createForm.reset();
    this.showCreateModal = true;
    setTimeout(() => {
      const modalElement = this.createModal.nativeElement;
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    const modalElement = this.createModal.nativeElement;
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }

  openEditModal(curriculum: Curriculum): void {
    this.selectedCurriculum = curriculum;
    this.editForm.patchValue({
      name: curriculum.name,
      code: curriculum.code,
      description: curriculum.description
    });
    this.showEditModal = true;
    setTimeout(() => {
      const modalElement = this.editModal.nativeElement;
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    const modalElement = this.editModal.nativeElement;
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }

  openDetailsModal(curriculum: Curriculum): void {
    this.selectedCurriculum = curriculum;
    this.detailsLoading = true;
    this.showDetailsModal = true;

    this.curriculumService.getWithDetails(curriculum.id)
      .pipe(
        finalize(() => this.detailsLoading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (details) => {
          this.curriculumDetails = details;
          setTimeout(() => {
            const modalElement = this.detailsModal.nativeElement;
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.show();
          });
        },
        error: (error) => {
          this.showToast('Failed to load curriculum details', 'error');
          this.closeDetailsModal();
        }
      });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    const modalElement = this.detailsModal.nativeElement;
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }

  openDeleteModal(curriculum: Curriculum): void {
    this.selectedCurriculum = curriculum;
    this.currentAction = 'delete';
    this.showDeleteModal = true;
    setTimeout(() => {
      const modalElement = this.deleteModal.nativeElement;
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    const modalElement = this.deleteModal.nativeElement;
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }

  openCheckModal(curriculum: Curriculum, type: 'checkStudents' | 'checkTeachers'): void {
    this.selectedCurriculum = curriculum;
    this.currentAction = type;
    this.checkResult = false;

    const serviceCall = type === 'checkStudents'
      ? this.curriculumService.hasStudents(curriculum.id)
      : this.curriculumService.hasTeachers(curriculum.id);

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.checkResult = result;
          this.showCheckModal = true;
          setTimeout(() => {
            const modalElement = this.checkModal.nativeElement;
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.show();
          });
        },
        error: (error) => {
          this.showToast(`Failed to check ${type}`, 'error');
        }
      });
  }

  closeCheckModal(): void {
    this.showCheckModal = false;
    const modalElement = this.checkModal.nativeElement;
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }

  // CRUD Operations
  createCurriculum(): void {
    if (this.createForm.invalid) {
      this.markFormGroupTouched(this.createForm);
      return;
    }

    const formValue = this.createForm.value;

    // Ensure description is always an empty string if not provided
    const newCurriculum: CreateCurriculum = {
      name: formValue.name,
      code: formValue.code,
      description: formValue.description || ''  // Convert null/undefined to empty string
    };
    this.loading = true;
    this.curriculumService.create(newCurriculum)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (created) => {
          this.curricula.unshift(created);
          this.closeCreateModal();
          this.showToast('Curriculum created successfully', 'success');
        },
        error: (error) => {
          this.showToast(error.message || 'Failed to create curriculum', 'error');
        }
      });
  }

  updateCurriculum(): void {
    if (this.editForm.invalid || !this.selectedCurriculum) {
      this.markFormGroupTouched(this.editForm);
      return;
    }

    const updatedCurriculum: UpdateCurriculum = this.editForm.value;
    this.loading = true;

    this.curriculumService.update(this.selectedCurriculum.id, updatedCurriculum)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (updated) => {
          const index = this.curricula.findIndex(c => c.id === updated.id);
          if (index !== -1) {
            this.curricula[index] = updated;
          }
          this.closeEditModal();
          this.showToast('Curriculum updated successfully', 'success');
        },
        error: (error) => {
          this.showToast(error.message || 'Failed to update curriculum', 'error');
        }
      });
  }

  deleteCurriculum(): void {
    if (!this.selectedCurriculum) return;

    this.loading = true;
    this.curriculumService.delete(this.selectedCurriculum.id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.closeDeleteModal();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.curricula = this.curricula.filter(c => c.id !== this.selectedCurriculum!.id);
          this.showToast('Curriculum deleted successfully', 'success');
          this.loadCurricula();
        },
        error: (error: any) => {
          let errorMessage = 'Failed to delete curriculum';

          if (error.error) {
            const apiError = error.error as ApiError;
            if (apiError.message) {
              errorMessage = apiError.message;
            }
            if (apiError.errors) {
              const constraintErrors = Object.values(apiError.errors).flat();
              if (constraintErrors.length > 0) {
                errorMessage += ': ' + constraintErrors.join(' ');
              }
            }
            if (error.status === 409) {
              errorMessage = 'This curriculum cannot be deleted because it is being used by other records.';
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to delete this curriculum.';
            } else if (error.status === 404) {
              errorMessage = 'Curriculum not found. It may have been already deleted.';
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          console.log('Showing error popup with message:', errorMessage);
          this.showErrorPopup(errorMessage); // Changed from showDetailedErrorInModal to showErrorPopup
        }
      });
  }

  showErrorPopup(errorMessage: string): void {
    console.log('Showing error popup with message:', errorMessage);

    this.errorModalMessage = errorMessage;
    this.showErrorModal = true;

    // Close delete modal if it's open
    this.closeDeleteModal();

    // Prevent body scrolling when error popup is shown
    document.body.style.overflow = 'hidden';

    // Force change detection
    this.cdRef.detectChanges();
  }

  closeErrorModal(): void {
    this.showErrorModal = false;

    // Restore body scrolling
    document.body.style.overflow = '';

    // Force change detection
    this.cdRef.detectChanges();
  }

  // Helper methods
  sort(column: keyof Curriculum): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.curricula.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return this.sortDirection === 'asc'
        ? (valueA as any) - (valueB as any)
        : (valueB as any) - (valueA as any);
    });
  }

  get filteredCurricula(): Curriculum[] {
    if (!this.searchTerm) return this.curricula;

    return this.curricula.filter(curriculum =>
      curriculum.name.toLowerCase().includes(this.searchTerm) ||
      curriculum.code.toLowerCase().includes(this.searchTerm) ||
      curriculum.description.toLowerCase().includes(this.searchTerm)
    );
  }

  getSortIcon(column: keyof Curriculum): string {
    if (this.sortColumn !== column) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFormControlClass(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (!control) return '';

    if (control.touched && control.invalid) return 'is-invalid';
    if (control.touched && control.valid) return 'is-valid';
    return '';
  }

  getCheckModalTitle(): string {
    if (!this.selectedCurriculum) return '';

    if (this.currentAction === 'checkStudents') {
      return `Check Students for ${this.selectedCurriculum.name}`;
    } else {
      return `Check Teachers for ${this.selectedCurriculum.name}`;
    }
  }

  getCheckModalMessage(): string {
    if (!this.selectedCurriculum) return '';

    const curriculumName = this.selectedCurriculum.name;

    if (this.currentAction === 'checkStudents') {
      return this.checkResult
        ? `✅ ${curriculumName} has students assigned.`
        : `ℹ️ ${curriculumName} has no students assigned.`;
    } else {
      return this.checkResult
        ? `✅ ${curriculumName} has teachers specialized.`
        : `ℹ️ ${curriculumName} has no teachers specialized.`;
    }
  }

  getToastClass(type: 'success' | 'error' | 'info'): string {
    switch (type) {
      case 'success': return 'alert-success';
      case 'error': return 'alert-danger';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  }
  onViewDetailsClick(): void {
    this.closeErrorModal();
    if (this.selectedCurriculum) {
      this.openDetailsModal(this.selectedCurriculum);
    }
  }

  onEditInsteadClick(): void {
    this.closeErrorModal();
    if (this.selectedCurriculum) {
      this.openEditModal(this.selectedCurriculum);
    }
  }

  onTryAgainClick(): void {
    this.closeErrorModal();
    if (this.selectedCurriculum) {
      this.openDeleteModal(this.selectedCurriculum);
    }
  }
  ngAfterViewInit(): void {
    // Debug: Check if modal elements exist
    console.log('Create modal:', this.createModal?.nativeElement);
    console.log('Edit modal:', this.editModal?.nativeElement);
    console.log('Error modal:', this.errorModal?.nativeElement);
  }
}
