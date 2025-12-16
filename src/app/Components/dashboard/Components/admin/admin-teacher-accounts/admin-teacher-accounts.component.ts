import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Teacher } from '../../../../../Interfaces/teacher';
import { Subscription } from 'rxjs';
import { TeacherService } from '../../../../../Services/teacher.service';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { AuthService } from '../../../../../Services/AuthService';
import { FormsModule } from '@angular/forms';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';

@Component({
  selector: 'app-admin-teacher-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-teacher-accounts.component.html',
  styleUrl: './admin-teacher-accounts.component.css'
})
export class AdminTeacherAccountsComponent {

  subjectName = '';
  teachersBySubject: Teacher[] = [];
  allTeachers: Teacher[] = [];
  hasSearched = false;
  isLoading = false;

  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';

  private subscription = new Subscription();

  constructor(
    private teacherService: TeacherService,
    private adminService: AdminManagementService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.LoadAllTeachers();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // دالة التصفية
  filteredTeachers() {
    if (this.selectedStatus === 'all') return this.allTeachers;

    return this.allTeachers.filter(t =>
      this.convertToAccountStatus(t.accountStatus) === this.selectedStatus
    );
  }

  isTeacherPending(teacher: Teacher): boolean {
    return this.convertToAccountStatus(teacher.accountStatus) === AccountStatus.Pending;
  }

  isTeacherRejected(teacher: Teacher): boolean {
    return this.convertToAccountStatus(teacher.accountStatus) === AccountStatus.Rejected;
  }

  isTeacherActive(teacher: Teacher): boolean {
    return this.convertToAccountStatus(teacher.accountStatus) === AccountStatus.Active;
  }

  isTeacherBlocked(teacher: Teacher): boolean {
    return this.convertToAccountStatus(teacher.accountStatus) === AccountStatus.Blocked;
  }


  // دالة مساعدة لتحويل string إلى AccountStatus
  convertToAccountStatus(status: string | AccountStatus): AccountStatus {
    if (typeof status === 'number') {
      // إذا كان enum value بالفعل
      return status;
    }

    const statusStr = (status || '').toString().toLowerCase();

    switch (statusStr) {
      case 'pending':
      case 'pendingapproval':
        return AccountStatus.Pending;
      case 'active':
        return AccountStatus.Active;
      case 'blocked':
        return AccountStatus.Blocked;
      case 'rejected':
        return AccountStatus.Rejected;
      default:
        console.warn(`Unknown status: ${status}, defaulting to Pending`);
        return AccountStatus.Pending;
    }
  }

  // ثم استخدمها في الدوال
  getStatusName(status: string | AccountStatus): string {
    const accountStatus = typeof status === 'string'
      ? this.convertToAccountStatus(status)
      : status;

    switch (accountStatus) {
      case AccountStatus.Pending: return 'قيد الانتظار';
      case AccountStatus.Active: return 'نشط';
      case AccountStatus.Blocked: return 'محظور';
      case AccountStatus.Rejected: return 'مرفوض';
      default: return 'غير معروف';
    }
  }

  // دالة للحصول على لون الحالة
  getStatusColor(status: string | AccountStatus): string {
    const accountStatus = typeof status === 'string'
      ? this.convertToAccountStatus(status)
      : status;

    switch (accountStatus) {
      case AccountStatus.Pending: return 'warning';
      case AccountStatus.Active: return 'success';
      case AccountStatus.Blocked: return 'secondary';
      case AccountStatus.Rejected: return 'danger';
      default: return 'secondary';
    }
  }



  //Load teachers by subject name
  LoadTeachersBySubjectName(): void {
    const subject = this.subjectName.trim();
    this.hasSearched = true;

    if (!subject) {
      alert('الرجاء إدخال اسم المادة');
      this.teachersBySubject = [];
      return;
    }

    this.isLoading = true;

    this.subscription.add(
      this.adminService.GetTeachersBySubjectName(subject).subscribe({
        next: teachers => {
          this.teachersBySubject = teachers;
          this.isLoading = false;
          console.log(`Teachers for subject ${subject}:`, teachers);
        },
        error: err => {
          this.isLoading = false;
          alert(`خطأ في تحميل المعلمين للمادة ${subject}: ${err.message}`);
        }
      })
    );
  }

  //Approve Teacher
  ApproveTeacherAction(teacherId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في الموافقة على هذا المعلم؟')) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.subscription.add(
      this.adminService.ApproveAccount(teacherId, adminUserId, 'teacher').subscribe({
        next: result => {
          if (result) {
            alert('تمت الموافقة على المعلم بنجاح');
            // Update UI locally
            const teacher = this.allTeachers.find(t => t.id === teacherId);
            if (teacher) teacher.accountStatus = AccountStatus.Active;
          } else {
            alert('فشل في الموافقة على المعلم');
          }
        },
        error: err => alert(`خطأ في الموافقة على المعلم: ${err.message}`)
      })
    );
  }

  //reject-teacher
  RejectTeacherAction(teacherId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في رفض هذا المعلم؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    this.subscription.add(
      this.adminService.RejectAccount(teacherId, adminUserId, 'teacher').subscribe({
        next: result => {
          if (result) {
            alert('تم رفض المعلم بنجاح');
            // Update UI locally
            const teacher = this.allTeachers.find(t => t.id === teacherId);
            if (teacher) teacher.accountStatus = AccountStatus.Rejected;
          }
          else {
            alert('فشل في رفض المعلم');
          }
        },
        error: err => alert(`خطأ في رفض المعلم: ${err.message}`)
      })
    );
  }

  //Block teacher
  BlockTeacherAction(teacherId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في حظر هذا المعلم؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.subscription.add(
      this.adminService.BlockAccount(teacherId, adminUserId, 'teacher').subscribe({
        next: result => {
          if (result) {
            alert('تم حظر المعلم بنجاح');
            // Update UI locally
            const teacher = this.allTeachers.find(t => t.id === teacherId);
            if (teacher) teacher.accountStatus = AccountStatus.Blocked;
          }
          else {
            alert('فشل في حظر المعلم');
          }
        },
        error: err => alert(`خطأ في حظر المعلم: ${err.message}`)
      })
    );
  }

  //Unblock teacher
  UnblockTeacherAction(teacherId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في فك حظر هذا المعلم؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    this.subscription.add(
      this.adminService.UnblockAccount(teacherId, adminUserId, 'teacher').subscribe({
        next: result => {
          if (result) {
            alert('تم فك حظر المعلم بنجاح');
            // Update UI locally
            const teacher = this.allTeachers.find(t => t.id === teacherId);
            if (teacher) teacher.accountStatus = AccountStatus.Active;
          }
          else {
            alert('فشل في فك حظر المعلم');
          }
        },
        error: err => alert(`خطأ في فك حظر المعلم: ${err.message}`)
      })
    );
  }

  //Load all teachers
  private LoadAllTeachers(): void {
    this.subscription.add(
      this.teacherService.GetAllTeachers().subscribe({
        next: teachers => {
          this.allTeachers = teachers;
          console.log('All Teachers:', teachers);
        },
        error: err => alert(`خطأ في تحميل جميع المعلمين: ${err.message}`)
      })
    );
  }
}