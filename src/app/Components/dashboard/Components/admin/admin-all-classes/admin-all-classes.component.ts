import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../../../Services/class.service';
import { ClassDto, ClassViewDto } from '../../../../../Interfaces/iclass';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { TeacherService } from '../../../../../Services/teacher.service';
import { Teacher } from '../../../../../Interfaces/teacher';
declare var bootstrap: any;
@Component({
  selector: 'app-admin-all-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-all-classes.component.html',
  styleUrl: './admin-all-classes.component.css'
})
export class AdminAllClassesComponent {
  private subscription = new Subscription();
  allClasses: ClassViewDto[] = [];
  allTeachers: Teacher[] = [];
  selectedClassId: string | null = null;
  successMessage: string | null = null;

  newClass: ClassDto =
    {
      classYear: '',
      className: ''
    };


  constructor(private classService: ClassService,
    private adminManagementService: AdminManagementService,
    private teacherService: TeacherService) { }
  ngOnInit(): void {
    this.LoadAllClasses();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private LoadAllClasses(): void {
    ApiResponseHandler.handleApiResponse<ClassViewDto[]>(this.classService.getAll()).subscribe({
      next: (Classes) => {
        this.allClasses = Classes;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  createClass(): void {
    ApiResponseHandler.handleApiResponse<ClassDto>(
      this.classService.create(this.newClass)
    ).subscribe({
      next: (created) => {
        console.log('Class created:', created);

        // Close modal
        const modalEl = document.getElementById('createClassModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();

        // Reset form
        this.newClass = { classYear: '', className: '' };

        // Refresh list
        this.LoadAllClasses();
      },
      error: (error) => console.error('Error creating class:', error)
    });
  }

  LoadAllTeachers(): void {
    this.subscription.add(
      this.teacherService.GetAllTeachers().subscribe({
        next: teachers => {
          this.allTeachers = teachers.filter(t =>
            !t.classNames.includes(this.selectedClassId!)  // match class NAME
          );
        },
        error: err => alert(`Error loading teachers: ${err.message}`)
      })
    );
  }


  openAssignTeacherModal(className: string) {
    this.selectedClassId = className;
    this.LoadAllTeachers();
  }

  assignTeacherToClass(teacherId: string, classId: string): void {
    this.adminManagementService.AssignTeacherToClass(teacherId, classId).subscribe({
      next: (result) => {
        console.log('Teacher assigned to class:', result);
        this.showSuccess("Teacher assigned successfully!");
        this.LoadAllClasses();  // Refresh table
      },
      error: (error) => console.error('Error assigning teacher to class:', error)
    });
  }

  selectTeacher(teacherId: string) {
    if (!this.selectedClassId) return;

    this.assignTeacherToClass(teacherId, this.selectedClassId);
    const modal = document.getElementById('assignTeacherModal');
    if (modal) {
      const myModal = bootstrap.Modal.getInstance(modal);
      myModal?.hide();
    }

  }

  showSuccess(msg: string) {
    this.successMessage = msg;

    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }


}
