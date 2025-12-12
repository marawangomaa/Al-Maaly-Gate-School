import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { istudentExamResults } from '../../../../../Interfaces/istudentExamResults';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/auth.service';
import { StudentAnswerWithQuestionDto } from '../../../../../Interfaces/StudentAnswerWithQuestionDto';
import { QuestionTypes } from '../../../../../Interfaces/QuestionTypes';
import { StudentService } from '../../../../../Services/student.service';

@Component({
  selector: 'app-student-grades',
  imports: [CommonModule, DatePipe],
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

  ngOnInit() {
    this.studentId = this._Auth.getStudentId()!;
    this.StudentExamsResults(this.studentId);
  }

  Stgrades: any[] = [
    {
      "id": "gr-001",
      "subject": "الرياضيات",
      "teacher": "أ. خالد عبد الله",
      "type": "assignment",
      "title": "حل واجب الوحدة الأولى",
      "date": "2025-09-15",
      "score": 18,
      "total": 20,
      "grade": "ممتاز",
      "status": "graded",
      "method": "online"
    },
    {
      "id": "gr-002",
      "subject": "اللغة العربية",
      "teacher": "أ. منى محمود",
      "type": "online_test",
      "title": "اختبار القواعد الأسبوعي",
      "date": "2025-09-20",
      "score": 42,
      "total": 50,
      "grade": "جيد جدًا",
      "status": "graded",
      "method": "online"
    },
    {
      "id": "gr-003",
      "subject": "العلوم",
      "teacher": "أ. سامي نجيب",
      "type": "offline_exam",
      "title": "اختبار العملي - الفصل الأول",
      "date": "2025-09-25",
      "score": 45,
      "total": 50,
      "grade": "ممتاز",
      "status": "graded",
      "method": "offline"
    },
    {
      "id": "gr-004",
      "subject": "اللغة الإنجليزية",
      "teacher": "أ. مها عبد السلام",
      "type": "final",
      "title": "الاختبار النهائي - الترم الأول",
      "date": "2025-10-01",
      "score": 82,
      "total": 100,
      "grade": "جيد جدًا",
      "status": "graded",
      "method": "offline"
    },
    {
      "id": "gr-005",
      "subject": "التاريخ",
      "teacher": "أ. أحمد السعدي",
      "type": "online_test",
      "title": "اختبار قصير - الوحدة الثانية",
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
        this.ExamsResults = response.data;
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

    // تحتاج لاستدعاء service لجلب بيانات التصحيح
    this._StudentService.StudentResultWithQuestions(studentId, examId).subscribe({
      next: (response: ApiResponse<StudentAnswerWithQuestionDto[]>) => {
        if (response.success && response.data) {
          this.selectedCorrectionData = response.data;
          console.log(response.data, response.success);
        }
        this.loadingCorrection = false;
      },
      error: (error) => {
        console.error('Error loading correction:', error);
        this.loadingCorrection = false;
      }
    });
  }

  closeCorrectionModal() {
    this.showCorrectionModal = false;
    this.selectedCorrectionData = [];
  }

  // دوال مساعدة للعرض في المودال
  getStudentAnswerText(answer: StudentAnswerWithQuestionDto): string {
    switch (answer.questionType) {
      case 'TrueOrFalse':
        return answer.studentTrueFalseAnswer !== null && answer.studentTrueFalseAnswer !== undefined
          ? (answer.studentTrueFalseAnswer ? 'صح' : 'خطأ')
          : 'No Answer';

      case 'Choices':
        return answer.studentChoiceText || 'No Answer';

      case 'Complete':
        return answer.studentTextAnswer || 'No Answer';

      case 'Connection':
        return answer.studentConnectionTexts || 'No Answer';

      default:
        return 'No Answer';
    }
  }

  getCorrectAnswerText(answer: StudentAnswerWithQuestionDto): string {
    switch (answer.questionType) {
      case 'TrueOrFalse':
        return answer.correctTrueFalseAnswer !== null && answer.correctTrueFalseAnswer !== undefined
          ? (answer.correctTrueFalseAnswer ? 'صح' : 'خطأ')
          : 'No Answer';

      case 'Choices':
        return answer.correctChoiceText || 'No Answer';

      case 'Complete':
        return answer.correctTextAnswer || 'No Answer';

      case 'Connection':
        return answer.correctConnectionTexts || 'No Answer';

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
        return 'status-completed';
      case 'قيد الانتظار':
        return 'status-pending';
      case 'ملغى':
        return 'status-failed';
      default:
        return '';
    }
  }
  // دوال إضافية للـ HTML
  getExamTypeBadge(examName: string): string {
    const examTypes: { [key: string]: string } = {
      'اختبار نهائي': 'bg-danger',
      'اختبار منتصف الفصل': 'bg-warning',
      'اختبار أسبوعي': 'bg-info',
      'عمل السنة': 'bg-success',
      'اختبار تجريبي': 'bg-secondary'
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
