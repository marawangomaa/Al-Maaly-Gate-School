import { Component } from '@angular/core';
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



@Component({
  selector: 'app-admin-subject-management',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './admin-subject-management.component.html',
  styleUrl: './admin-subject-management.component.css'
})
export class AdminSubjectManagementComponent {
  searchTerm: string = '';
  filteredSubjects: SubjectViewDto[] = [];
  subjects: SubjectViewDto[] = [];
  grades: GradeViewDto[] = [];
  subscription: Subscription = new Subscription();
  //Form state
  subjectName: string = '';
  gradeId: string = '';
  creditHours: number = 0;
  //modal state
  isCreateSubjectModalOpen: boolean = false;
  //teacher assignment modal state
  isTeachersModalOpen: boolean = false;
  selectedSubjectId: string = '';
  teachersNotAssignedToSubject: TeacherViewDto[] = [];
  teachersAssignedToSubject: TeacherViewDto[] = [];
  constructor(private _subjectService: SubjectService,
    private _gradeService: GradeService
    , private _teacherService: TeacherService
    , private adminManagementService: AdminManagementService) { }

  public openModalCreateSubject(): void {
    console.log("Open Create Subject Modal");
    this.isCreateSubjectModalOpen = true;
  }

  public closeModalCreateSubject(): void {
    this.isCreateSubjectModalOpen = false;
  }
  //teacher assignment modal controls
  public openTeachersModal(subjectId: string): void {
    this.selectedSubjectId = subjectId;
    this.isTeachersModalOpen = true;
    this.loadTeachersNotAssignedToSubject(subjectId);
    this.loadTeachersAssignedToSubject(subjectId);
  }

  public closeTeachersModal(): void {
    this.isTeachersModalOpen = false;
    this.teachersNotAssignedToSubject = [];
  }

  public onCreateSubjectClick(): void {
    this.CreateSubjectService(
      this.subjectName,
      this.gradeId,
      this.creditHours
    );
    this.LoadAllSubjects();
  }
  public onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredSubjects = this.subjects;
      return;
    }

    this.filteredSubjects = this.subjects.filter(s =>
      s.subjectName.toLowerCase().includes(term) ||
      s.gradeName.toLowerCase().includes(term)
    );

  }
  public loadTeachersNotAssigned(subjectId: string): void {
    this.loadTeachersNotAssignedToSubject(subjectId);
  }
  public clickAssignTeacherToSubject(teacherId: string, subjectId: string): void {
    this.assignTeacherToSubject(teacherId, subjectId);
  }
  public loadTeachersAssigned(subjectId: string): void {
    this.loadTeachersAssignedToSubject(subjectId);
  }
  public clickUnassignTeacherFromSubject(teacherId: string, subjectId: string): void {
    this.unassignTeacherFromSubject(teacherId, subjectId);
  }

  ngOnInit(): void {
    this.LoadAllSubjects();
    this.loadAllGrades();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  private LoadAllSubjects(): void {
    ApiResponseHandler.handleApiResponse(this._subjectService.getAll()).subscribe({
      next: (subjects) => {
        console.log(subjects);
        this.subjects = subjects;
        this.filteredSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error.message);
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
        console.log(subject);
        this.subjects.push(subject);
        // ✅ Reset form
        this.subjectName = '';
        this.gradeId = '';
        this.creditHours = 0;
        //Close modal
        this.closeModalCreateSubject();
      },
      error: (error) => {
        console.error('Error creating subject:', error.message);
      }
    });
  }

  //grade dropdown population
  private loadAllGrades(): void {
    ApiResponseHandler.handleApiResponse(this._gradeService.getAll()).subscribe({
      next: (grades) => {
        console.log(grades);
        this.grades = grades;
      },
      error: (error) => {
        console.error('Error loading grades:', error.message);
      }
    });
  }
  //Teacher menu population
  private loadTeachersNotAssignedToSubject(subjectId: string): void {
    ApiResponseHandler.handleApiResponse(this._teacherService.getTeachersNotAssignedToSubject(subjectId)).subscribe({
      next: (teachers) => {
        console.log(teachers);
        this.teachersNotAssignedToSubject = teachers ?? [];
      },
      error: (error) => {
        console.error('Error loading teachers not assigned to subject:', error.message);
        this.teachersNotAssignedToSubject = [];
      }
    });
  }

  private assignTeacherToSubject(teacherId: string, subjectId: string): void {
    this.adminManagementService.AssignTeacherToSubject(teacherId, subjectId).subscribe({
      next: (result) => {
        console.log(`Teacher ${teacherId} assigned to subject ${subjectId}:`, result);
        // Refresh the list of teachers not assigned to the subject
        this.loadTeachersNotAssignedToSubject(subjectId);
        this.loadTeachersAssignedToSubject(subjectId);
      },
      error: (error) => {
        console.error('Error assigning teacher to subject:', error.message);
      }
    });
  }
  //Teacher Menu to unassign
  private loadTeachersAssignedToSubject(subjectId: string): void {
    ApiResponseHandler.handleApiResponse(this._teacherService.getTeachersAssignedToSubject(subjectId)).subscribe({
      next: (teachers) => {
        console.log(teachers);
        this.teachersAssignedToSubject = teachers ?? [];
      },
      error: (error) => {
        console.error('Error loading teachers assigned to subject:', error.message);
        this.teachersAssignedToSubject = [];
      }
    });
  }
  private unassignTeacherFromSubject(teacherId: string, subjectId: string): void {
    this.adminManagementService.UnAssignTeacherFromSubject(teacherId, subjectId).subscribe({
      next: (result) => {
        console.log(`Teacher ${teacherId} unassigned from subject ${subjectId}:`, result);
        // Refresh the list of teachers assigned to the subject
        this.loadTeachersAssignedToSubject(subjectId);
        this.loadTeachersNotAssignedToSubject(subjectId);
      },
      error: (error) => {
        console.error('Error unassigning teacher from subject:', error.message);
      }
    });
  }
}
