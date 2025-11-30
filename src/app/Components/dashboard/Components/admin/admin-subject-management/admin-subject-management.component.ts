import { Component } from '@angular/core';
import { SubjectService } from '../../../../../Services/subject.service';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { SubjectViewDto } from '../../../../../Interfaces/isubject';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-admin-subject-management',
  imports: [NgIf,NgFor],
  templateUrl: './admin-subject-management.component.html',
  styleUrl: './admin-subject-management.component.css'
})
export class AdminSubjectManagementComponent {
  subjects: SubjectViewDto[] = [];
  subscription: Subscription = new Subscription();
  constructor(private _subjectService:SubjectService) { }

  ngOnInit(): void 
  {
      this.LoadAllSubjects();
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
        },
        error: (error) => {
          console.error('Error loading subjects:', error.message);
        }
      });
  }

}
