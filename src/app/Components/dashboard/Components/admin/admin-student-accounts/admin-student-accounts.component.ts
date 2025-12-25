import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../../../Services/student.service';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { istudentProfile } from '../../../../../Interfaces/istudentProfile';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { AuthService } from '../../../../../Services/AuthService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { ClassService } from '../../../../../Services/class.service';
import istudentUpdate from '../../../../../Interfaces/istudentUpdate';

@Component({
  selector: 'app-admin-student-accounts',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './admin-student-accounts.component.html',
  styleUrl: './admin-student-accounts.component.css'
})
export class AdminStudentAccountsComponent implements OnInit, OnDestroy {
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
  isUpdating: boolean = false;

  // بيانات التحديث
  passportNumber: string = '';
  nationality: string = '';
  iqamaNumber: string = '';

  private subscription = new Subscription();

  constructor(
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService,
    private translate: TranslateService,
    private _ClassService: ClassService
  ) { }

  ngOnInit(): void {
    this.LoadAllStudents();
    this.LoadAllClasses();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getStatusDisplayName(status: AccountStatus | 'all'): string {
    switch (status) {
      case 'all':
        return 'students.statusDisplay.all';
      case AccountStatus.Pending:
        return 'students.statusDisplay.pending';
      case AccountStatus.Active:
        return 'students.statusDisplay.active';
      case AccountStatus.Rejected:
        return 'students.statusDisplay.rejected';
      case AccountStatus.Blocked:
        return 'students.statusDisplay.blocked';
      default:
        return 'students.statusDisplay.all';
    }
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
    const accountStatus = this.convertToAccountStatus(status);

    switch (accountStatus) {
      case AccountStatus.Pending:
        return this.translate.instant('students.status.pending');
      case AccountStatus.Active:
        return this.translate.instant('students.status.active');
      case AccountStatus.Blocked:
        return this.translate.instant('students.status.blocked');
      case AccountStatus.Rejected:
        return this.translate.instant('students.status.rejected');
      default:
        return this.translate.instant('students.status.unknown');
    }
  }

  getStatusColor(status: string | AccountStatus): string {
    const accountStatus = this.convertToAccountStatus(status);

    switch (accountStatus) {
      case AccountStatus.Pending: return 'warning';
      case AccountStatus.Active: return 'success';
      case AccountStatus.Blocked: return 'secondary';
      case AccountStatus.Rejected: return 'danger';
      default: return 'secondary';
    }
  }

  // فتح مودال إضافة الطالب للفصل
  openAssignToClassModal(student: istudentProfile, isUpdating?: boolean): void {
    console.log('فتح مودال للطالب:', student);
    this.selectedStudentForModal = student;
    this.selectedClassId = student.classId || '';

    // تحميل البيانات الحالية للطالب
    this.passportNumber = student.passportNumber || '';
    this.nationality = student.nationality || '';
    this.iqamaNumber = student.iqamaNumber || '';

    if (isUpdating) {
      this.isUpdating = true;
    } else {
      this.isUpdating = false;
    }

    this.showAssignModal = true;
  }

  // إغلاق المودال
  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedStudentForModal = null;
    this.selectedClassId = '';
    this.isAssigning = false;
    this.isUpdating = false;

    // إعادة تعيين بيانات النموذج
    this.passportNumber = '';
    this.nationality = '';
    this.iqamaNumber = '';
  }

  // دالة للتحقق من صحة البيانات المدخلة
  validateAdditionalInfo(): boolean {
    if (!this.passportNumber || this.passportNumber.trim() === '') {
      alert('يرجى إدخال رقم الجواز');
      return false;
    }

    if (!this.nationality || this.nationality.trim() === '') {
      alert('يرجى إدخال الجنسية');
      return false;
    }

    if (!this.iqamaNumber || this.iqamaNumber.trim() === '') {
      alert('يرجى إدخال رقم الإقامة');
      return false;
    }

    if (!this.selectedClassId) {
      alert('يرجى اختيار فصل للطالب');
      return false;
    }

    return true;
  }

