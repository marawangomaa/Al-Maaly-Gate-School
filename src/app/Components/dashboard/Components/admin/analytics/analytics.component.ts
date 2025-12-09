import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';

@Component({
  selector: 'app-analytics',
  imports: [],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit,OnDestroy {

  private subscription = new Subscription();

    teacherCount = 0;
    studentCount = 0;
  constructor(private adminService: AdminManagementService){}

  ngOnInit(): void
  {
    this.LoadTeacherCount();
    this.LoadStudentCount();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //Load total teacher count
  private LoadTeacherCount(): void {
    this.subscription.add(
      this.adminService.CountTeachers().subscribe({
        next: count => (this.teacherCount = count),
        error: err => alert(`Error loading teacher count: ${err.message}`)
      })
    );
  }
  private LoadStudentCount(): void 
  {
    this.subscription.add(
      this.adminService.CountStudent().subscribe({
        next: count => (this.studentCount = count),
        error: err => alert(`Error loading student count: ${err.message}`)
      })
    );
  }
}
