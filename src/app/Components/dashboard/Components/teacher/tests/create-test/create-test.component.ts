import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';
import { QuestionService } from '../../../../../../Services/question.service';
import { ExamService } from '../../../../../../Services/exam.service';
import { ClassService } from '../../../../../../Services/class.service';
import { TeacherService } from '../../../../../../Services/teacher.service';
import { CreateExamWithQuestionsDto } from '../../../../../../Interfaces/iexam';
import { QuestionModel } from '../../../../../../Interfaces/iquestoin';
import { SubjectViewDto } from '../../../../../../Interfaces/isubject';
import { ClassViewDto } from '../../../../../../Interfaces/iclass';
import { QuestionTypes } from "../../../../../../Interfaces/QuestionTypes";

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css'],
})
export class CreateTestComponent implements OnInit {
  QuestionTypes = QuestionTypes;

  testTitle = '';
  classId = '';
  subjectId = '';

  startDate = '';  // yyyy-mm-dd
  startHour: number | null = null;
  startMinute: number | null = null;
  startPeriod: "AM" | "PM" = "AM";

  totalQuestionsDegree = 0;
  calculatedMinDegree = 0;
  calculatedMaxDegree = 0;

  duration = 1; // hours

  maxDegree = 100;
  minDegree = 50;

  classes: ClassViewDto[] = [];
  teacherSubjects: SubjectViewDto[] = [];
  loading = false;
  teacherId: string | null = null;

  selectedQuestions: string[] = [];

  questions$!: Observable<{
    mcq: QuestionModel[];
    truefalse: QuestionModel[];
    complete: QuestionModel[];
    connection: QuestionModel[];
  }>;

  constructor(
    private questionService: QuestionService,
    private examService: ExamService,
    private classService: ClassService,
    private teacherService: TeacherService
  ) { }

  ngOnInit() {
    this.getTeacherIdFromLocalStorage();
    
    if (this.teacherId) {
      this.loadTeacherData();
    } else {
      console.warn('Teacher ID not found, loading all data');
      this.loadAllData();
    }
  }

  getTeacherIdFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.teacherId = localStorage.getItem('teacherId');
      console.log('Teacher ID from localStorage:', this.teacherId);
    }
  }

  loadTeacherData(): void {
    this.loading = true;
    
    // Load teacher's classes
    this.teacherService.getTeacherClasses(this.teacherId!).subscribe({
      next: (res) => {
        if (res.success) {
          this.classes = res.data || [];
          console.log('Teacher classes loaded:', this.classes);
        } else {
          console.error('Failed to load teacher classes:', res.message);
          this.loadAllClasses();
        }
      },
      error: (err) => {
        console.error('Error loading teacher classes:', err);
        this.loadAllClasses();
      }
    });

    // Load teacher's subjects
    this.teacherService.getTeacherSubjects(this.teacherId!).subscribe({
      next: (res) => {
        if (res.success) {
          this.teacherSubjects = res.data || [];
          console.log('Teacher subjects loaded:', this.teacherSubjects);
          
          // Load all questions (don't filter by subject for now)
          this.loadAllQuestions();
        } else {
          console.error('Failed to load teacher subjects:', res.message);
          this.loadAllQuestions();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading teacher subjects:', err);
        this.loadAllQuestions();
        this.loading = false;
      }
    });
  }

  loadAllData(): void {
    this.loading = true;
    this.loadAllQuestions();
    this.loadAllClasses();
    this.loading = false;
  }

  loadAllQuestions(): void {
    this.questionService.loadAll();
    
    this.questions$ = this.questionService.questions$.pipe(
      map((questions: QuestionModel[]) => ({
        mcq: questions.filter(q => q.type === QuestionTypes.Choices),
        truefalse: questions.filter(q => q.type === QuestionTypes.TrueOrFalse),
        connection: questions.filter(q => q.type === QuestionTypes.Connection),
        complete: questions.filter(q => q.type === QuestionTypes.Complete),
      }))
    );
  }

  loadAllClasses(): void {
    this.classService.getAll().subscribe(res => {
      this.classes = res.data || [];
    });
  }

  // Remove the loadAllSubjects() method since you're not using it anymore

  calculateDegrees(): void {
    this.questionService.questions$.subscribe(questions => {
      this.totalQuestionsDegree = questions
        .filter(q => this.selectedQuestions.includes(q.id))
        .reduce((sum, q) => sum + (q.degree || 0), 0);

      this.calculatedMinDegree = Math.round(this.totalQuestionsDegree * 0.5);
      this.calculatedMaxDegree = this.totalQuestionsDegree;

      this.minDegree = this.calculatedMinDegree;
      this.maxDegree = this.calculatedMaxDegree;
    });
  }

  updateDegrees(): void {
    if (this.selectedQuestions.length > 0) {
      this.calculateDegrees();
    }
  }

  isSelected(id: string): boolean {
    return this.selectedQuestions.includes(id);
  }

  toggleQuestion(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedQuestions.push(id);
    else this.selectedQuestions = this.selectedQuestions.filter(q => q !== id);

    this.updateDegrees();
  }

  createTest() {
    const teacherId = this.examService.getTeacherId();

    if (!teacherId) {
      alert('Teacher ID not found.');
      return;
    }

    if (!this.startDate || !this.startHour || this.startMinute === null) {
      alert("Please enter start date and time.");
      return;
    }

    let hour = this.startHour;

    if (this.startPeriod === "PM" && hour < 12) hour += 12;
    if (this.startPeriod === "AM" && hour === 12) hour = 0;

    const hh = hour.toString().padStart(2, '0');
    const mm = this.startMinute.toString().padStart(2, '0');

    const start = new Date(`${this.startDate}T${hh}:${mm}:00`);

    if (isNaN(start.getTime())) {
      alert("Invalid start datetime!");
      return;
    }

    const end = new Date(start.getTime() + this.duration * 60 * 60 * 1000);

    const dto: CreateExamWithQuestionsDto = {
      examName: this.testTitle,
      classId: this.classId,
      subjectId: this.subjectId,
      teacherId: teacherId,
      start: start.toISOString(),
      end: end.toISOString(),
      fullMark: this.maxDegree,
      minMark: this.minDegree,
      questionIds: [...this.selectedQuestions],
      status: "Active"
    };

    console.log("SENDING DTO:", dto);

    this.examService.createWithQuestions(dto).subscribe({
      next: () => {
        alert('Test created successfully!');
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create test.');
      }
    });
  }

  resetForm() {
    this.testTitle = '';
    this.classId = '';
    this.subjectId = '';
    this.startDate = '';
    this.startHour = null;
    this.startMinute = null;
    this.startPeriod = "AM";
    this.duration = 1;
    this.maxDegree = 100;
    this.minDegree = 50;
    this.selectedQuestions = [];
  }
}