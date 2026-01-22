import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Teacher } from '../../../../../Interfaces/teacher';
import { Subscription } from 'rxjs';
import { TeacherService } from '../../../../../Services/teacher.service';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { AuthService } from '../../../../../Services/AuthService';
import { FormsModule } from '@angular/forms';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../../../Services/UtilServices/toast.service';

@Component({
  selector: 'app-admin-teacher-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-teacher-accounts.component.html',
  styleUrl: './admin-teacher-accounts.component.css'
})
export class AdminTeacherAccountsComponent implements OnInit, OnDestroy {

  subjectName = '';
  teachersBySubject: Teacher[] = [];
  allTeachers: Teacher[] = [];
  hasSearched = false;
  isLoading = false;

  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';

  private subscription = new Subscription();
  //Modal State
  isConfirmModalOpen: boolean = false;
  confirmModalMessage: string = '';
  private confirmAction?: () => void;

  constructor(
    private teacherService: TeacherService,
    private adminService: AdminManagementService,
    private authService: AuthService,
    private translate: TranslateService,
    private ToastService: ToastService
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

  // Updated getStatusName method to use translation
  getStatusName(status: string | AccountStatus): string {
    const accountStatus = this.convertToAccountStatus(status);

    switch (accountStatus) {
      case AccountStatus.Pending:
        return this.translate.instant('teachers.status.pending');
      case AccountStatus.Active:
        return this.translate.instant('teachers.status.active');
      case AccountStatus.Blocked:
        return this.translate.instant('teachers.status.blocked');
      case AccountStatus.Rejected:
        return this.translate.instant('teachers.status.rejected');
      default:
        return this.translate.instant('teachers.status.pending');
    }
  }

  // دالة للحصول على لون الحالة
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

  getStatusDisplayName(status: AccountStatus | 'all'): string {
    switch (status) {
      case 'all':
        return 'teachers.statusDisplay.all';
      case AccountStatus.Pending:
        return 'teachers.statusDisplay.pending';
      case AccountStatus.Active:
        return 'teachers.statusDisplay.active';
      case AccountStatus.Rejected:
        return 'teachers.statusDisplay.rejected';
      case AccountStatus.Blocked:
        return 'teachers.statusDisplay.blocked';
      default:
        return 'teachers.statusDisplay.all';
    }
  }

  //Load teachers by subject name
  LoadTeachersBySubjectName(): void {
    const subject = this.subjectName.trim();
    this.hasSearched = true;

    if (!subject) {
      alert(this.translate.instant('teachers.messages.enterSubject'));
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
          alert(`${this.translate.instant('teachers.messages.loadError')} ${subject}: ${err.message}`);
        }
      })
    );
  }

  //Approve Teacher
  async ApproveTeacherAction(teacherId: string): Promise<void> {
    this.openConfirm(this.translate.instant('teachers.confirmations.approve'), async () => {
      const adminUserId = this.authService.userId;
      if (!adminUserId) {
        this.ToastService.warning(this.translate.instant('teachers.messages.adminNotFound'));
        return;
      }

      this.subscription.add(
        this.adminService.ApproveAccount(teacherId, adminUserId, 'teacher').subscribe({
          next: result => {
            if (result) {
              this.ToastService.success(this.translate.instant('teachers.messages.approved'));
              // Update UI locally
              const teacher = this.allTeachers.find(t => t.id === teacherId);
              if (teacher) teacher.accountStatus = AccountStatus.Active;
            } else {
              this.ToastService.error(this.translate.instant('teachers.messages.approveFailed'));
            }
          },
          error: err => this.ToastService.error(`${this.translate.instant('teachers.messages.error')}: ${err.message}`)
        })
      );
    });
  }

  //reject-teacher
  async RejectTeacherAction(teacherId: string): Promise<void> {
    this.openConfirm(this.translate.instant('teachers.confirmations.reject'), async () => {
      const adminUserId = this.authService.userId;
      if (!adminUserId) {
        this.ToastService.warning(this.translate.instant('teachers.messages.adminNotFound'));
        return;
      }

      this.subscription.add(
        this.adminService.RejectAccount(teacherId, adminUserId, 'teacher').subscribe({
          next: result => {
            if (result) {
              this.ToastService.success(this.translate.instant('teachers.messages.rejected'));
              // Update UI locally
              const teacher = this.allTeachers.find(t => t.id === teacherId);
              if (teacher) teacher.accountStatus = AccountStatus.Rejected;
            }
            else {
              this.ToastService.error(this.translate.instant('teachers.messages.rejectFailed'));
            }
          },
          error: err => this.ToastService.error(`${this.translate.instant('teachers.messages.error')}: ${err.message}`)
        })
      );
    });

  }

  //Block teacher
  async BlockTeacherAction(teacherId: string): Promise<void> {
    this.openConfirm(this.translate.instant('teachers.confirmations.block'), async () => {
      const adminUserId = this.authService.userId;
      if (!adminUserId) {
        this.ToastService.warning(this.translate.instant('teachers.messages.adminNotFound'));
        return;
      }

      this.subscription.add(
        this.adminService.BlockAccount(teacherId, adminUserId, 'teacher').subscribe({
          next: result => {
            if (result) {
              this.ToastService.success(this.translate.instant('teachers.messages.blocked'));
              // Update UI locally
              const teacher = this.allTeachers.find(t => t.id === teacherId);
              if (teacher) teacher.accountStatus = AccountStatus.Blocked;
            }
            else {
              this.ToastService.error(this.translate.instant('teachers.messages.blockFailed'));
            }
          },
          error: err => this.ToastService.error(`${this.translate.instant('teachers.messages.error')}: ${err.message}`)
        })
      );
    });

  }

  //Unblock teacher
  async UnblockTeacherAction(teacherId: string): Promise<void> {
    this.openConfirm(this.translate.instant('teachers.confirmations.unblock'), async () => {
      const adminUserId = this.authService.userId;
      if (!adminUserId) {
        this.ToastService.warning(this.translate.instant('teachers.messages.adminNotFound'));
        return;
      }

      this.subscription.add(
        this.adminService.UnblockAccount(teacherId, adminUserId, 'teacher').subscribe({
          next: result => {
            if (result) {
              this.ToastService.success(this.translate.instant('teachers.messages.unblocked'));
              // Update UI locally
              const teacher = this.allTeachers.find(t => t.id === teacherId);
              if (teacher) teacher.accountStatus = AccountStatus.Active;
            }
            else {
              this.ToastService.error(this.translate.instant('teachers.messages.unblockFailed'));
            }
          },
          error: err => this.ToastService.error(`${this.translate.instant('teachers.messages.error')}: ${err.message}`)
        })
      );
    });
  }

  //Load all teachers
  private LoadAllTeachers(): void {
    this.isLoading = true;
    this.subscription.add(
      this.teacherService.GetAllTeachers().subscribe({
        next: teachers => {
          this.allTeachers = teachers;
          this.isLoading = false;
          console.log('All Teachers:', teachers);
        },
        error: err => {
          this.isLoading = false;
          alert(`${this.translate.instant('teachers.messages.loadError')}: ${err.message}`);
        }
      })
    );
  }
  //Modal  Methods
  openConfirm(message: string, action: () => Promise<void>): void {
    this.confirmModalMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  confirmYes(): void {
    this.confirmAction?.();
    this.closeConfirm();
  }

  closeConfirm(): void {
    this.isConfirmModalOpen = false;
    this.confirmModalMessage = '';
    this.confirmAction = undefined;
  }
}