import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';
import { QuestionService } from '../../../../../../Services/question.service';
import { ExamService } from '../../../../../../Services/exam.service';
import { ClassService } from '../../../../../../Services/class.service';
import { SubjectService } from '../../../../../../Services/subject.service';
import { CreateExamWithQuestionsDto } from '../../../../../../Interfaces/iexam';
import { QuestionModel, QuestionTypes } from '../../../../../../Interfaces/iquestoin';

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
  startTime = '';  // HH:mm

  startHour: number | null = null;
  startMinute: number | null = null;
  startPeriod: "AM" | "PM" = "AM";


  duration = 1; // hours

  maxDegree = 100;
  minDegree = 50;

  classes: any[] = [];
  subjects: any[] = [];

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
    private subjectService: SubjectService
  ) { }

  ngOnInit() {
    this.questionService.loadAll();

    this.questions$ = this.questionService.questions$.pipe(
      map((questions: QuestionModel[]) => ({
        mcq: questions.filter(q => q.type === QuestionTypes.Choices),
        truefalse: questions.filter(q => q.type === QuestionTypes.TrueOrFalse),
        connection: questions.filter(q => q.type === QuestionTypes.Connection),
        complete: questions.filter(q => q.type === QuestionTypes.Connection),
      }))
    );

    this.classService.getAll().subscribe(res => this.classes = res.data);
    this.subjectService.getAll().subscribe(res => this.subjects = res.data);
  }

  isSelected(id: string): boolean {
    return this.selectedQuestions.includes(id);
  }

  toggleQuestion(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedQuestions.push(id);
    else this.selectedQuestions = this.selectedQuestions.filter(q => q !== id);
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

    // ✅ Convert 12-hour time → 24-hour time
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
    this.startTime = '';
    this.duration = 1;
    this.maxDegree = 100;
    this.minDegree = 50;
    this.selectedQuestions = [];
  }
}
