import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubjectService } from '../../../../../Services/subject.service';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { SubjectCreateDto, SubjectViewDto } from '../../../../../Interfaces/isubject';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeService } from '../../../../../Services/grade.service';
import { GradeViewDto } from '../../../../../Interfaces/igrade';
import { TeacherService } from '../../../../../Services/teacher.service';
import { TeacherViewDto } from '../../../../../Interfaces/iteacher';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../../../Services/UtilServices/toast.service';

@Component({
  selector: 'app-admin-subject-management',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, TranslateModule],
  templateUrl: './admin-subject-management.component.html',
  styleUrl: './admin-subject-management.component.css'
})
export class AdminSubjectManagementComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  filteredSubjects: SubjectViewDto[] = [];
  subjects: SubjectViewDto[] = [];
  grades: GradeViewDto[] = [];
  subscription: Subscription = new Subscription();
  
  // Form state
  subjectName: string = '';
  gradeId: string = '';
  creditHours: number = 0;
  
  // Modal state
  isCreateSubjectModalOpen: boolean = false;
  
  // Teacher assignment modal state
  isTeachersModalOpen: boolean = false;
  selectedSubjectId: string = '';
  selectedSubjectName: string = '';
  teachersNotAssignedToSubject: TeacherViewDto[] = [];
  teachersAssignedToSubject: TeacherViewDto[] = [];

  // Confirmation modal state
  isDeleteConfirmationModalOpen: boolean = false;
  subjectToDeleteId: string = '';
  subjectToDeleteName: string = '';

  constructor(
    private _subjectService: SubjectService,
    private _gradeService: GradeService,
    private _teacherService: TeacherService,
    private adminManagementService: AdminManagementService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.LoadAllSubjects();
    this.loadAllGrades();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openModalCreateSubject(): void {
    this.isCreateSubjectModalOpen = true;
  }

  public closeModalCreateSubject(): void {
    this.isCreateSubjectModalOpen = false;
    this.resetForm();
  }

  // Teacher assignment modal controls
  public openTeachersModal(subjectId: string, subjectName: string): void {
    this.selectedSubjectId = subjectId;
    this.selectedSubjectName = subjectName;
    this.isTeachersModalOpen = true;
    this.loadTeachersNotAssignedToSubject(subjectId);
    this.loadTeachersAssignedToSubject(subjectId);
  }

  public closeTeachersModal(): void {
    this.isTeachersModalOpen = false;
    this.teachersNotAssignedToSubject = [];
    this.teachersAssignedToSubject = [];
  }

  // Delete confirmation modal
  public openDeleteConfirmationModal(subjectId: string, subjectName: string): void {
    this.subjectToDeleteId = subjectId;
    this.subjectToDeleteName = subjectName;
    this.isDeleteConfirmationModalOpen = true;
  }

  public closeDeleteConfirmationModal(): void {
    this.isDeleteConfirmationModalOpen = false;
    this.subjectToDeleteId = '';
    this.subjectToDeleteName = '';
  }

  public onCreateSubjectClick(): void {
    if (!this.subjectName || !this.gradeId || this.creditHours <= 0) {
      this.toastService.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.CreateSubjectService(
      this.subjectName,
      this.gradeId,
      this.creditHours
    );
  }

  public onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredSubjects = this.subjects;
      return;
    }

    this.filteredSubjects = this.subjects.filter(s =>
      s.subjectName.toLowerCase().includes(term) ||
      (s.gradeName && s.gradeName.toLowerCase().includes(term))
    );
  }

  public clickAssignTeacherToSubject(teacherId: string, subjectId: string): void {
    this.assignTeacherToSubject(teacherId, subjectId);
  }

  public clickUnassignTeacherFromSubject(teacherId: string, subjectId: string): void {
    this.unassignTeacherFromSubject(teacherId, subjectId);
  }

  public confirmDeleteSubject(): void {
    if (!this.subjectToDeleteId) return;
    
    this.deleteSubject(this.subjectToDeleteId);
    this.closeDeleteConfirmationModal();
  }

  private resetForm(): void {
    this.subjectName = '';
    this.gradeId = '';
    this.creditHours = 0;
  }

  private LoadAllSubjects(): void {
    ApiResponseHandler.handleApiResponse(this._subjectService.getAll()).subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.filteredSubjects = [...subjects];
      },
      error: (error) => {
        console.error('Error loading subjects:', error.message);
        this.toastService.error('Failed to load subjects', 'Error');
      }
    });
  }

  private CreateSubjectService(name: string, gradeId: string, creditHours: number): void {
    const dto: SubjectCreateDto = {
      subjectName: name,
      gradeId: gradeId,
      creditHours: creditHours
    };
    
    ApiResponseHandler.handleApiResponse(this._subjectService.create(dto)).subscribe({
      next: (subject) => {
        this.toastService.success('Subject created successfully', 'Success');
        this.closeModalCreateSubject();
        this.LoadAllSubjects();
      },
      error: (error) => {
        console.error('Error creating subject:', error.message);
        this.toastService.error('Failed to create subject', 'Error');
      }
    });
  }

  // Grade dropdown population
  private loadAllGrades(): void {
    ApiResponseHandler.handleApiResponse(this._gradeService.getAll()).subscribe({
      next: (grades) => {
        this.grades = grades;
      },
      error: (error) => {
        console.error('Error loading grades:', error.message);
        this.toastService.error('Failed to load grades', 'Error');
      }
    });
  }

  // Teacher menu population
  private loadTeachersNotAssignedToSubject(subjectId: string): void {
    ApiResponseHandler.handleApiResponse(this._teacherService.getTeachersNotAssignedToSubject(subjectId)).subscribe({
      next: (teachers) => {
        this.teachersNotAssignedToSubject = teachers ?? [];
      },
      error: (error) => {
        console.error('Error loading teachers not assigned to subject:', error.message);
        this.teachersNotAssignedToSubject = [];
        this.toastService.error('Failed to load teachers', 'Error');
      }
    });
  }

  private assignTeacherToSubject(teacherId: string, subjectId: string): void {
    this.adminManagementService.AssignTeacherToSubject(teacherId, subjectId).subscribe({
      next: (result) => {
        this.toastService.success('Teacher assigned to subject successfully', 'Success');
        this.loadTeachersNotAssignedToSubject(subjectId);
        this.loadTeachersAssignedToSubject(subjectId);
      },
      error: (error) => {
        console.error('Error assigning teacher to subject:', error.message);
        this.toastService.error('Failed to assign teacher', 'Error');
      }
    });
  }

  // Teacher Menu to unassign
  private loadTeachersAssignedToSubject(subjectId: string): void {
    ApiResponseHandler.handleApiResponse(this._teacherService.getTeachersAssignedToSubject(subjectId)).subscribe({
      next: (teachers) => {
        this.teachersAssignedToSubject = teachers ?? [];
      },
      error: (error) => {
        console.error('Error loading teachers assigned to subject:', error.message);
        this.teachersAssignedToSubject = [];
        this.toastService.error('Failed to load assigned teachers', 'Error');
      }
    });
  }

  private unassignTeacherFromSubject(teacherId: string, subjectId: string): void {
    this.adminManagementService.UnAssignTeacherFromSubject(teacherId, subjectId).subscribe({
      next: (result) => {
        this.toastService.success('Teacher unassigned from subject successfully', 'Success');
        this.loadTeachersAssignedToSubject(subjectId);
        this.loadTeachersNotAssignedToSubject(subjectId);
      },
      error: (error) => {
        console.error('Error unassigning teacher from subject:', error.message);
        this.toastService.error('Failed to unassign teacher', 'Error');
      }
    });
  }

  private deleteSubject(subjectId: string): void {
    ApiResponseHandler.handleApiResponse(this._subjectService.delete(subjectId)).subscribe({
      next: (result) => {
        this.toastService.success('Subject deleted successfully', 'Success');
        this.subjects = this.subjects.filter(s => s.id !== subjectId);
        this.filteredSubjects = this.filteredSubjects.filter(s => s.id !== subjectId);
      },
      error: (error) => {
        console.error('Error deleting subject:', error.message);
        this.toastService.error('Failed to delete subject', 'Error');
      }
    });
  }
}