  // تحديث البيانات فقط (يغلق المودال بعد التحديث مباشرة)
  updateStudentInfoOnly(): void {
    if (!this.selectedStudentForModal) return;

    if (!this.validateAdditionalInfo()) {
      return;
    }

    if (!confirm('هل أنت متأكد من تحديث بيانات الطالب؟')) return;

    this.isAssigning = true;
    const studentId = this.selectedStudentForModal.id;

    console.log('بدء عملية تحديث بيانات الطالب:', {
      studentId,
      passportNumber: this.passportNumber,
      nationality: this.nationality,
      iqamaNumber: this.iqamaNumber,
      classId: this.selectedClassId
    });

    // 1. تحديث بيانات الطالب
    this.updateStudentAdditionalInfo(studentId).then(() => {
      console.log('تم تحديث البيانات بنجاح');

      // 2. إذا كان هناك classId، أضف الطالب للفصل
      if (this.selectedClassId && this.selectedClassId.trim() !== '') {
        const adminUserId = this.authService.userId;
        if (adminUserId) {
          this.addStudentToClass(studentId, adminUserId, true);
        } else {
          this.finishUpdateProcess();
        }
      } else {
        this.finishUpdateProcess();
      }
    }).catch(error => {
      this.isAssigning = false;
      console.error('خطأ في تحديث البيانات:', error);
      alert(`خطأ في تحديث بيانات الطالب: ${error.message || 'حدث خطأ غير معروف'}`);
    });
  }

