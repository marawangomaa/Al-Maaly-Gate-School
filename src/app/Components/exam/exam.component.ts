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
  examId!: string;
  isSubmitting = false;
  exam?: iexamWithQuestions;
  studentAnswers: Record<string, any> = {};
  answers: istudentExamAnswer[] = [];
  message = '';

  _StudentExamAnswer = inject(StudentExamAnswerService);
  _ClassExams = inject(ClassExamsService);
  _Auth = inject(AuthService);

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.studentId = this._Auth.getStudentId()!;

    this.route.paramMap.subscribe(params => {
      this.examId = params.get('id')!;
      // console.log("Exam id out condition",this.examId);
    });

    if (this.examId) {
      // console.log("Exam id in condition",this.examId);
      this.loadExam(this.examId);
    }

  }

  loadExam(examId: string) {
    this._ClassExams.GetExamById(examId).subscribe({
      next: res => {
        this.exam = res.data;

        // Initialize answers with all fields
        this.studentAnswers = {};
        this.exam.questions.forEach(q => {
          this.studentAnswers[q.id] = {
            choiceId: null,
            textAnswer: '',
            trueAndFalseAnswer: null
          };
        });
      }
    });
  }

  onSelectChoice(questionId: string, choiceId: string) {
    this.studentAnswers[questionId] = {
      ...this.studentAnswers[questionId],
      choiceId
    };
  }

  onTrueFalseChange(questionId: string, value: boolean) {
    this.studentAnswers[questionId] = {
      ...this.studentAnswers[questionId],
      trueAndFalseAnswer: value
    };
  }

  onTextChange(questionId: string, text: string) {
    this.studentAnswers[questionId] = {
      ...this.studentAnswers[questionId],
      textAnswer: text.trim()
    };
  }

  submitExam() {
    if (!this.answers) {
      this.message = 'Please answer all questions before submitting.';
      return;
    }

    // Map answers ensuring nulls for empty fields
    const answers: istudentExamAnswer[] = Object.entries(this.studentAnswers).map(
      ([questionId, answer]: [string, any]) => ({
        questionId,
        choiceId: answer.choiceId || null,
        textAnswer: answer.textAnswer?.trim() || null,
        trueAndFalseAnswer: answer.trueAndFalseAnswer ?? null
      })
    );

    const submission: istudentExamSubmission = {
      studentId: this.studentId,
      examId: this.examId,
      TeacherId: this.exam?.teacherId || '',
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