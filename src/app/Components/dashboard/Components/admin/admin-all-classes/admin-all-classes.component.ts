import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../../../Services/class.service';
import { GradeService } from '../../../../../Services/grade.service';
import { CurriculumService } from '../../../../../Services/curriculum.service';
import { BulkMoveClassesDto, ClassDto, ClassViewDto, CreateClassDto, UpdateClassDto } from '../../../../../Interfaces/iclass';
import { GradeViewDto } from '../../../../../Interfaces/igrade';
import { Curriculum } from '../../../../../Interfaces/icurriculum';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { TeacherService } from '../../../../../Services/teacher.service';
import { Teacher } from '../../../../../Interfaces/teacher';
import { TranslateModule } from '@ngx-translate/core';
import { BulkAssignTeachersDto } from '../../../../../Interfaces/iteacher';
import { SubjectService } from '../../../../../Services/subject.service';
import { ToastService } from '../../../../../Services/UtilServices/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-all-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-all-classes.component.html',
  styleUrl: './admin-all-classes.component.css'
})
export class AdminAllClassesComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  // Main data arrays
  allClasses: ClassViewDto[] = [];
  filteredClasses: ClassViewDto[] = [];
  allTeachers: any[] = [];
  filteredTeachers: Teacher[] = [];
  allGrades: GradeViewDto[] = [];
  allCurricula: Curriculum[] = [];
  
  // Selection and state management
  selectedClassId: string | null = null;
  selectedClass: ClassViewDto | null = null;
  selectedClasses: string[] = [];
  classStudents: any[] = [];

  // Modal data
  classTeachers: any[] = [];
  classSubjects: any[] = [];
  classStats: any = null;

  // UI state
  isLoadingDetails = false;
  loading = false;

  // Filtering and search
  selectedGradeFilter: string = '';
  selectedCurriculumFilter: string = '';
  searchTerm: string = '';
  sortBy: string = 'className';
  teacherSearchTerm: string = '';
  teacherSubjectFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Bulk operations
  currentBulkOperation: string = '';
  bulkOperationTitle: string = '';
  bulkMoveGradeId: string = '';
  selectedTeacherIds: string[] = [];
  bulkTeachers: Teacher[] = [];

  // Available data for filters
  availableSubjects: string[] = [];

  // Form models
  newClass: CreateClassDto = {
    className: '',
    gradeId: ''
  };

  // Edit form model
  editClassData: UpdateClassDto = {
    id: '',
    className: '',
    gradeId: ''
  };

  // Confirmation modal
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  confirmationAction: () => void = () => {};
  confirmationType: 'danger' | 'warning' | 'info' = 'info';
  confirmButtonText: string = 'Confirm';
  cancelButtonText: string = 'Cancel';

  constructor(
    private classService: ClassService,
    private gradeService: GradeService,
    private curriculumService: CurriculumService,
    private adminManagementService: AdminManagementService,
    private teacherService: TeacherService,
    private SubjectService: SubjectService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadAllClasses();
    this.loadAllGrades();
    this.loadAllCurricula();
    this.loadAvailableSubjects();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // ========== DATA LOADING METHODS ==========

  private loadAllClasses(): void {
    this.loading = true;
    ApiResponseHandler.handleApiResponse<ClassViewDto[]>(this.classService.getAll()).subscribe({
      next: (classes) => {
        this.allClasses = classes;
        this.enhanceClassesWithCurriculumInfo();
        this.filterClasses();
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        // console.error('Error loading classes:', error);
        this.toastService.error('Failed to load classes', 'Error');
        this.loading = false;
      }
    });
  }

  private loadAllGrades(): void {
    ApiResponseHandler.handleApiResponse<GradeViewDto[]>(this.gradeService.getAll()).subscribe({
      next: (grades) => {
        this.allGrades = grades;
      },
      error: (error) => {
        console.error('Error loading grades:', error);
        this.toastService.error('Failed to load grades', 'Error');
      }
    });
  }

  private loadAllCurricula(): void {
    this.curriculumService.getAll().subscribe({
      next: (curricula) => {
        this.allCurricula = curricula;
      },
      error: (error) => {
        console.error('Error loading curricula:', error);
        this.toastService.error('Failed to load curricula', 'Error');
      }
    });
  }

  private loadAvailableSubjects(): void {
    this.SubjectService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.availableSubjects = response.data.map((subject: any) => subject.subjectName);
        } else {
          console.warn('No subjects found or API returned error');
          this.availableSubjects = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading subjects:', error);
        this.toastService.error('Failed to load subjects', 'Error');
        this.availableSubjects = [];
      }
    });
  }

  private enhanceClassesWithCurriculumInfo(): void {
    this.allClasses.forEach(cls => {
      const grade = this.allGrades.find(g => g.id === cls.gradeId);
      if (grade) {
        (cls as any).curriculumId = grade.curriculumId;
        (cls as any).curriculumName = grade.curriculumName || this.getCurriculumName(grade.curriculumId);
      }
    });
  }

  // ========== FILTERING AND SEARCH METHODS ==========

  filterClasses(): void {
    let filtered = this.allClasses;

    if (this.selectedGradeFilter) {
      filtered = filtered.filter(c => c.gradeId === this.selectedGradeFilter);
    }

    if (this.selectedCurriculumFilter) {
      const curriculumGrades = this.allGrades.filter(g => g.curriculumId === this.selectedCurriculumFilter);
      const curriculumGradeIds = curriculumGrades.map(g => g.id);
      filtered = filtered.filter(c => curriculumGradeIds.includes(c.gradeId));
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.className.toLowerCase().includes(term) ||
        (c.gradeName && c.gradeName.toLowerCase().includes(term)) ||
        ((c as any).curriculumName && (c as any).curriculumName.toLowerCase().includes(term))
      );
    }

    filtered = this.sortClassesArray(filtered);

    this.filteredClasses = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  private sortClassesArray(classes: ClassViewDto[]): ClassViewDto[] {
    return classes.sort((a, b) => {
      switch (this.sortBy) {
        case 'studentCount':
          return (b.studentCount || 0) - (a.studentCount || 0);
        case 'teacherCount':
          return (b.teacherCount || 0) - (a.teacherCount || 0);
        case 'gradeName':
          return (a.gradeName || '').localeCompare(b.gradeName || '');
        case 'curriculumName':
          return ((a as any).curriculumName || '').localeCompare((b as any).curriculumName || '');
        case 'className':
        default:
          return a.className.localeCompare(b.className);
      }
    });
  }

  sortClasses(): void {
    this.filterClasses();
  }

  filterTeachers(): void {
    if (!this.allTeachers.length) return;

    let filtered = this.allTeachers;

    if (this.teacherSearchTerm) {
      const term = this.teacherSearchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.fullName.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
      );
    }

    if (this.teacherSubjectFilter) {
      filtered = filtered.filter(t =>
        t.subjects && t.subjects.includes(this.teacherSubjectFilter)
      );
    }

    this.filteredTeachers = filtered;
  }

  onCurriculumFilterChange(): void {
    if (this.selectedCurriculumFilter) {
      const curriculumGrades = this.allGrades.filter(g => g.curriculumId === this.selectedCurriculumFilter);
      if (this.selectedGradeFilter) {
        const selectedGrade = this.allGrades.find(g => g.id === this.selectedGradeFilter);
        if (selectedGrade && selectedGrade.curriculumId !== this.selectedCurriculumFilter) {
          this.selectedGradeFilter = '';
        }
      }
    }
    this.filterClasses();
  }

  onGradeFilterChange(): void {
    this.filterClasses();
  }

  // ========== CLASS DETAILS METHODS ==========

  viewClassDetails(classId: string): void {
    this.selectedClass = this.allClasses.find(c => c.id === classId) || null;
    
    if (this.selectedClass) {
      this.isLoadingDetails = true;
      
      this.onClassSelected(classId);
      this.loadClassSubjects(classId);
      this.loadClassStatistics(classId);
      this.loadClassStudents(classId);
      
      const modal = new bootstrap.Modal(document.getElementById('classDetailsModal'));
      modal.show();
      
      this.isLoadingDetails = false;
    }
  }

  onClassSelected(classId: string): void {
    this.selectedClassId = classId;
    this.loadClassTeachers(classId);
  }

  private loadClassTeachers(classId: string): void {
    this.adminManagementService.getTeachersByClass(classId).subscribe({
      next: (response: any) => {
        if (response && typeof response === 'object') {
          if (response.success !== undefined && response.data !== undefined) {
            this.classTeachers = response.data || [];
          } else if (Array.isArray(response)) {
            this.classTeachers = response;
          } else {
            this.classTeachers = [];
          }
        } else {
          this.classTeachers = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading class teachers:', error);
        this.classTeachers = [];
      }
    });
  }

  private loadClassStudents(classId: string): void {
    this.classService.getById(classId).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.students) {
          this.classStudents = response.data.students;
        } else {
          this.classStudents = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading class students:', error);
        this.classStudents = [];
      }
    });
  }

  private loadClassSubjects(classId: string): void {
    const classObj = this.allClasses.find(c => c.id === classId);
    if (classObj && classObj.gradeId) {
      this.gradeService.getSubjectsByGrade(classObj.gradeId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.classSubjects = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading class subjects:', error);
          this.classSubjects = [];
        }
      });
    }
  }

  private loadClassStatistics(classId: string): void {
    this.classService.getClassStatistics(classId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.classStats = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading class statistics:', error);
        this.classStats = null;
      }
    });
  }

  // ========== TEACHER MANAGEMENT METHODS ==========

  loadAllTeachers(): void {
    if (!this.selectedClassId) return;

    this.teacherService.getTeachersNotAssignedToClass(this.selectedClassId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allTeachers = response.data;
          this.filteredTeachers = [...this.allTeachers];
        } else {
          console.error('Error loading teachers:', response.message);
          this.allTeachers = [];
          this.filteredTeachers = [];
        }
      },
      error: (err) => {
        console.error('Error loading teachers:', err);
        this.toastService.error('Failed to load teachers', 'Error');
        this.allTeachers = [];
        this.filteredTeachers = [];
      }
    });
  }

  openAssignTeacherModal(classId: string): void {
    this.selectedClassId = classId;
    this.loadAllTeachers();
  }

  assignTeacherToClass(teacherId: string, classId: string): void {
    this.adminManagementService.AssignTeacherToClass(teacherId, classId).subscribe({
      next: (result) => {
        if (result) {
          this.toastService.success('Teacher assigned successfully!', 'Success');
          this.allTeachers = this.allTeachers.filter(t => t.id !== teacherId);
          this.filteredTeachers = this.filteredTeachers.filter(t => t.id !== teacherId);
          this.loadClassTeachers(classId);
          this.loadAllClasses();
        } else {
          this.toastService.error('Failed to assign teacher', 'Error');
        }
      },
      error: (error) => {
        console.error('Error assigning teacher to class:', error);
        this.toastService.error(error.message || 'Failed to assign teacher', 'Error');
      }
    });
  }

  selectTeacher(teacherId: string): void {
    if (!this.selectedClassId) return;
    this.assignTeacherToClass(teacherId, this.selectedClassId);
  }

  unassignTeacher(teacherId: string, classId: string): void {
    this.showConfirmation(
      'Unassign Teacher',
      'Are you sure you want to unassign this teacher from the class?',
      'warning',
      () => {
        this.adminManagementService.unassignTeacherFromClass(teacherId, classId).subscribe({
          next: (result: any) => {
            this.toastService.success('Teacher unassigned successfully!', 'Success');
            this.loadClassTeachers(classId);
            this.loadAllClasses();
          },
          error: (error: any) => {
            console.error('Error unassigning teacher:', error);
            this.toastService.error(error.message || 'Failed to unassign teacher', 'Error');
          }
        });
      }
    );
  }

  isTeacherAssigned(teacher: Teacher): boolean {
    return teacher.classNames?.some(className =>
      className.toLowerCase().includes(this.selectedClassId!.toLowerCase())
    ) || false;
  }

  // ========== BULK OPERATIONS METHODS ==========

  openBulkAssignModal(): void {
    this.currentBulkOperation = 'assignTeachers';
    this.bulkOperationTitle = 'Bulk Assign Teachers';
    this.selectedClasses = [];
    this.selectedTeacherIds = [];
    
    this.loadAllTeachersForBulk();
    
    const modal = new bootstrap.Modal(document.getElementById('bulkOperationsModal'));
    modal.show();
  }

  openBulkMoveModal(): void {
    this.currentBulkOperation = 'moveClasses';
    this.bulkOperationTitle = 'Bulk Move Classes';
    this.selectedClasses = [];
    this.bulkMoveGradeId = '';
    const modal = new bootstrap.Modal(document.getElementById('bulkOperationsModal'));
    modal.show();
  }

  private loadAllTeachersForBulk(): void {
    this.teacherService.GetAllTeachers().subscribe({
      next: (teachers: Teacher[]) => {
        this.bulkTeachers = teachers;
      },
      error: (err: any) => {
        console.error('Error loading teachers for bulk assignment:', err);
        this.toastService.error('Failed to load teachers', 'Error');
        this.bulkTeachers = [];
      }
    });
  }

  toggleTeacherSelection(teacherId: string): void {
    const index = this.selectedTeacherIds.indexOf(teacherId);
    if (index > -1) {
      this.selectedTeacherIds.splice(index, 1);
    } else {
      this.selectedTeacherIds.push(teacherId);
    }
  }

  isTeacherSelected(teacherId: string): boolean {
    return this.selectedTeacherIds.includes(teacherId);
  }

  selectAllTeachers(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked && this.bulkTeachers.length > 0) {
      this.selectedTeacherIds = this.bulkTeachers.map(teacher => teacher.id);
    } else {
      this.selectedTeacherIds = [];
    }
  }

  selectAllClasses(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedClasses = this.allClasses.map(c => c.id);
    } else {
      this.selectedClasses = [];
    }
  }

  toggleClassSelection(classId: string): void {
    const index = this.selectedClasses.indexOf(classId);
    if (index > -1) {
      this.selectedClasses.splice(index, 1);
    } else {
      this.selectedClasses.push(classId);
    }
  }

  isClassSelected(classId: string): boolean {
    return this.selectedClasses.includes(classId);
  }

  executeBulkOperation(): void {
    if (this.selectedClasses.length === 0) {
      this.toastService.warning('Please select at least one class', 'Warning');
      return;
    }

    switch (this.currentBulkOperation) {
      case 'moveClasses':
        this.executeBulkMove();
        break;
      case 'assignTeachers':
        this.executeBulkAssign();
        break;
    }
  }

  private executeBulkMove(): void {
    if (!this.bulkMoveGradeId) {
      this.toastService.warning('Please select a target grade', 'Warning');
      return;
    }

    this.showConfirmation(
      'Bulk Move Classes',
      `Are you sure you want to move ${this.selectedClasses.length} classes to the selected grade?`,
      'warning',
      () => {
        const dto: BulkMoveClassesDto = {
          classIds: this.selectedClasses,
          newGradeId: this.bulkMoveGradeId
        };

        this.gradeService.bulkMoveClasses(dto).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.toastService.success(`Successfully moved ${this.selectedClasses.length} classes to new grade!`, 'Success');
              this.loadAllClasses();
              this.closeModal('bulkOperationsModal');
              this.selectedClasses = [];
              this.bulkMoveGradeId = '';
            } else {
              this.toastService.error('Failed to move classes', 'Error');
            }
          },
          error: (error: any) => {
            console.error('Error moving classes:', error);
            this.toastService.error('Failed to move classes: ' + error.message, 'Error');
          }
        });
      }
    );
  }

  private executeBulkAssign(): void {
    if (this.selectedTeacherIds.length === 0) {
      this.toastService.warning('Please select at least one teacher', 'Warning');
      return;
    }

    this.showConfirmation(
      'Bulk Assign Teachers',
      `Are you sure you want to assign ${this.selectedTeacherIds.length} teachers to ${this.selectedClasses.length} classes?`,
      'warning',
      () => {
        const dto: BulkAssignTeachersDto = {
          classIds: this.selectedClasses,
          teacherIds: this.selectedTeacherIds
        };

        this.adminManagementService.bulkAssignTeachers(dto).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.toastService.success(`Successfully assigned ${this.selectedTeacherIds.length} teachers to ${this.selectedClasses.length} classes!`, 'Success');
              this.loadAllClasses();
              this.closeModal('bulkOperationsModal');
              this.selectedClasses = [];
              this.selectedTeacherIds = [];
            } else {
              this.toastService.error('Failed to assign teachers', 'Error');
            }
          },
          error: (error: any) => {
            console.error('Error assigning teachers:', error);
            this.toastService.error('Failed to assign teachers: ' + error.message, 'Error');
          }
        });
      }
    );
  }

  exportAllClasses(): void {
    this.showConfirmation(
      'Export All Classes',
      'Are you sure you want to export all classes data to Excel?',
      'info',
      () => {
        this.classService.exportAllClasses().subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all_classes_data_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            this.toastService.success('All classes data exported successfully!', 'Success');
          },
          error: (error: any) => {
            console.error('Error exporting all classes data:', error);
            this.toastService.error('Failed to export data: ' + error.message, 'Error');
          }
        });
      }
    );
  }

  // ========== UTILITY METHODS ==========

  getClassName(classId: string): string {
    const classObj = this.allClasses.find(c => c.id === classId);
    return classObj ? classObj.className : 'Unknown Class';
  }

  getGradeName(gradeId: string): string {
    const grade = this.allGrades.find(g => g.id === gradeId);
    return grade ? grade.gradeName : 'N/A';
  }

  getCurriculumName(curriculumId: string): string {
    const curriculum = this.allCurricula.find(c => c.id === curriculumId);
    return curriculum ? curriculum.name : 'N/A';
  }

  getStatusBadgeClass(cls: ClassViewDto): string {
    if (cls.studentCount === 0) return 'bg-secondary';
    if ((cls.teacherCount || 0) === 0) return 'bg-warning';
    return 'bg-success';
  }

  getStatusText(cls: ClassViewDto): string {
    if (cls.studentCount === 0) return 'Empty';
    if ((cls.teacherCount || 0) === 0) return 'No Teachers';
    return 'Active';
  }

  getTeacherStatusClass(teacher: any): string {
    switch (teacher.profileStatus?.toLowerCase()) {
      case 'approved': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const myModal = bootstrap.Modal.getInstance(modal);
      myModal?.hide();
    }
  }

  // ========== CONFIRMATION MODAL METHODS ==========

  showConfirmation(
    title: string,
    message: string,
    type: 'danger' | 'warning' | 'info' = 'info',
    action: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): void {
    this.confirmationTitle = title;
    this.confirmationMessage = message;
    this.confirmationType = type;
    this.confirmationAction = action;
    this.confirmButtonText = confirmText;
    this.cancelButtonText = cancelText;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
  }

  executeConfirmation(): void {
    this.confirmationAction();
    this.closeModal('confirmationModal');
  }

  // ========== PAGINATION METHODS ==========

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredClasses.length / this.pageSize);
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // ========== CLASS OPERATIONS METHODS ==========

  createClass(): void {
    if (!this.newClass.className || !this.newClass.gradeId) {
      this.toastService.warning('Please fill all required fields', 'Warning');
      return;
    }

    ApiResponseHandler.handleApiResponse<ClassDto>(
      this.classService.create(this.newClass)
    ).subscribe({
      next: (created) => {
        this.closeModal('createClassModal');
        this.newClass = { className: '', gradeId: '' };
        this.loadAllClasses();
        this.toastService.success('Class created successfully!', 'Success');
      },
      error: (error) => {
        console.error('Error creating class:', error);
        this.toastService.error(error.message || 'Failed to create class', 'Error');
      }
    });
  }

  // ========== EDIT CLASS METHOD ==========
  
  openEditClassModal(classId: string): void {
    const classToEdit = this.allClasses.find(c => c.id === classId);
    if (classToEdit) {
      // Close the details modal first
      this.closeModal('classDetailsModal');
      
      // Set up the edit form data
      this.editClassData = {
        id: classToEdit.id,
        className: classToEdit.className,
        gradeId: classToEdit.gradeId
      };
      
      // Show the edit modal
      const modal = new bootstrap.Modal(document.getElementById('editClassModal'));
      modal.show();
    }
  }

  updateClass(): void {
    if (!this.editClassData.id || !this.editClassData.className || !this.editClassData.gradeId) {
      this.toastService.warning('Please fill all required fields', 'Warning');
      return;
    }

    const updateData: UpdateClassDto = {
      id: this.editClassData.id,
      className: this.editClassData.className,
      gradeId: this.editClassData.gradeId
    };

    ApiResponseHandler.handleApiResponse<ClassDto>(
      this.classService.update(this.editClassData.id, updateData)
    ).subscribe({
      next: (updated) => {
        this.closeModal('editClassModal');
        this.editClassData = { id: '', className: '', gradeId: '' };
        this.loadAllClasses();
        this.toastService.success('Class updated successfully!', 'Success');
      },
      error: (error) => {
        console.error('Error updating class:', error);
        this.toastService.error(error.message || 'Failed to update class', 'Error');
      }
    });
  }

  moveClassToGrade(classId: string, className: string): void {
    const newGradeId = prompt(`Enter new Grade ID for class "${className}":`);
    if (newGradeId) {
      this.gradeService.moveClass(classId, newGradeId).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Class moved to new grade successfully!', 'Success');
            this.loadAllClasses();
          } else {
            this.toastService.error('Failed to move class', 'Error');
          }
        },
        error: (error) => {
          console.error('Error moving class:', error);
          this.toastService.error('Failed to move class: ' + error.message, 'Error');
        }
      });
    }
  }

  exportClassData(classId: string, className: string): void {
    this.showConfirmation(
      'Export Class Data',
      `Are you sure you want to export data for class "${className}"?`,
      'info',
      () => {
        this.classService.exportClassData(classId).subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `class_${className}_data_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            this.toastService.success('Class data exported successfully!', 'Success');
          },
          error: (error: any) => {
            console.error('Error exporting class data:', error);
            this.toastService.error('Failed to export data: ' + error.message, 'Error');
          }
        });
      }
    );
  }

  deleteClass(classId: string, className: string): void {
    this.showConfirmation(
      'Delete Class',
      `Are you sure you want to delete class "${className}"? This action cannot be undone.`,
      'danger',
      () => {
        ApiResponseHandler.handleApiResponse<boolean>(
          this.classService.delete(classId)
        ).subscribe({
          next: (result) => {
            this.toastService.success('Class deleted successfully!', 'Success');
            this.loadAllClasses();
          },
          error: (error) => {
            console.error('Error deleting class:', error);
            this.toastService.error(error.message || 'Failed to delete class', 'Error');
          }
        });
      },
      'Delete',
      'Cancel'
    );
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredClasses.length);
    return `${start}-${end}`;
  }

  getStudentStatusClass(student: any): string {
    switch (student.profileStatus?.toLowerCase()) {
      case 'approved': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  moveStudentToAnotherClass(studentId: string, currentClassId: string): void {
    const newClassId = prompt('Enter the new class ID for this student (leave empty to unassign):');
    
    if (newClassId !== null) {
      const classIdToSend = newClassId === '' ? null : newClassId;
      const adminUserId = this.getCurrentAdminUserId();
      
      this.showConfirmation(
        classIdToSend === null ? 'Remove Student' : 'Move Student',
        classIdToSend === null 
          ? 'Are you sure you want to remove this student from the class?' 
          : 'Are you sure you want to move this student to the new class?',
        'warning',
        () => {
          this.adminManagementService.moveStudentToAnotherClass(studentId, classIdToSend, adminUserId).subscribe({
            next: (result: any) => {
              if (classIdToSend === null) {
                this.toastService.success('Student removed from class successfully!', 'Success');
              } else {
                this.toastService.success('Student moved to new class successfully!', 'Success');
              }
              this.loadClassStudents(currentClassId);
              this.loadAllClasses();
            },
            error: (error: any) => {
              console.error('Error moving student:', error);
              this.toastService.error(error.message || 'Failed to move student', 'Error');
            }
          });
        }
      );
    }
  }

  removeStudentFromClass(studentId: string, classId: string): void {
    this.showConfirmation(
      'Remove Student',
      'Are you sure you want to remove this student from the class?',
      'danger',
      () => {
        const adminUserId = this.getCurrentAdminUserId();
        
        this.adminManagementService.moveStudentToAnotherClass(studentId, null, adminUserId).subscribe({
          next: (result: any) => {
            this.toastService.success('Student removed from class successfully!', 'Success');
            this.loadClassStudents(classId);
            this.loadAllClasses();
          },
          error: (error: any) => {
            console.error('Error removing student:', error);
            this.toastService.error(error.message || 'Failed to remove student', 'Error');
          }
        });
      },
      'Remove',
      'Cancel'
    );
  }

  private getCurrentAdminUserId(): string {
    // Implement based on your auth system
    return 'admin-user-id-placeholder';
  }

  getGradeCurriculumName(gradeId: string): string {
    const grade = this.allGrades.find(g => g.id === gradeId);
    if (grade) {
      return grade.curriculumName || this.getCurriculumName(grade.curriculumId);
    }
    return 'Unknown Curriculum';
  }

  getClassCurriculumName(cls: ClassViewDto): string {
    if (!cls) return '';
    const grade = this.allGrades.find(g => g.id === cls.gradeId);
    if (grade) {
      return grade.curriculumName || this.getCurriculumName(grade.curriculumId);
    }
    return '';
  }

  hasClassCurriculum(cls: ClassViewDto): boolean {
    if (!cls) return false;
    return !!this.getClassCurriculumName(cls);
  }
}