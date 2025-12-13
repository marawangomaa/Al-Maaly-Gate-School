import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassExamsService } from '../../Services/class-exams.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { iexamWithQuestions } from '../../Interfaces/iexamWithQuestions';
import { istudentExamAnswer } from '../../Interfaces/istudentExamAnswer';
import { istudentExamSubmission } from '../../Interfaces/istudentExamSubmission';
import { StudentService } from '../../Services/student.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-exam',
  imports: [CommonModule, TranslateModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent implements OnInit {
  studentId!: string;
  teacherId!: string;
  examId!: string;
  isSubmitting = false;
  exam?: iexamWithQuestions;
  studentAnswers: Record<string, any> = {};
  answers: Record<string, any> = {};
  questions: any[] = [];
  message = '';

  _StudentExamAnswer = inject(StudentService);
  _ClassExams = inject(ClassExamsService);
  _Auth = inject(AuthService);
  translate = inject(TranslateService);

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.studentId = this._Auth.getStudentId()!;
    this.route.paramMap.subscribe(params => {
      this.examId = params.get('id')!;
    });

    if (this.examId) {
      this.loadExam(this.examId);
    }
  }

  loadExam(examId: string) {
    this._ClassExams.GetExamById(examId).subscribe({
      next: res => {
        this.exam = res.data;
        this.teacherId = res.data.teacherId;
        this.questions = res.data.questions ?? [];

        // Initialize answers
        this.studentAnswers = {};
        this.exam.questions.forEach(q => {
          this.studentAnswers[q.id] = {
            choiceId: null,
            textAnswer: '',
            trueAndFalseAnswer: null
          };
        });

        this.questions.forEach((q: any) => {
          if (q.type === "Connection") {
            const { left, right } = this.prepareConnectionColumns(q);
            q.leftColumn = left;
            q.rightColumn = right;
          }
        });

      },
      error: err => {
        console.error('Failed to load exam:', err);
      }
    });
  }

  onSelectChoice(questionId: string, choiceId: string) {
    this.studentAnswers[questionId] = {
      ...this.studentAnswers[questionId],
      choiceId
    };
  }

  prepareConnectionColumns(question: any) {
    const correct = question.choices.filter((c: any) => c.isCorrect);
    const incorrect = question.choices.filter((c: any) => !c.isCorrect);

    if (correct.length < 2) {
      console.error("Connection question requires at least 2 correct items.");
    }

    const left = [correct[0]];
    const right = [correct[1]];

    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
    const rest = shuffle([...incorrect]);

    rest.forEach((item: any, index: number) => {
      index % 2 === 0 ? left.push(item) : right.push(item);
    });

    shuffle(left);
    shuffle(right);

    return { left, right };
  }

  onSelectConnectionLeft(questionId: string, leftId: string) {
    if (!this.studentAnswers[questionId]) {
      this.studentAnswers[questionId] = {};
    }
    this.studentAnswers[questionId].ConnectionLeftId = leftId;
  }

  onSelectConnectionRight(questionId: string, rightId: string) {
    if (!this.studentAnswers[questionId]) {
      this.studentAnswers[questionId] = {};
    }
    this.studentAnswers[questionId].ConnectionRightId = rightId;
  }

  onTrueFalseChange(questionId: string, value: boolean) {
    this.studentAnswers[questionId] = {
      ...this.studentAnswers[questionId],
      trueAndFalseAnswer: value
    };
  }

  onTextChange(event: Event, questionId: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!this.studentAnswers[questionId]) {
      this.studentAnswers[questionId] = {};
    }

    this.studentAnswers[questionId].CorrectTextAnswer = value;
  }

  allQuestionsAnswered(): boolean {
    if (!this.exam?.questions) return false;

    return this.exam.questions.every(q => {
      const ans = this.studentAnswers[q.id];
      if (!ans) return false;

      switch (q.type) {
        case "Choices":
          return !!ans.choiceId;

        case "TrueOrFalse":
          return ans.trueAndFalseAnswer !== null;

        case "Complete":
          return ans.CorrectTextAnswer?.trim().length > 0;

        case "Connection":
          return ans.ConnectionLeftId && ans.ConnectionRightId;

        default:
          return false;
      }
    });
  }

  submitExam() {
    if (!this.allQuestionsAnswered()) {
      this.message = this.translate.instant('EXAM.MESSAGES.SHOULD_ANSWER_ALL');
      return;
    }

    const answers: istudentExamAnswer[] = Object.entries(this.studentAnswers).map(
      ([questionId, answer]: [string, istudentExamAnswer]) => ({
        questionId,
        choiceId: answer.choiceId,
        CorrectTextAnswer: answer.CorrectTextAnswer?.trim(),
        ConnectionLeftId: answer.ConnectionLeftId,
        ConnectionRightId: answer.ConnectionRightId,
        trueAndFalseAnswer: answer.trueAndFalseAnswer
      })
    );

    const submission: istudentExamSubmission = {
      studentId: this.studentId,
      examId: this.examId,
      teacherId: this.teacherId,
      answers
    };

    this.isSubmitting = true;
    this.message = '';

    this._StudentExamAnswer.submitExam(submission).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.message = this.translate.instant('EXAM.MESSAGES.SUCCESS');
        setTimeout(() => this.router.navigate(['/app/dashboard/student-classes']), 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.message = this.translate.instant('EXAM.MESSAGES.ERROR');
      }
    });
  }
}
