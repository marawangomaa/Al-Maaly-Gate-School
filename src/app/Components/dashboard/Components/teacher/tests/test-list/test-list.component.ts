import { Component, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ExamService } from '../../../../../../Services/exam.service';
import { ExamViewDto, ExamDetailsViewDto } from '../../../../../../Interfaces/iexam';
import { PLATFORM_ID } from '@angular/core';
import { QuestionTypes } from "../../../../../../Interfaces/QuestionTypes";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.css'
})
export class TestListComponent {
  QuestionTypes = QuestionTypes;
  exams$!: Observable<ExamViewDto[]>;
  selectedExamDetails: ExamDetailsViewDto | null = null;
  isBrowser = false;

  constructor(
    private examService: ExamService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.loadExams();
    }
  }

  private loadExams() {
    const teacherId = this.examService.getTeacherId();

    if (!teacherId) {
      console.error('❌ teacherId not found in localStorage.');
      this.exams$ = of([]); // prevent template errors
      return;
    }

    console.log('✅ Loading exams for teacherId:', teacherId);

    this.exams$ = new Observable<ExamViewDto[]>(subscriber => {
      this.examService.getByTeacher().subscribe({
        next: (res: any) => {
          console.log('📄 Exams raw response:', res);

          // unwrap the "data" array
          if (res && res.success && res.data) {
            subscriber.next(res.data);
          } else {
            subscriber.next([]);
          }

          subscriber.complete();
        },
        error: (err) => {
          console.error('❌ Error loading exams:', err);
          subscriber.next([]);
          subscriber.complete();
        }
      });
    });
  }

  // Delete exam
  delete(id: string) {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    this.examService.delete(id).subscribe({
      next: () => {
        console.log('✅ Deleted exam with id:', id);
        this.loadExams();
      },
      error: (err) => console.error('❌ Error deleting exam:', err)
    });
  }

  // Show exam details in modal
  showDetails(id: string) {
    console.log('👀 Fetching details for exam id:', id);
    this.examService.getById(id).subscribe({
      next: (res: any) => {
        console.log('📄 Exam details raw response:', res);

        // unwrap data if API wraps it
        if (res && res.success && res.data) {
          this.selectedExamDetails = res.data;
        } else {
          this.selectedExamDetails = res; // fallback
        }
      },
      error: (err) => console.error('❌ Error fetching exam details:', err)
    });
  }

  // Close modal
  closeDetails() {
    this.selectedExamDetails = null;
  }

}
