import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { istudentExamResults } from '../../../../../Interfaces/istudentExamResults';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/auth.service';
import { StudentAnswerWithQuestionDto } from '../../../../../Interfaces/StudentAnswerWithQuestionDto';
import { QuestionTypes } from '../../../../../Interfaces/QuestionTypes';
import { StudentService } from '../../../../../Services/student.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-student-grades',
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './student-grades.component.html',
  styleUrl: './student-grades.component.css'
})
export class StudentGradesComponent implements OnInit {
  QuestionsTypes = QuestionTypes;
  showCorrectionModal: boolean = false;
  selectedCorrectionData: StudentAnswerWithQuestionDto[] = [];
  loadingCorrection: boolean = false;

  studentId!: string;
  ExamsResults?: istudentExamResults[];

  _StudentService = inject(StudentService);
  _Auth = inject(AuthService);
  private translate = inject(TranslateService);

  ngOnInit() {
    this.studentId = this._Auth.getStudentId()!;
    this.StudentExamsResults(this.studentId);
  }

  Stgrades: any[] = [
    {
      "id": "gr-001",
      "subject": this.translate.instant('STUDENT_GRADES.SUBJECT') === 'المادة' ? "الرياضيات" : "Mathematics",
      "teacher": this.translate.instant('STUDENT_GRADES.TEACHER') === 'المعلم' ? "أ. خالد عبد الله" : "Mr. Khalid Abdullah",
      "type": "assignment",
      "title": this.translate.instant('STUDENT_GRADES.TITLE_HEADER') === 'العنوان' ? "حل واجب الوحدة الأولى" : "Unit 1 Homework Solution",
      "date": "2025-09-15",
      "score": 18,
      "total": 20,
      "grade": this.translate.instant('STUDENT_GRADES.TITLE') === 'درجات الطالب' ? "ممتاز" : "Excellent",
      "status": "graded",
      "method": "online"
    },
    {
      "id": "gr-002",
      "subject": this.translate.instant('STUDENT_GRADES.SUBJECT') === 'المادة' ? "اللغة العربية" : "Arabic Language",
      "teacher": this.translate.instant('STUDENT_GRADES.TEACHER') === 'المعلم' ? "أ. منى محمود" : "Ms. Mona Mahmoud",
      "type": "online_test",
      "title": this.translate.instant('STUDENT_GRADES.TITLE_HEADER') === 'العنوان' ? "اختبار القواعد الأسبوعي" : "Weekly Grammar Test",
      "date": "2025-09-20",
      "score": 42,
      "total": 50,
      "grade": this.translate.instant('STUDENT_GRADES.TITLE') === 'درجات الطالب' ? "جيد جدًا" : "Very Good",
      "status": "graded",
      "method": "online"
    },
    {
      "id": "gr-003",
      "subject": this.translate.instant('STUDENT_GRADES.SUBJECT') === 'المادة' ? "العلوم" : "Science",
      "teacher": this.translate.instant('STUDENT_GRADES.TEACHER') === 'المعلم' ? "أ. سامي نجيب" : "Mr. Sami Naguib",
      "type": "offline_exam",
      "title": this.translate.instant('STUDENT_GRADES.TITLE_HEADER') === 'العنوان' ? "اختبار العملي - الفصل الأول" : "Practical Exam - Chapter 1",
      "date": "2025-09-25",
      "score": 45,
      "total": 50,
      "grade": this.translate.instant('STUDENT_GRADES.TITLE') === 'درجات الطالب' ? "ممتاز" : "Excellent",
      "status": "graded",
      "method": "offline"
    },
    {
      "id": "gr-004",
      "subject": this.translate.instant('STUDENT_GRADES.SUBJECT') === 'المادة' ? "اللغة الإنجليزية" : "English Language",
      "teacher": this.translate.instant('STUDENT_GRADES.TEACHER') === 'المعلم' ? "أ. مها عبد السلام" : "Ms. Maha Abdul Salam",
      "type": "final",
      "title": this.translate.instant('STUDENT_GRADES.TITLE_HEADER') === 'العنوان' ? "الاختبار النهائي - الترم الأول" : "Final Exam - First Term",
      "date": "2025-10-01",
      "score": 82,
      "total": 100,
      "grade": this.translate.instant('STUDENT_GRADES.TITLE') === 'درجات الطالب' ? "جيد جدًا" : "Very Good",
      "status": "graded",
      "method": "offline"
    },
    {
      "id": "gr-005",
      "subject": this.translate.instant('STUDENT_GRADES.SUBJECT') === 'المادة' ? "التاريخ" : "History",
      "teacher": this.translate.instant('STUDENT_GRADES.TEACHER') === 'المعلم' ? "أ. أحمد السعدي" : "Mr. Ahmed Al-Saadi",
      "type": "online_test",
      "title": this.translate.instant('STUDENT_GRADES.TITLE_HEADER') === 'العنوان' ? "اختبار قصير - الوحدة الثانية" : "Short Test - Unit 2",
      "date": "2025-10-05",
      "score": null,
      "total": 30,
      "grade": "",
      "status": "pending",
      "method": "online"
    }
  ]

