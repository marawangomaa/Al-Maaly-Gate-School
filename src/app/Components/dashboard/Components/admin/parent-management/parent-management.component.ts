import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ParentService } from '../../../../../Services/parent.service';
import { StudentService } from '../../../../../Services/student.service';
import { iparentViewWithChildrenDto } from '../../../../../Interfaces/iparentViewWithChildrenDto';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { iparentViewDto } from '../../../../../Interfaces/iparentViewDto';
import { istudentProfile } from '../../../../../Interfaces/istudentProfile';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
  availableStudents: istudentProfile[] = [];
  selectedParent: iparentViewWithChildrenDto | null = null;

  // Forms
  addStudentForm: FormGroup;

  // Relation options with translation keys
  relationOptions = [
    { value: 'father', label: 'parentManagement.parentCard.relations.father' },
    { value: 'mother', label: 'parentManagement.parentCard.relations.mother' },
    { value: 'guardian', label: 'parentManagement.parentCard.relations.guardian' },
    { value: 'other', label: 'parentManagement.parentCard.relations.other' }
  ];

  constructor(
    private parentService: ParentService,
    private StudentService: StudentService,
    private AdminManagementService: AdminManagementService,
    private fb: FormBuilder,
    private translate: TranslateService
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          console.log('[loadParentWithChildren] Response received:', {
            success: result.success,
            hasData: !!result.data,
            message: result.message
          });

          if (result.success && result.data) {
            // Update the parent in our array
            const parentIndex = this.parents.findIndex(p => p.id === parentId);
            if (parentIndex !== -1) {
              this.parents[parentIndex] = result.data;
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
}