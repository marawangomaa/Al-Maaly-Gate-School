import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../../../Services/class.service';
import { GradeService } from '../../../../../Services/grade.service';
import { CurriculumService } from '../../../../../Services/curriculum.service'; // Added
import { BulkMoveClassesDto, ClassDto, ClassViewDto, CreateClassDto } from '../../../../../Interfaces/iclass';
import { GradeViewDto } from '../../../../../Interfaces/igrade';
import { Curriculum } from '../../../../../Interfaces/icurriculum'; // Added
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { TeacherService } from '../../../../../Services/teacher.service';
import { Teacher } from '../../../../../Interfaces/teacher';
import { TranslateModule } from '@ngx-translate/core';
import { BulkAssignTeachersDto } from '../../../../../Interfaces/iteacher';
import { SubjectService } from '../../../../../Services/subject.service';

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
  allTeachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  allGrades: GradeViewDto[] = [];
  allCurricula: Curriculum[] = []; // Added
  
  // Selection and state management
  selectedClassId: string | null = null;
  selectedClass: ClassViewDto | null = null;
  selectedClasses: string[] = []; // For bulk operations
  classStudents: any[] = [];

  // Modal data
  classTeachers: any[] = [];
  classSubjects: any[] = [];
  classStats: any = null;

  // UI state
  successMessage: string | null = null;
  isLoadingDetails = false;
  loading = false;

  // Filtering and search
  selectedGradeFilter: string = '';
  selectedCurriculumFilter: string = ''; // Added
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

  constructor(
    private classService: ClassService,
    private gradeService: GradeService,
    private curriculumService: CurriculumService, // Added
    private adminManagementService: AdminManagementService,
    private teacherService: TeacherService,
    private SubjectService: SubjectService
  ) { }

  ngOnInit(): void {
    this.loadAllClasses();
    this.loadAllGrades();
    this.loadAllCurricula(); // Added
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
        // Enhance classes with curriculum information
        this.enhanceClassesWithCurriculumInfo();
        this.filterClasses();
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
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
        this.availableSubjects = [];
      }
    });
  }

  private enhanceClassesWithCurriculumInfo(): void {
    this.allClasses.forEach(cls => {
      const grade = this.allGrades.find(g => g.id === cls.gradeId);
      if (grade) {
        // Add curriculumId to class for filtering
        (cls as any).curriculumId = grade.curriculumId;
        // Add curriculumName to class for display
        (cls as any).curriculumName = grade.curriculumName || this.getCurriculumName(grade.curriculumId);
      }
    });
  }

  // ========== FILTERING AND SEARCH METHODS ==========

  filterClasses(): void {
    let filtered = this.allClasses;

    // Filter by grade
    if (this.selectedGradeFilter) {
      filtered = filtered.filter(c => c.gradeId === this.selectedGradeFilter);
    }

    // Filter by curriculum (NEW)
    if (this.selectedCurriculumFilter) {
      // Get grades that belong to the selected curriculum
      const curriculumGrades = this.allGrades.filter(g => g.curriculumId === this.selectedCurriculumFilter);
      const curriculumGradeIds = curriculumGrades.map(g => g.id);
      filtered = filtered.filter(c => curriculumGradeIds.includes(c.gradeId));
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.className.toLowerCase().includes(term) ||
        (c.gradeName && c.gradeName.toLowerCase().includes(term)) ||
        ((c as any).curriculumName && (c as any).curriculumName.toLowerCase().includes(term))
      );
    }

    // Sort the results
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
        case 'curriculumName': // NEW
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

    // Filter by search term
    if (this.teacherSearchTerm) {
      const term = this.teacherSearchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.fullName.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
      );
    }

    // Filter by subject
    if (this.teacherSubjectFilter) {
      filtered = filtered.filter(t =>
        t.subjects && t.subjects.includes(this.teacherSubjectFilter)
      );
    }

    this.filteredTeachers = filtered;
  }

  onCurriculumFilterChange(): void {
    // When curriculum filter changes, update grade filter options
    if (this.selectedCurriculumFilter) {
      const curriculumGrades = this.allGrades.filter(g => g.curriculumId === this.selectedCurriculumFilter);
      // If selected grade doesn't belong to selected curriculum, clear it
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
      
      // Load related data
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

    this.subscription.add(
      this.teacherService.GetAllTeachers().subscribe({
        next: teachers => {
          this.allTeachers = teachers.filter(teacher => {
            const isAssigned = teacher.classNames?.some(className =>
              className.toLowerCase().includes(this.selectedClassId!.toLowerCase())
            );
            return !isAssigned;
          });
          this.filteredTeachers = [...this.allTeachers];
        },
        error: err => {
          console.error('Error loading teachers:', err);
          this.allTeachers = [];
          this.filteredTeachers = [];
        }
      })
    );
  }

  openAssignTeacherModal(classId: string): void {
    this.selectedClassId = classId;
    this.loadAllTeachers();
  }

  assignTeacherToClass(teacherId: string, classId: string): void {
    this.adminManagementService.AssignTeacherToClass(teacherId, classId).subscribe({
      next: (result) => {
        this.showSuccess("Teacher assigned successfully!");
        this.loadAllClasses();
        this.closeModal('assignTeacherModal');
      },
      error: (error) => {
        console.error('Error assigning teacher to class:', error);
        alert(error.message || 'Failed to assign teacher');
      }
    });
  }

  selectTeacher(teacherId: string): void {
    if (!this.selectedClassId) return;
    this.assignTeacherToClass(teacherId, this.selectedClassId);
  }

  unassignTeacher(teacherId: string, classId: string): void {
    if (confirm('Are you sure you want to unassign this teacher?')) {
      this.adminManagementService.unassignTeacherFromClass(teacherId, classId).subscribe({
        next: (result: any) => {
          this.showSuccess("Teacher unassigned successfully!");
          this.loadClassTeachers(classId);
          this.loadAllClasses();
        },
        error: (error: any) => {
          console.error('Error unassigning teacher:', error);
          alert(error.message || 'Failed to unassign teacher');
        }
      });
    }
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
      alert('Please select at least one class');
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
      alert('Please select a target grade');
      return;
    }

    const dto: BulkMoveClassesDto = {
      classIds: this.selectedClasses,
      newGradeId: this.bulkMoveGradeId
    };

    this.gradeService.bulkMoveClasses(dto).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showSuccess(`Successfully moved ${this.selectedClasses.length} classes to new grade!`);
          this.loadAllClasses();
          this.closeModal('bulkOperationsModal');
          this.selectedClasses = [];
          this.bulkMoveGradeId = '';
        }
      },
      error: (error: any) => {
        alert('Error moving classes: ' + error.message);
      }
    });
  }

  private executeBulkAssign(): void {
    if (this.selectedTeacherIds.length === 0) {
      alert('Please select at least one teacher');
      return;
    }

    const dto: BulkAssignTeachersDto = {
      classIds: this.selectedClasses,
      teacherIds: this.selectedTeacherIds
    };

    this.adminManagementService.bulkAssignTeachers(dto).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showSuccess(`Successfully assigned ${this.selectedTeacherIds.length} teachers to ${this.selectedClasses.length} classes!`);
          this.loadAllClasses();
          this.closeModal('bulkOperationsModal');
          this.selectedClasses = [];
          this.selectedTeacherIds = [];
        }
      },
      error: (error: any) => {
        alert('Error assigning teachers: ' + error.message);
      }
    });
  }

  exportAllClasses(): void {
    this.classService.exportAllClasses().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_classes_data_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('All classes data exported successfully!');
      },
      error: (error: any) => {
        alert('Error exporting all classes data: ' + error.message);
      }
    });
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

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
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
      alert('Please fill all required fields');
      return;
    }

    ApiResponseHandler.handleApiResponse<ClassDto>(
      this.classService.create(this.newClass)
    ).subscribe({
      next: (created) => {
        this.closeModal('createClassModal');
        this.newClass = { className: '', gradeId: '' };
        this.loadAllClasses();
        this.showSuccess('Class created successfully!');
      },
      error: (error) => {
        console.error('Error creating class:', error);
        alert(error.message || 'Failed to create class');
      }
    });
  }

  editClass(classId: string): void {
    this.closeModal('classDetailsModal');
    console.log('Edit class:', classId);
    // Implement edit functionality
  }

  moveClassToGrade(classId: string, className: string): void {
    const newGradeId = prompt(`Enter new Grade ID for class "${className}":`);
    if (newGradeId) {
      this.gradeService.moveClass(classId, newGradeId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Class moved to new grade successfully!');
            this.loadAllClasses();
          }
        },
        error: (error) => {
          alert('Error moving class: ' + error.message);
        }
      });
    }
  }

  exportClassData(classId: string, className: string): void {
    this.classService.exportClassData(classId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `class_${className}_data_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('Class data exported successfully!');
      },
      error: (error: any) => {
        alert('Error exporting class data: ' + error.message);
      }
    });
  }

  deleteClass(classId: string, className: string): void {
    if (confirm(`Are you sure you want to delete class "${className}"?`)) {
      ApiResponseHandler.handleApiResponse<boolean>(
        this.classService.delete(classId)
      ).subscribe({
        next: (result) => {
          this.showSuccess('Class deleted successfully!');
          this.loadAllClasses();
        },
        error: (error) => {
          console.error('Error deleting class:', error);
          alert(error.message || 'Failed to delete class');
        }
      });
    }
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
    
    const classIdToSend = newClassId === '' ? null : newClassId;
    const adminUserId = this.getCurrentAdminUserId();
    
    if (classIdToSend !== undefined) {
      this.adminManagementService.moveStudentToAnotherClass(studentId, classIdToSend, adminUserId).subscribe({
        next: (result: any) => {
          if (classIdToSend === null) {
            this.showSuccess("Student removed from class successfully!");
          } else {
            this.showSuccess("Student moved to new class successfully!");
          }
          this.loadClassStudents(currentClassId);
          this.loadAllClasses();
        },
        error: (error: any) => {
          console.error('Error moving student:', error);
          alert(error.message || 'Failed to move student');
        }
      });
    }
  }

  removeStudentFromClass(studentId: string, classId: string): void {
    if (confirm('Are you sure you want to remove this student from the class?')) {
      const adminUserId = this.getCurrentAdminUserId();
      
      this.adminManagementService.moveStudentToAnotherClass(studentId, null, adminUserId).subscribe({
        next: (result: any) => {
          this.showSuccess("Student removed from class successfully!");
          this.loadClassStudents(classId);
          this.loadAllClasses();
        },
        error: (error: any) => {
          console.error('Error removing student:', error);
          alert(error.message || 'Failed to remove student');
        }
      });
    }
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


// Add these methods to your AdminAllClassesComponent class
getClassCurriculumName(cls: ClassViewDto): string {
  if (!cls) return '';
  // Find the grade for this class
  const grade = this.allGrades.find(g => g.id === cls.gradeId);
  if (grade) {
    // Return curriculum name or look it up
    return grade.curriculumName || this.getCurriculumName(grade.curriculumId);
  }
  return '';
}

hasClassCurriculum(cls: ClassViewDto): boolean {
  if (!cls) return false;
  return !!this.getClassCurriculumName(cls);
}

}