  grades = this.Stgrades;

  filter: 'all' | 'assignments' | 'finals' | 'online' | 'offline' = 'all';

  get filteredGrades() {
    switch (this.filter) {
      case 'assignments':
        return this.grades.filter(g => g.type === 'assignment');
      case 'finals':
        return this.grades.filter(g => g.type === 'final');
      case 'online':
        return this.grades.filter(g => g.method === 'online');
      case 'offline':
        return this.grades.filter(g => g.method === 'offline');
      default:
        return this.grades;
    }
  }

  StudentExamsResults(studentId: string) {
    this._StudentService.GetStudentExamsResults(studentId).subscribe({
      next: (response: ApiResponse<istudentExamResults[]>) => {
        this.ExamsResults = response.data || [];
        console.log(response.data, response.success);
      },
      error: (error: ApiResponse<istudentExamResults[]>) => {
        console.log(error.message);
      }
    });
  }

  showCorrection(studentId: string, examId: string) {
    this.loadingCorrection = true;
    this.showCorrectionModal = true;

    this._StudentService.StudentResultWithQuestions(studentId, examId).subscribe({
      next: (response: ApiResponse<StudentAnswerWithQuestionDto[]>) => {
        if (response.success && response.data) {
          this.selectedCorrectionData = response.data;
          console.log(response.data, response.success);
        }
        this.loadingCorrection = false;
      },
      error: (error) => {
        console.error(this.translate.instant('STUDENT_GRADES_TS.ERRORS.LOADING_CORRECTION'), error);
        this.loadingCorrection = false;
      }
    });
  }

  closeCorrectionModal() {
    this.showCorrectionModal = false;
    this.selectedCorrectionData = [];
  }

  getStudentAnswerText(answer: StudentAnswerWithQuestionDto): string {
    switch (answer.questionType) {
      case 'TrueOrFalse':
        return answer.studentTrueFalseAnswer !== null && answer.studentTrueFalseAnswer !== undefined
          ? (answer.studentTrueFalseAnswer ? this.translate.instant('STUDENT_GRADES.YES') : this.translate.instant('STUDENT_GRADES.NO'))
          : this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      case 'Choices':
        return answer.studentChoiceText || this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      case 'Complete':
        return answer.studentTextAnswer || this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      case 'Connection':
        return answer.studentConnectionTexts || this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      default:
        return this.translate.instant('STUDENT_GRADES.NO_ANSWER');
    }
  }

  getCorrectAnswerText(answer: StudentAnswerWithQuestionDto): string {
    switch (answer.questionType) {
      case 'TrueOrFalse':
        return answer.correctTrueFalseAnswer !== null && answer.correctTrueFalseAnswer !== undefined
          ? (answer.correctTrueFalseAnswer ? this.translate.instant('STUDENT_GRADES.YES') : this.translate.instant('STUDENT_GRADES.NO'))
          : this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      case 'Choices':
        return answer.correctChoiceText || this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      case 'Complete':
        return answer.correctTextAnswer || this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      case 'Connection':
        return answer.correctConnectionTexts || this.translate.instant('STUDENT_GRADES.NO_ANSWER');

      default:
        return '';
    }
  }

  getAnswerStatusClass(answer: StudentAnswerWithQuestionDto): string {
    return answer.isCorrect ? 'correct-answer' : 'wrong-answer';
  }

  getTotalCorrectAnswers(): number {
    return this.selectedCorrectionData.filter(a => a.isCorrect).length;
  }

  getTotalQuestions(): number {
    return this.selectedCorrectionData.length;
  }

  getTotalStudentMarks(): number {
    return this.selectedCorrectionData.reduce((total, answer) => total + (answer.studentMark || 0), 0);
  }

  getTotalPossibleMarks(): number {
    return this.selectedCorrectionData.reduce((total, answer) => total + answer.questionDegree, 0);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'مكتمل':
      case 'completed':
        return 'status-completed';
      case 'قيد الانتظار':
      case 'pending':
        return 'status-pending';
      case 'ملغى':
      case 'cancelled':
        return 'status-failed';
      default:
        return '';
    }
  }

  getExamTypeBadge(examName: string): string {
    const examTypes: { [key: string]: string } = {
      'اختبار نهائي': 'bg-danger',
      'final exam': 'bg-danger',
      'اختبار منتصف الفصل': 'bg-warning',
      'midterm exam': 'bg-warning',
      'اختبار أسبوعي': 'bg-info',
      'weekly test': 'bg-info',
      'عمل السنة': 'bg-success',
      'coursework': 'bg-success',
      'اختبار تجريبي': 'bg-secondary',
      'practice test': 'bg-secondary'
    };

    return examTypes[examName] || 'bg-primary';
  }

  getMarkClass(percentage: number): string {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 75) return 'text-primary';
    if (percentage >= 50) return 'text-warning';
    return 'text-danger';
  }

  getPercentage(): number {
    const totalMarks = this.getTotalStudentMarks();
    const totalDegree = this.getTotalPossibleMarks();

    if (totalDegree === 0) return 0;

    return Math.round((totalMarks / totalDegree) * 100);
  }
}