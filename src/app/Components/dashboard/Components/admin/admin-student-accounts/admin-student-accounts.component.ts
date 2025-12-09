import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../../../Services/student.service';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { istudentProfile } from '../../../../../Interfaces/istudentProfile';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/AuthService';

@Component({
  selector: 'app-admin-student-accounts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-student-accounts.component.html',
  styleUrl: './admin-student-accounts.component.css'
})
export class AdminStudentAccountsComponent {
  allStudents: istudentProfile[] = [];
  isLoading: boolean = false;
  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';

  private subscription = new Subscription();

  constructor(
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.LoadAllStudents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filteredStudents() {
    if (this.selectedStatus === 'all') return this.allStudents;

    return this.allStudents.filter(t =>
      this.convertToAccountStatus(t.accountStatus) === this.selectedStatus
    );
  }

  isStudentsPending(student: istudentProfile): boolean {
    return this.convertToAccountStatus(student.accountStatus) === AccountStatus.Pending;
  }

  isStudentsRejected(student: istudentProfile): boolean {
    return this.convertToAccountStatus(student.accountStatus) === AccountStatus.Rejected;
  }

  isStudentsActive(student: istudentProfile): boolean {
    return this.convertToAccountStatus(student.accountStatus) === AccountStatus.Active;
  }

  isStudentsBlocked(student: istudentProfile): boolean {
    return this.convertToAccountStatus(student.accountStatus) === AccountStatus.Blocked;
  }


  convertToAccountStatus(status: string | AccountStatus): AccountStatus {
    if (typeof status === 'number') {
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

  ApproveStudentAction(studentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في الموافقة على هذا الطالب؟')) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.subscription.add(
      this.adminService.ApproveAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert('تمت الموافقة على الطالب بنجاح');
            // Update UI locally
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Active;
          } else {
            alert('فشل في الموافقة على الطالب');
          }
        },
        error: err => alert(`خطأ في الموافقة على الطالب: ${err.message}`)
      })
    );
  }

  RejectStudentAction(studentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في رفض هذا الطالب؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    this.subscription.add(
      this.adminService.RejectAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert('تم رفض الطالب بنجاح');
            // Update UI locally
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Rejected;
          }
          else {
            alert('فشل في رفض الطالب');
          }
        },
        error: err => alert(`خطأ في رفض الطالب: ${err.message}`)
      })
    );
  }

  BlockStudentAction(studentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في حظر هذا الطالب؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.subscription.add(
      this.adminService.BlockAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert('تم حظر الطالب بنجاح');
            // Update UI locally
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Blocked;
          }
          else {
            alert('فشل في حظر الطالب');
          }
        },
        error: err => alert(`خطأ في حظر الطالب: ${err.message}`)
      })
    );
  }

  UnblockStudentAction(studentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في فك حظر هذا الطالب؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    this.subscription.add(
      this.adminService.UnblockAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert('تم فك حظر الطالب بنجاح');
            // Update UI locally
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Active;
          }
          else {
            alert('فشل في فك حظر الطالب');
          }
        },
        error: err => alert(`خطأ في فك حظر الطالب: ${err.message}`)
      })
    );
  }

  private LoadAllStudents(): void {
    this.subscription.add(
      this._StudentService.GetAllStudents().subscribe({
        next: (response: ApiResponse<istudentProfile[]>) => {
          this.allStudents = response.data;
          console.log('All Students:', response.data);
        },
        error: err => alert(`خطأ في تحميل جميع الحسابات: ${err.message}`)
      })
    );
  }
}
