import { Component } from '@angular/core';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { AuthService } from '../../../../../Services/AuthService';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { CommonModule } from '@angular/common';
import { ParentService } from '../../../../../Services/parent.service';
import { iparentViewDto } from '../../../../../Interfaces/iparentViewDto';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../../Services/student.service';
import { istudentSearchResult } from '../../../../../Interfaces/istudentSearchResult';

@Component({
  selector: 'app-admin-parent-accounts',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-parents-accounts.component.html',
  styleUrl: './admin-parents-accounts.component.css'
})
export class AdminParentsAccountsComponent {
  allparents: iparentViewDto[] = [];
  isLoading: boolean = false;
  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';
  showAssignModal: boolean = false;
  selectedParentIdForModal: string = '';
  selectedParentNameForModal: string = '';
  searchQuery: string = '';
  searchResults: istudentSearchResult[] = [];
  isSearching: boolean = false;
  selectedStudent: any = null;
  relation: string = 'Parent';
  isAssigning: boolean = false;
  hasPerformedSearch: boolean = false;

  private subscription = new Subscription();

  constructor(
    private _parentService: ParentService,
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.LoadAllParents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filteredParents() {
    if (this.selectedStatus === 'all') return this.allparents;

    return this.allparents.filter(t =>
      this.convertToAccountStatus(t.accountStatus) === this.selectedStatus
    );
  }

  isParentPending(Parent: iparentViewDto): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Pending;
  }

  isParentRejected(Parent: iparentViewDto): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Rejected;
  }

  isParentActive(Parent: iparentViewDto): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Active;
  }

  isParentBlocked(Parent: iparentViewDto): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Blocked;
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

  ApproveParentAction(ParentId: string): void {

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    const parent = this.allparents.find(t => t.id === ParentId);
    if (!parent) {
      alert('لم يتم العثور على الحساب');
      return;
    }

    this.selectedParentIdForModal = ParentId;
    this.selectedParentNameForModal = parent.fullName;
    this.showAssignModal = true;

  }

  private approveParentAccountAfterAssignment(parentId: string): void {
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.subscription.add(
      this.adminService.ApproveAccount(parentId, adminUserId, 'parent').subscribe({
        next: (result) => {
          if (result) {
            alert('✅ تمت الموافقة على الحساب بنجاح');
            // Update UI locally
            const parent = this.allparents.find(t => t.id === parentId);
            if (parent) {
              parent.accountStatus = AccountStatus.Active;
            }
          } else {
            alert('❌ فشل في الموافقة على الحساب');
          }
        },
        error: (err) => {
          console.error('Approval error:', err);
          alert(`❌ خطأ في الموافقة على الحساب: ${err.message}`);
        }
      })
    );
  }

  searchStudentsInPopup(): void {
    if (this.searchQuery.length < 2) {
      alert('يرجى كتابة حرفين على الأقل للبحث');
      return;
    }

    this.isSearching = true;
    this.hasPerformedSearch = true;
    this.searchResults = [];

    this.subscription.add(
      this._StudentService.searchStudents(this.searchQuery).subscribe({
        next: (results: ApiResponse<istudentSearchResult[]>) => {
          console.log('نتائج البحث عن الطلاب:', results);
          this.searchResults = results.data || [];
          this.isSearching = false;
        },
        error: (err) => {
          alert(`خطأ في البحث: ${err.message}`);
          this.isSearching = false;
          this.searchResults = [];
        }
      })
    );
  }

  selectStudentInPopup(student: any): void {
    this.selectedStudent = student;
  }

  assignStudentToParentInPopup(): void {
    if (!this.selectedStudent) {
      alert('يرجى اختيار طالب');
      return;
    }

    this.isAssigning = true;

    this.subscription.add(
      this.adminService.assignStudentToParent(this.selectedParentIdForModal, this.selectedStudent.id, this.relation).subscribe({
        next: result => {
          this.isAssigning = false;

          if (result.data) {
            alert(`تم تعيين الطالب ${this.selectedStudent.fullName} بنجاح`);
            this.approveParentAccountAfterAssignment(this.selectedParentIdForModal);
            this.closeAssignModal();
          } else {
            alert('فشل في تعيين الطالب');
          }
        },
        error: err => {
          this.isAssigning = false;
          alert(`خطأ في تعيين الطالب: ${err.message}`);
        }
      })
    );
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedParentIdForModal = '';
    this.selectedParentNameForModal = '';
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedStudent = null;
    this.relation = 'Parent';
    this.isSearching = false;
    this.isAssigning = false;
  }

  RejectParentAction(ParentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في رفض هذا الحساب')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    this.subscription.add(
      this.adminService.RejectAccount(ParentId, adminUserId, 'parent').subscribe({
        next: result => {
          if (result) {
            alert('تم رفض الحساب بنجاح');
            // Update UI locally
            const parent = this.allparents.find(t => t.id === ParentId);
            if (parent) parent.accountStatus = AccountStatus.Rejected;
          }
          else {
            alert('فشل في رفض الحساب');
          }
        },
        error: err => alert(`خطأ في رفض الحساب: ${err.message}`)
      })
    );
  }

  BlockParentAction(ParentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في حظر هذا الحساب')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    this.subscription.add(
      this.adminService.BlockAccount(ParentId, adminUserId, 'parent').subscribe({
        next: result => {
          if (result) {
            alert('تم حظر الحساب بنجاح');
            // Update UI locally
            const parent = this.allparents.find(t => t.id === ParentId);
            if (parent) parent.accountStatus = AccountStatus.Blocked;
          }
          else {
            alert('فشل في حظر الحساب');
          }
        },
        error: err => alert(`خطأ في حظر الحساب: ${err.message}`)
      })
    );
  }

  UnblockParentAction(ParentId: string): void {
    if (!confirm('هل أنت متأكد من رغبتك في فك حظر هذا الحساب')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('لم يتم العثور على معرف مسؤول. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    this.subscription.add(
      this.adminService.UnblockAccount(ParentId, adminUserId, 'parent').subscribe({
        next: result => {
          if (result) {
            alert('تم فك حظر الحساب بنجاح');
            // Update UI locally
            const parent = this.allparents.find(t => t.id === ParentId);
            if (parent) parent.accountStatus = AccountStatus.Active;
          }
          else {
            alert('فشل في فك حظر الحساب');
          }
        },
        error: err => alert(`خطأ في فك حظر الحساب: ${err.message}`)
      })
    );
  }

  private LoadAllParents(): void {
    this.subscription.add(
      this._parentService.GetAllParents().subscribe({
        next: (response: ApiResponse<iparentViewDto[]>) => {
          this.allparents = response.data;
          console.log('All Parents:', response.data);
        },
        error: err => alert(`خطأ في تحميل جميع الحسابات: ${err.message}`)
      })
    );
  }
}
