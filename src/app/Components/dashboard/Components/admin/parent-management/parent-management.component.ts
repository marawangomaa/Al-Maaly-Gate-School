import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { ParentService } from '../../../../../Services/parent.service';
import { StudentService } from '../../../../../Services/student.service';
import { iparentViewWithChildrenDto } from '../../../../../Interfaces/iparentViewWithChildrenDto';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { iparentViewDto } from '../../../../../Interfaces/iparentViewDto';
import { istudentProfile } from '../../../../../Interfaces/istudentProfile';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../../../Services/UtilServices/toast.service';

@Component({
  selector: 'app-parent-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './parent-management.component.html',
  styleUrls: ['./parent-management.component.css']
})
export class ParentManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State
  isLoading = false;
  isAddingStudent = false;
  isRemovingStudent = false;
  showAddStudentModal = false;

  // Data
  parents: iparentViewWithChildrenDto[] = [];
  filteredParents: iparentViewWithChildrenDto[] = [];
  availableStudents: istudentProfile[] = [];
  filteredAvailableStudents: istudentProfile[] = [];
  selectedParent: iparentViewWithChildrenDto | null = null;

  // Search and Filter
  searchQuery: string = '';
  showWithStudentsOnly: boolean = false;
  showWithoutStudentsOnly: boolean = false;
  private searchSubject = new Subject<string>();

  // Forms
  addStudentForm: FormGroup;

  // Relation options with translation keys
  relationOptions = [
    { value: 'father', label: 'parentManagement.parentCard.relations.father' },
    { value: 'mother', label: 'parentManagement.parentCard.relations.mother' },
    { value: 'guardian', label: 'parentManagement.parentCard.relations.guardian' },
    { value: 'other', label: 'parentManagement.parentCard.relations.other' }
  ];
   //Modal State
  isConfirmModalOpen: boolean = false;
  confirmModalMessage: string = '';
  private confirmAction?: () => void;

  constructor(
    private parentService: ParentService,
    private StudentService: StudentService,
    private AdminManagementService: AdminManagementService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.addStudentForm = this.fb.group({
      parentId: ['', Validators.required],
      studentId: ['', Validators.required],
      relation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAllParentsWithChildren();
    this.loadAvailableStudents();
    
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filter Methods
  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  applyFilters(): void {
    this.filteredParents = this.parents.filter(parent => {
      // Search filter
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase();
        const matchesSearch = 
          parent.fullName.toLowerCase().includes(searchLower) ||
          parent.email.toLowerCase().includes(searchLower) ||
          (parent.contactInfo && parent.contactInfo.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Students filter
      if (this.showWithStudentsOnly && !this.showWithoutStudentsOnly) {
        if (parent.students.length === 0) return false;
      }
      
      if (this.showWithoutStudentsOnly && !this.showWithStudentsOnly) {
        if (parent.students.length > 0) return false;
      }

      return true;
    });

    // Filter available students for modal
    this.filterAvailableStudents();
  }

  filterAvailableStudents(): void {
    if (!this.selectedParent || !this.availableStudents.length) {
      this.filteredAvailableStudents = [...this.availableStudents];
      return;
    }

    const searchLower = this.searchQuery.toLowerCase();
    this.filteredAvailableStudents = this.availableStudents.filter(student => {
      // Search filter for students
      if (searchLower) {
        const matchesSearch = 
          student.fullName.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          (student.className && student.className.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      return true;
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearFilter(filterType: string): void {
    switch(filterType) {
      case 'withStudents':
        this.showWithStudentsOnly = false;
        break;
      case 'withoutStudents':
        this.showWithoutStudentsOnly = false;
        break;
    }
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.showWithStudentsOnly = false;
    this.showWithoutStudentsOnly = false;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchQuery || this.showWithStudentsOnly || this.showWithoutStudentsOnly;
  }

  // Stats getters
  get totalParents(): number {
    return this.parents.length;
  }

  get parentsWithStudents(): number {
    return this.parents.filter(p => p.students.length > 0).length;
  }

  get totalStudents(): number {
    return this.parents.reduce((total, parent) => total + parent.students.length, 0);
  }

  get averageStudentsPerParent(): string {
    if (this.parentsWithStudents === 0) return '0';
    return (this.totalStudents / this.parentsWithStudents).toFixed(1);
  }

  // Load all parents with their children data
  loadAllParentsWithChildren(): void {
    this.isLoading = true;
    this.parentService.GetAllParents()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (result: ApiResponse<iparentViewDto[]>) => {
          if (result.success && result.data) {
            // For each parent, load their children
            this.loadParentsWithChildrenSequentially(result.data);
          } else {
            const errorMsg = this.translate.instant('parentManagement.messages.loadingFailed');
            console.log(result.message || errorMsg);
          }
        },
        error: (error) => {
          const errorMsg = this.translate.instant('parentManagement.messages.errorLoadingParents');
          console.error(errorMsg, error);
        }
      });
  }

  // Load children for each parent sequentially
  private loadParentsWithChildrenSequentially(parentsWithoutChildren: iparentViewDto[]): void {
    const parentsWithChildren: iparentViewWithChildrenDto[] = [];
    let completedCount = 0;

    if (parentsWithoutChildren.length === 0) {
      this.parents = [];
      this.filteredParents = [];
      return;
    }

    parentsWithoutChildren.forEach(parent => {
      this.parentService.getParentWithChildren(parent.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse<iparentViewWithChildrenDto>) => {
            if (result.success && result.data) {
              parentsWithChildren.push(result.data);
            } else {
              // Create a basic parent object if fetching children fails
              parentsWithChildren.push({
                ...parent,
                students: []
              });
            }

            completedCount++;

            // When all parents are processed
            if (completedCount === parentsWithoutChildren.length) {
              this.parents = parentsWithChildren;
              this.applyFilters();
            }
          },
          error: (error) => {
            const errorMsg = this.translate.instant('parentManagement.messages.errorLoadingChildren');
            console.error(`${errorMsg} ${parent.id}:`, error);
            // Add parent without children
            parentsWithChildren.push({
              ...parent,
              students: []
            });

            completedCount++;
            if (completedCount === parentsWithoutChildren.length) {
              this.parents = parentsWithChildren;
              this.applyFilters();
            }
          }
        });
    });
  }

  loadParentWithChildren(parentId: string): void {
    this.parentService.getParentWithChildren(parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse<iparentViewWithChildrenDto>) => {
          if (result.success && result.data) {
            // Update the parent in our array
            const parentIndex = this.parents.findIndex(p => p.id === parentId);
            if (parentIndex !== -1) {
              this.parents[parentIndex] = result.data;
              this.applyFilters();
            }
          }
        },
        error: (error) => {
          const errorMsg = this.translate.instant('parentManagement.messages.errorLoadingParentDetails');
          console.error(errorMsg, error);
        }
      });
  }

  loadAvailableStudents(): void {
    this.StudentService.GetAllStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse<istudentProfile[]>) => {
          if (result.success && result.data) {
            this.availableStudents = result.data;
            this.filteredAvailableStudents = [...result.data];
          }
        },
        error: (error) => {
          const errorMsg = this.translate.instant('parentManagement.messages.errorLoadingAvailableStudents');
          console.error(errorMsg, error);
        }
      });
  }

  openAddStudentModal(parent: iparentViewWithChildrenDto): void {
    this.selectedParent = parent;
    this.addStudentForm.patchValue({
      parentId: parent.id,
      relation: 'other' // Default value
    });
    this.showAddStudentModal = true;
    this.filterAvailableStudents();
  }

  closeAddStudentModal(): void {
    this.showAddStudentModal = false;
    this.addStudentForm.reset();
    this.selectedParent = null;
  }

  addStudent(): void {
    if (this.addStudentForm.invalid) {
      const errorMsg = this.translate.instant('parentManagement.messages.fillAllFields');
      alert(errorMsg);
      return;
    }

    const parentId = this.addStudentForm.value.parentId;
    const relation = this.addStudentForm.value.relation;
    const studentId = this.addStudentForm.value.studentId;

    this.isAddingStudent = true;

    this.AdminManagementService.AddStudentToExistingParent(parentId, studentId, relation)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isAddingStudent = false;
          this.closeAddStudentModal();
        })
      )
      .subscribe({
        next: (result: ApiResponse<boolean>) => {
          if (result.success && result.data) {
            const successMsg = this.translate.instant('parentManagement.messages.addStudentSuccess');
            alert(successMsg);
            // Reload the parent's data
            if (parentId) {
              this.loadParentWithChildren(parentId);
            }
          } else {
            const errorMsg = result.message || this.translate.instant('parentManagement.messages.addStudentFailed');
            alert(errorMsg);
          }
        },
        error: (error: any) => {
          const errorMsg = this.translate.instant('parentManagement.messages.errorAddingStudent');
          console.error(errorMsg, error);
          const alertMsg = this.translate.instant('parentManagement.messages.errorOccurred');
          alert(alertMsg + ' ' + this.translate.instant('parentManagement.messages.addStudentFailed'));
        }
      });
  }

  removeStudent(parentId: string, studentId: string): void {
    const confirmMsg = this.translate.instant('parentManagement.messages.confirmRemove');
    if (!confirm(confirmMsg)) {
      return;
    }

    this.isRemovingStudent = true;

    this.AdminManagementService.removeStudentToParent(parentId, studentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isRemovingStudent = false)
      )
      .subscribe({
        next: (result: ApiResponse<boolean>) => {
          if (result.success && result.data) {
            const successMsg = this.translate.instant('parentManagement.messages.removeStudentSuccess');
            alert(successMsg);
            // Reload the parent's data
            this.loadParentWithChildren(parentId);
          } else {
            const errorMsg = result.message || this.translate.instant('parentManagement.messages.removeStudentFailed');
            alert(errorMsg);
          }
        },
        error: (error) => {
          const errorMsg = this.translate.instant('parentManagement.messages.errorRemovingStudent');
          console.error(errorMsg, error);
          const alertMsg = this.translate.instant('parentManagement.messages.errorOccurred');
          alert(alertMsg + ' ' + this.translate.instant('parentManagement.messages.removeStudentFailed'));
        }
      });
  }

  getStudentAlreadyLinked(studentId: string): boolean {
    if (!this.selectedParent) return false;
    return this.selectedParent.students.some(s => s.id === studentId);
  }

  //Modal  Methods
  openConfirmAsync(message: string, action: () => Promise<void>): void {
    this.confirmModalMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }
  openConfirm(message: string, action: () => void): void {
    this.confirmModalMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  confirmYes(): void {
    this.confirmAction?.();
    this.closeConfirm();
  }

  closeConfirm(): void {
    this.isConfirmModalOpen = false;
    this.confirmModalMessage = '';
    this.confirmAction = undefined;
  }
}