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

@Component({
  selector: 'app-admin-student-accounts',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-student-accounts.component.html',
  styleUrl: './admin-student-accounts.component.css'
})
export class AdminStudentAccountsComponent implements OnInit, OnDestroy {
  allStudents: istudentProfile[] = [];
  isLoading: boolean = false;
  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';

  private subscription = new Subscription();

  constructor(
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.LoadAllStudents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Add missing method
  getStatusDisplayName(status: AccountStatus | 'all'): string {
    switch(status) {
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

  // Updated to use translation
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

  // Updated to use translation
  async ApproveStudentAction(studentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('students.confirmations.approve'));
    if (!confirmation) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('students.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.ApproveAccount(studentId, adminUserId, 'student').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('students.messages.approved'));
            // Update UI locally
            const student = this.allStudents.find(t => t.id === studentId);
            if (student) student.accountStatus = AccountStatus.Active;
          } else {
            alert(this.translate.instant('students.messages.approveFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('students.messages.error')}: ${err.message}`)
      })
    );
  }

  // Updated to use translation
  async RejectStudentAction(studentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('students.confirmations.reject'));
    if (!confirmation) return;
    
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
            // Update UI locally
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

  // Updated to use translation
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
            // Update UI locally
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

  // Updated to use translation
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
            // Update UI locally
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
          this.allStudents = response.data || [];
          this.isLoading = false;
          console.log('All Students:', response.data);
        },
        error: err => {
          this.isLoading = false;
          alert(`${this.translate.instant('students.messages.loadError')}: ${err.message}`);
        }
      })
    );
  }
  getDisplayValue(value: any, defaultValue: string = ''): string {
  return value || defaultValue;
}
}