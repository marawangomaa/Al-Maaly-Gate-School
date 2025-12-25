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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-parent-accounts',
  imports: [CommonModule, FormsModule, TranslateModule],
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
  relation: string = 'father'; // Changed default to 'father'
  isAssigning: boolean = false;
  hasPerformedSearch: boolean = false;

  private subscription = new Subscription();

  constructor(
    private _parentService: ParentService,
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.LoadAllParents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Add missing method: getStatusDisplayName
  getStatusDisplayName(status: AccountStatus | 'all'): string {
    switch (status) {
      case 'all':
        return 'parents.statusDisplay.all';
      case AccountStatus.Pending:
        return 'parents.statusDisplay.pending';
      case AccountStatus.Active:
        return 'parents.statusDisplay.active';
      case AccountStatus.Rejected:
        return 'parents.statusDisplay.rejected';
      case AccountStatus.Blocked:
        return 'parents.statusDisplay.blocked';
      default:
        return 'parents.statusDisplay.all';
    }
  }

  // Add missing method: openAssignModal
  openAssignModal(parentId: string, parentName: string): void {
    this.selectedParentIdForModal = parentId;
    this.selectedParentNameForModal = parentName;
    this.showAssignModal = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedStudent = null;
    this.relation = 'father';
    this.hasPerformedSearch = false;
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

  // Update getStatusName to use translation
  getStatusName(status: string | AccountStatus): string {
    const accountStatus = this.convertToAccountStatus(status);

    switch (accountStatus) {
      case AccountStatus.Pending:
        return this.translate.instant('parents.status.pending');
      case AccountStatus.Active:
        return this.translate.instant('parents.status.active');
      case AccountStatus.Blocked:
        return this.translate.instant('parents.status.blocked');
      case AccountStatus.Rejected:
        return this.translate.instant('parents.status.rejected');
      default:
        return this.translate.instant('parents.status.pending');
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

  // Updated ApproveParentAction to use modal instead of immediate approval
  ApproveParentAction(parentId: string): void {
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('parents.messages.adminNotFound'));
      return;
    }

    const parent = this.allparents.find(t => t.id === parentId);
    if (!parent) {
      alert(this.translate.instant('parents.messages.accountNotFound'));
      return;
    }

    // Open modal for student assignment
    this.openAssignModal(parentId, parent.fullName);
  }

  private approveParentAccountAfterAssignment(parentId: string): void {
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('parents.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.ApproveAccount(parentId, adminUserId, 'parent').subscribe({
        next: (result) => {
          if (result) {
            alert(this.translate.instant('parents.messages.approved'));
            // Update UI locally
            const parent = this.allparents.find(t => t.id === parentId);
            if (parent) {
              parent.accountStatus = AccountStatus.Active;
            }
          } else {
            alert(this.translate.instant('parents.messages.approveFailed'));
          }
        },
        error: (err) => {
          console.error('Approval error:', err);
          alert(`${this.translate.instant('parents.messages.error')}: ${err.message}`);
        }
      })
    );
  }

  searchStudentsInPopup(parentId: string): void {
    if (this.searchQuery.length < 2) {
      alert(this.translate.instant('parents.modal.minChars'));
      return;
    }

    this.isSearching = true;
    this.hasPerformedSearch = true;
    this.searchResults = [];

    this.subscription.add(
      this._StudentService.searchStudents(this.searchQuery, parentId).subscribe({
        next: (results: ApiResponse<istudentSearchResult[]>) => {
          console.log('Search results:', results);
          this.searchResults = results.data || [];
          this.isSearching = false;
        },
        error: (err) => {
          alert(`${this.translate.instant('parents.messages.error')}: ${err.message}`);
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
      alert(this.translate.instant('parents.messages.selectStudent'));
      return;
    }

    if (this.selectedStudent.isInRelation) {
      alert(this.translate.instant('parents.messages.alreadyAssigned'));
      return;
    }

    const confirmation = confirm(this.translate.instant('parents.confirmations.assignStudent'));
    if (!confirmation) return;

    this.isAssigning = true;

    this.subscription.add(
      this.adminService.ApproveParentWithStudent(this.selectedParentIdForModal, this.selectedStudent.id, this.relation).subscribe({
        next: result => {
          this.isAssigning = false;

          if (result.data) {
            alert(`${this.translate.instant('parents.messages.assignSuccess')}: ${this.selectedStudent.fullName}`);
            this.approveParentAccountAfterAssignment(this.selectedParentIdForModal);
            this.closeAssignModal();
          } else {
            alert(this.translate.instant('parents.messages.assignFailed'));
          }
        },
        error: err => {
          this.isAssigning = false;
          alert(`${this.translate.instant('parents.messages.error')}: ${err.message}`);
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
    this.relation = 'father';
    this.isSearching = false;
    this.isAssigning = false;
    this.hasPerformedSearch = false;
  }

  // Update RejectParentAction to use translation
  async RejectParentAction(parentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('parents.confirmations.reject'));
    if (!confirmation) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('parents.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.RejectAccount(parentId, adminUserId, 'parent').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('parents.messages.rejected'));
            // Update UI locally
            const parent = this.allparents.find(t => t.id === parentId);
            if (parent) parent.accountStatus = AccountStatus.Rejected;
          }
          else {
            alert(this.translate.instant('parents.messages.rejectFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('parents.messages.error')}: ${err.message}`)
      })
    );
  }

  // Update BlockParentAction to use translation
  async BlockParentAction(parentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('parents.confirmations.block'));
    if (!confirmation) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('parents.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.BlockAccount(parentId, adminUserId, 'parent').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('parents.messages.blocked'));
            // Update UI locally
            const parent = this.allparents.find(t => t.id === parentId);
            if (parent) parent.accountStatus = AccountStatus.Blocked;
          }
          else {
            alert(this.translate.instant('parents.messages.blockFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('parents.messages.error')}: ${err.message}`)
      })
    );
  }

  // Update UnblockParentAction to use translation
  async UnblockParentAction(parentId: string): Promise<void> {
    const confirmation = confirm(this.translate.instant('parents.confirmations.unblock'));
    if (!confirmation) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert(this.translate.instant('parents.messages.adminNotFound'));
      return;
    }

    this.subscription.add(
      this.adminService.UnblockAccount(parentId, adminUserId, 'parent').subscribe({
        next: result => {
          if (result) {
            alert(this.translate.instant('parents.messages.unblocked'));
            // Update UI locally
            const parent = this.allparents.find(t => t.id === parentId);
            if (parent) parent.accountStatus = AccountStatus.Active;
          }
          else {
            alert(this.translate.instant('parents.messages.unblockFailed'));
          }
        },
        error: err => alert(`${this.translate.instant('parents.messages.error')}: ${err.message}`)
      })
    );
  }

  private LoadAllParents(): void {
    this.isLoading = true;
    this.subscription.add(
      this._parentService.GetAllParents().subscribe({
        next: (response: ApiResponse<iparentViewDto[]>) => {
          this.allparents = response.data || [];
          this.isLoading = false;
          console.log('All Parents:', response.data);
        },
        error: err => {
          this.isLoading = false;
          alert(`${this.translate.instant('parents.messages.loadError')}: ${err.message}`);
        }
      })
    );
  }
}