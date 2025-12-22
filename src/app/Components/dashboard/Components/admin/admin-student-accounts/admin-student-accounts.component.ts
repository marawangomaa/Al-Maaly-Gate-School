import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../../../Services/student.service';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { istudentProfile } from '../../../../../Interfaces/istudentProfile';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/AuthService';
import { FormsModule } from '@angular/forms';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { ClassService } from '../../../../../Services/class.service';

@Component({
  selector: 'app-admin-student-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-student-accounts.component.html',
  styleUrl: './admin-student-accounts.component.css'
})
export class AdminStudentAccountsComponent {
  allStudents: istudentProfile[] = [];
  allClasses: ClassViewDto[] = [];
  isLoading: boolean = false;
  isClassesLoading: boolean = false;
  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';

  showAssignModal: boolean = false;
  selectedStudentForModal: istudentProfile | null = null;
  selectedClassId: string = '';
  isAssigning: boolean = false;

  private subscription = new Subscription();

  constructor(
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService,
    private _ClassService: ClassService
  ) { }

  ngOnInit(): void {
    this.LoadAllStudents();
    this.LoadAllClasses(); // تحميل الفصول عند التهيئة
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

  // فتح مودال إضافة الطالب للفصل
  openAssignToClassModal(student: istudentProfile): void {
    this.selectedStudentForModal = student;
    this.selectedClassId = student.classId || ''; // إذا كان الطالب لديه فصل مسبقاً
    this.showAssignModal = true;
  }

  // دمج الموافقة مع إضافة للفصل
  // approveStudentWithClass(): void {
  //   if (!this.selectedStudentForModal) return;

  //   if (!this.selectedClassId) {
  //     alert('يرجى اختيار فصل للطالب');
  //     return;
  //   }

  //   if (!confirm(`هل أنت متأكد من رغبتك في الموافقة على الطالب وإضافته للفصل؟`)) return;

  //   const adminUserId = this.authService.userId;
  //   if (!adminUserId) {
  //     alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
  //     return;
  //   }

  //   this.isAssigning = true;

  //   this.subscription.add(
  //     this.adminService.MoveStudentToAnotherClass(
  //       this.selectedStudentForModal.id,
  //       this.selectedClassId,
  //       adminUserId
  //     ).subscribe({
  //       next: (result: any) => {
  //         this.isAssigning = false;

  //         if (result.success || result.data) {
  //           alert('تمت الموافقة على الطالب وإضافته للفصل بنجاح');
  //           this.ApproveStudentAction( );
  //           // تحديث حالة الطالب محلياً
  //           const student = this.allStudents.find(t => t.id === this.selectedStudentForModal!.id);
  //           if (student) {
  //             student.accountStatus = AccountStatus.Active;
  //             student.classId = this.selectedClassId;
  //           }



  //           this.closeAssignModal();
  //         } else {
  //           alert('فشل في الموافقة على الطالب');
  //         }
  //       },
  //       error: err => {
  //         this.isAssigning = false;
  //         alert(`خطأ في الموافقة على الطالب: ${err.message}`);
  //       }
  //     })
  //   );
  // }

  // ApproveStudentAction(studentId: string): void {
  //   if (!confirm('هل أنت متأكد من رغبتك في الموافقة على هذا الطالب؟')) return;

  //   const adminUserId = this.authService.userId;
  //   if (!adminUserId) {
  //     alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
  //     return;
  //   }

  //   this.subscription.add(
  //     this.adminService.ApproveAccount(studentId, adminUserId, 'student').subscribe({
  //       next: result => {
  //         if (result) {
  //           alert('تمت الموافقة على الطالب بنجاح');
  //           // Update UI locally
  //           const student = this.allStudents.find(t => t.id === studentId);
  //           if (student) student.accountStatus = AccountStatus.Active;
  //         } else {
  //           alert('فشل في الموافقة على الطالب');
  //         }
  //       },
  //       error: err => alert(`خطأ في الموافقة على الطالب: ${err.message}`)
  //     })
  //   );
  // }

  // دمج الموافقة مع إضافة للفصل
  approveStudentWithClass(): void {
    if (!this.selectedStudentForModal) return;

    if (!this.selectedClassId) {
      alert('يرجى اختيار فصل للطالب');
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في الموافقة على الطالب وإضافته للفصل؟`)) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.isAssigning = true;
    const studentId = this.selectedStudentForModal.id;

    // 1. أولاً: الموافقة على الحساب
    this.subscription.add(
      this.adminService.ApproveAccount(studentId, adminUserId, 'student').subscribe({
        next: (approveResult) => {
          // 2. ثانياً: إضافة الطالب للفصل
          this.subscription.add(
            this.adminService.MoveStudentToAnotherClass(
              studentId,
              this.selectedClassId,
              adminUserId
            ).subscribe({
              next: (moveResult: any) => {
                this.isAssigning = false;

                if (moveResult.success || moveResult.data) {
                  alert('تمت الموافقة على الطالب وإضافته للفصل بنجاح');

                  // تحديث حالة الطالب محلياً
                  const student = this.allStudents.find(t => t.id === studentId);
                  if (student) {
                    student.accountStatus = AccountStatus.Active;
                    student.classId = this.selectedClassId;
                  }

                  this.closeAssignModal();
                } else {
                  alert('تمت الموافقة على الحساب ولكن فشل إضافة الطالب للفصل');
                }
              },
              error: (moveErr) => {
                this.isAssigning = false;
                // حتى لو فشلت إضافة الفصل، الحساب لا يزال تمت الموافقة عليه
                alert(`تمت الموافقة على الحساب ولكن حدث خطأ في إضافة الطالب للفصل: ${moveErr.message}`);

                // تحديث حالة الطالب محلياً (الموافقة تمت بنجاح)
                const student = this.allStudents.find(t => t.id === studentId);
                if (student) {
                  student.accountStatus = AccountStatus.Active;
                }

                this.closeAssignModal();
              }
            })
          );
        },
        error: (approveErr) => {
          this.isAssigning = false;
          alert(`خطأ في الموافقة على الحساب: ${approveErr.message}`);
        }
      })
    );
  }

  // إغلاق المودال
  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedStudentForModal = null;
    this.selectedClassId = '';
    this.isAssigning = false;
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
    this.isLoading = true;
    this.subscription.add(
      this._StudentService.GetAllStudents().subscribe({
        next: (response: ApiResponse<istudentProfile[]>) => {
          this.allStudents = response.data;
          this.isLoading = false;
          console.log('All Students:', response.data);
        },
        error: err => {
          alert(`خطأ في تحميل جميع الحسابات: ${err.message}`);
          this.isLoading = false;
        }
      })
    );
  }

  private LoadAllClasses(): void {
    this.isClassesLoading = true;
    this.subscription.add(
      this._ClassService.getAll().subscribe({ // تحتاج لإنشاء هذه الخدمة
        next: (response: ApiResponse<ClassViewDto[]>) => {
          this.allClasses = response.data;
          this.isClassesLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading classes:', err);
          this.isClassesLoading = false;
        }
      })
    );
  }

  getClassName(classId: string): string {
    const classObj = this.allClasses.find(c => c.id === classId);
    return classObj ? classObj.className : 'غير محدد';
  }
}