import { Component, inject, OnInit } from '@angular/core';
import { StudentExamAnswerService } from '../../Services/student-exam-answer.service';
import { CommonModule } from '@angular/common';
import { ClassExamsService } from '../../Services/class-exams.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { iexamWithQuestions } from '../../Interfaces/iexamWithQuestions';
import { istudentExamAnswer } from '../../Interfaces/istudentExamAnswer';
import { istudentExamSubmission } from '../../Interfaces/istudentExamSubmission';

@Component({
  selector: 'app-exam',
  imports: [CommonModule],
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

  _StudentExamAnswer = inject(StudentExamAnswerService);
  _ClassExams = inject(ClassExamsService);
  _Auth = inject(AuthService);

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

        // Initialize answers with all fields
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

    // Must have 2 correct
    if (correct.length < 2) {
      console.error("Connection question requires at least 2 correct items.");
    }

    // Initialize
    const left = [correct[0]];
    const right = [correct[1]];

    // Shuffle helper
    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

    // Add incorrect items
    const rest = shuffle([...incorrect]);

    rest.forEach((item: any, index: number) => {
      index % 2 === 0 ? left.push(item) : right.push(item);
    });

    // Shuffle each column
    shuffle(left);
    shuffle(right);

    return { left, right };
  }

  onSelectConnectionLeft(questionId: string, leftId: string) {
    if (!this.studentAnswers[questionId]) {
      this.studentAnswers[questionId] = {};
    }
    this.studentAnswers[questionId].left = leftId;
  }

  onSelectConnectionRight(questionId: string, rightId: string) {
    if (!this.studentAnswers[questionId]) {
      this.studentAnswers[questionId] = {};
    }
    this.studentAnswers[questionId].right = rightId;
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
      //Complete,Connection,TrueOrFalse,Choices
      switch (q.type) {
        case "Choices":
          return !!ans.choiceId;

        case "TrueOrFalse":
          return ans.trueAndFalseAnswer !== null;

        case "Complete":
          return ans.CorrectTextAnswer?.trim().length > 0;

        case "Connection":
          return ans.left && ans.right;

        default:
          return false;
      }
    });
  }


  submitExam() {
    if (!this.allQuestionsAnswered()) {
      this.message = "should answer all questions before submitting.";
      return;
    }

    const answers: istudentExamAnswer[] = Object.entries(this.studentAnswers).map(
      ([questionId, answer]: [string, any]) => ({
        questionId,
        choiceId: answer.choiceId || null,
        CorrectTextAnswer: answer.CorrectTextAnswer?.trim() || null,
        ConnectionId: answer.left && answer.right
          ? { leftId: answer.left, rightId: answer.right }
          : null,
        trueAndFalseAnswer: answer.trueAndFalseAnswer ?? null
      })
    );

    const submission: istudentExamSubmission = {
      studentId: this.studentId,
      examId: this.examId,
      teacherId: this.teacherId,
      answers
    };

    console.log('Submitting exam with data:', submission);

    this.isSubmitting = true;
    this.message = '';

    this._StudentExamAnswer.submitExam(submission).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.message = response.message || 'Exam submitted successfully!';
        setTimeout(() => this.router.navigate(['/app/dashboard/student-classes']), 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Submission error:', error);
        this.message = error.error?.message || 'Failed to submit exam.';
      }
    });
  }
}