  // الموافقة على الطالب وإضافته للفصل
  approveStudentWithClass(): void {
    if (!this.selectedStudentForModal) return;

    if (!this.validateAdditionalInfo()) {
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في تحديث بيانات الطالب والموافقة عليه وإضافته للفصل؟`)) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('students.messages.adminNotFound'));
      return;
    }

    this.isAssigning = true;
    const studentId = this.selectedStudentForModal.id;

    console.log('بدء عملية الموافقة على الطالب:', {
      studentId,
      passportNumber: this.passportNumber,
      nationality: this.nationality,
      iqamaNumber: this.iqamaNumber,
      classId: this.selectedClassId
    });

    // 1. تحديث بيانات الطالب
    this.updateStudentAdditionalInfo(studentId).then(() => {
      console.log('تم تحديث البيانات بنجاح');
      // 2. ثانياً: الموافقة على الحساب
      this.approveStudentAccount(studentId, adminUserId);
    }).catch(error => {
      this.isAssigning = false;
      console.error('خطأ في تحديث البيانات:', error);
      alert(`خطأ في تحديث بيانات الطالب: ${error.message || 'حدث خطأ غير معروف'}`);
    });
  }

  // تحديث البيانات الإضافية للطالب
  public updateStudentAdditionalInfo(studentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const updateData: istudentUpdate = {
        id: studentId,
        passportNumber: this.passportNumber.trim(),
        nationality: this.nationality.trim(),
        iqamaNumber: this.iqamaNumber.trim()
      };

      console.log('إرسال بيانات التحديث:', updateData);

      this.subscription.add(
        this._StudentService.UpdateStudentAdditionalInfo(studentId, updateData).subscribe({
          next: (response: any) => {
            console.log('استجابة تحديث البيانات:', response);
            if (response.success || response.data) {
              console.log('تم تحديث بيانات الطالب بنجاح');

              // تحديث حالة الطالب محلياً
              this.updateLocalStudentData(studentId);

              resolve();
            } else {
              reject(new Error(response.message || 'فشل في تحديث بيانات الطالب'));
            }
          },
          error: (err: any) => {
            console.error('خطأ في تحديث البيانات:', err);
            reject(err);
          }
        })
      );
    });
  }

  // الموافقة على حساب الطالب
  private approveStudentAccount(studentId: string, adminUserId: string): void {
    console.log('بدء الموافقة على الحساب:', { studentId, adminUserId });

    this.subscription.add(
      this.adminService.ApproveAccount(studentId, adminUserId, 'student').subscribe({
        next: (approveResult) => {
          console.log('تمت الموافقة على الحساب:', approveResult);
          // 3. ثالثاً: إضافة الطالب للفصل
          this.addStudentToClass(studentId, adminUserId, false);
        },
        error: (approveErr) => {
          this.isAssigning = false;
          console.error('خطأ في الموافقة على الحساب:', approveErr);
          alert(`تم تحديث البيانات ولكن حدث خطأ في الموافقة على الحساب: ${approveErr.message || 'حدث خطأ غير معروف'}`);
        }
      })
    );
  }

  // إضافة الطالب للفصل
  private addStudentToClass(studentId: string, adminUserId: string, isUpdateOnly: boolean = false): void {
    console.log('إضافة الطالب للفصل:', {
      studentId,
      classId: this.selectedClassId,
      adminUserId,
      isUpdateOnly
    });

    this.subscription.add(
      this.adminService.MoveStudentToAnotherClass(
        studentId,
        this.selectedClassId,
        adminUserId
      ).subscribe({
        next: (moveResult: boolean) => {
          this.isAssigning = false;
          console.log('استجابة إضافة الفصل:', moveResult);

          if (moveResult) {
            // تحديث حالة الطالب محلياً
            this.updateLocalStudentData(studentId);

            if (isUpdateOnly) {
              // للتحديث فقط
              alert('تم تحديث بيانات الطالب وإضافته للفصل بنجاح');
              this.finishUpdateProcess();
            } else {
              // للموافقة وإضافة للفصل
              alert('تم تحديث بيانات الطالب والموافقة عليه وإضافته للفصل بنجاح');
              this.closeAssignModal();
              this.LoadAllStudents();
            }
          } else {
            if (isUpdateOnly) {
              alert('تم تحديث البيانات ولكن فشل إضافة الطالب للفصل');
              this.finishUpdateProcess();
            } else {
              alert('تم تحديث البيانات والموافقة على الحساب ولكن فشل إضافة الطالب للفصل');
              this.closeAssignModal();
            }
          }
        },
        error: (moveErr) => {
          this.isAssigning = false;
          console.error('خطأ في إضافة الطالب للفصل:', moveErr);

          if (isUpdateOnly) {
            alert('تم تحديث البيانات ولكن حدث خطأ في إضافة الطالب للفصل');
            this.finishUpdateProcess();
          } else {
            alert(`تم تحديث البيانات والموافقة على الحساب ولكن حدث خطأ في إضافة الطالب للفصل`);
            this.closeAssignModal();
          }
        }
      })
    );
  }

  // إنهاء عملية التحديث
  private finishUpdateProcess(): void {
    console.log('إنهاء عملية التحديث وإغلاق المودال');
    this.closeAssignModal();
    this.LoadAllStudents();
  }

  // تحديث بيانات الطالب محلياً
  private updateLocalStudentData(studentId: string): void {
    const student = this.allStudents.find(t => t.id === studentId);
    if (student) {
      if (!this.isUpdating) {
        student.accountStatus = AccountStatus.Active;
      }
      student.classId = this.selectedClassId;
      student.passportNumber = this.passportNumber;
      student.nationality = this.nationality;
      student.iqamaNumber = this.iqamaNumber;

      console.log('تم تحديث بيانات الطالب محلياً:', student);
    }
  }

  RejectStudentAction(studentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في رفض هذا الطالب؟')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('students.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.RejectAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('students.messages.rejected'));
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Rejected;
          }
          else {
            alert(this.translate.instant('students.messages.rejectFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('students.messages.error')}: ${err.message}`)
      })
    );
  }

  async BlockStudentAction(studentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('students.confirmations.block'));
    if (!confirmation) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('students.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.BlockAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('students.messages.blocked'));
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Blocked;
          }
          else {
            alert(this.translate.instant('students.messages.blockFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('students.messages.error')}: ${err.message}`)
      })
    );
  }

  async UnblockStudentAction(studentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('students.confirmations.unblock'));
    if (!confirmation) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('students.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.UnblockAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('students.messages.unblocked'));
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Active;
          }
          else {
            alert(this.translate.instant('students.messages.unblockFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('students.messages.error')}: ${err.message}`)
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
          console.log('تم تحميل الطلاب:', this.allStudents.length);
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
      this._ClassService.getAll().subscribe({
        next: (response: ApiResponse<ClassViewDto[]>) => {
          this.allClasses = response.data;
          this.isClassesLoading = false;
          console.log('تم تحميل الفصول:', this.allClasses.length);
        },
        error: (err: any) => {
          console.error('Error loading classes:', err);
          this.isClassesLoading = false;
        }
      })
    );
  }

  getClassName(classId: string): string {
    if (!classId) return 'غير محدد';
    const classObj = this.allClasses.find(c => c.id === classId);
    return classObj ? `${classObj.className} - ${classObj.gradeName}` : 'غير محدد';
  }
}