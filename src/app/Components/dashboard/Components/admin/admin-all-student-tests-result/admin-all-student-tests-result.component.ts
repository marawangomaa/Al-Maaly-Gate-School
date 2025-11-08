import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'app-admin-all-student-tests-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-all-student-tests-result.component.html',
  styleUrl: './admin-all-student-tests-result.component.css'
})
export class AdminAllStudentTestsResultComponent {
  selectedType: string = 'الكل';

  results = [
    {
      studentName: 'أحمد علي',
      teacherName: 'أ. خالد حسن',
      subject: 'الرياضيات',
      examType: 'أعمال السنة',
      mode: 'أونلاين',
      score: 45,
      total: 50
    },
    {
      studentName: 'سارة محمد',
      teacherName: 'أ. فاطمة عبد الله',
      subject: 'اللغة العربية',
      examType: 'نهاية السنة',
      mode: 'أوفلاين',
      score: 38,
      total: 50
    },
    {
      studentName: 'عمر محمود',
      teacherName: 'أ. يوسف إبراهيم',
      subject: 'العلوم',
      examType: 'نهاية السنة',
      mode: 'أونلاين',
      score: 20,
      total: 50
    }
  ];

  filteredResults() {
    if (this.selectedType === 'الكل') return this.results;
    return this.results.filter(r => r.examType === this.selectedType);
  }

  viewDetails(result: any) {
    alert(
      ` تفاصيل النتيجة:\n\n` +
      ` الطالب: ${result.studentName}\n` +
      ` المادة: ${result.subject}\n` +
      ` المدرس: ${result.teacherName}\n` +
      ` الدرجة: ${result.score} / ${result.total}\n` +
      ` طريقة الاختبار: ${result.mode}`
    );
  }

}
