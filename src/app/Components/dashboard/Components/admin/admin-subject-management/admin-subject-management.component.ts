import { Component } from '@angular/core';
import { SubjectService } from '../../../../../Services/subject.service';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { SubjectCreateDto, SubjectViewDto } from '../../../../../Interfaces/isubject';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeService } from '../../../../../Services/grade.service';
import { GradeViewDto } from '../../../../../Interfaces/igrade';



@Component({
  selector: 'app-admin-subject-management',
  standalone: true,
  imports: [NgIf,NgFor,FormsModule],
  templateUrl: './admin-subject-management.component.html',
  styleUrl: './admin-subject-management.component.css'
})
export class AdminSubjectManagementComponent {
  searchTerm: string = '';
  filteredSubjects: SubjectViewDto[] = [];
  subjects: SubjectViewDto[] = [];
  grades:GradeViewDto[] = [];
  subscription: Subscription = new Subscription();
  //Form state
  subjectName: string = '';
  gradeId: string = '';
  creditHours: number = 0;
  //modal state
  isCreateSubjectModalOpen: boolean = false;
  constructor(private _subjectService:SubjectService,private _gradeService:GradeService) { }

  public openModalCreateSubject(): void
  {
      console.log("Open Create Subject Modal");
      this.isCreateSubjectModalOpen = true;
  }

  public closeModalCreateSubject(): void
  {
      this.isCreateSubjectModalOpen = false;
  }

  public onCreateSubjectClick(): void
  {
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
    s.gradeName.toLowerCase().includes(term)
  );
}
  ngOnInit(): void 
  {
      this.LoadAllSubjects();
      this.loadAllGrades();
  }

  ngOnDestroy(): void
  {
      this.subscription.unsubscribe();
  }
  

  private LoadAllSubjects(): void
  {
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
  private CreateSubjectService(name:string,gradeId:string,creditHours:number): void
  {
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
  private loadAllGrades(): void
  {
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

}
