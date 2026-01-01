import { Component } from '@angular/core';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { AuthService } from '../../../../../Services/AuthService';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { CommonModule } from '@angular/common';
import { ParentService } from '../../../../../Services/parent.service';
import { iparentViewDto, iparentViewDtoWithDocs } from '../../../../../Interfaces/iparentViewDto';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../../Services/student.service';
import { istudentSearchResult } from '../../../../../Interfaces/istudentSearchResult';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../environments/environment';
import { ifileRecord } from '../../../../../Interfaces/ifileRecord';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-parent-accounts',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-parents-accounts.component.html',
  styleUrl: './admin-parents-accounts.component.css'
})
export class AdminParentsAccountsComponent {
  allparents: iparentViewDtoWithDocs[] = [];
  isLoading: boolean = false;
  accountStatusEnum = AccountStatus;
  selectedStatus: AccountStatus | 'all' = 'all';
  showAssignModal: boolean = false;
  showDocsModal: boolean = false; // New modal for documents
  selectedParentIdForModal: string = '';
  selectedParentNameForModal: string = '';
  searchQuery: string = '';
  searchResults: istudentSearchResult[] = [];
  isSearching: boolean = false;
  selectedStudent: any = null;
  gender: string = '';
  relation: string = '';
  isAssigning: boolean = false;
  hasPerformedSearch: boolean = false;

  // New properties for documents modal
  parentDocuments: ifileRecord[] = [];
  isLoadingDocs: boolean = false;
  currentDocIndex: number = 0;
  currentPdfUrl: SafeResourceUrl | null = null;
  showPdfViewer: boolean = false;

  private subscription = new Subscription();

  constructor(
    private _parentService: ParentService,
    private _StudentService: StudentService,
    private adminService: AdminManagementService,
    private authService: AuthService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer // Added for safe URL sanitization
  ) { }

  ngOnInit(): void {
    this.LoadAllParents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Updated GetParentDocs to open modal instead of opening in new tabs
  async GetParentDocs(parentAppUserId: string | undefined): Promise<void> {
    if (!parentAppUserId) {
      alert(this.translate.instant('parents.messages.noUserId'));
      return;
    }

    this.isLoadingDocs = true;
    this.parentDocuments = [];
    this.currentDocIndex = 0;
    this.showPdfViewer = false;

    // Find parent details
    const parent = this.allparents.find(p => p.appUserId === parentAppUserId);
    if (parent) {
      this.selectedParentIdForModal = parent.id;
      this.selectedParentNameForModal = parent.fullName;
    }

    this.subscription.add(
      this.adminService.GetParentPdfDocs(parentAppUserId).subscribe({
        next: (result: ApiResponse<ifileRecord[]>) => {
          if (result && result.data && result.data.length > 0) {
            this.parentDocuments = result.data;
            this.showDocsModal = true;

            // Load first document automatically
            if (this.parentDocuments.length > 0) {
              this.loadPdfDocument(0);
            }
          } else {
            alert(this.translate.instant('parents.messages.noDocs'));
          }
          this.isLoadingDocs = false;
        },
        error: (error: ApiResponse<ifileRecord[]>) => {
          alert(`${this.translate.instant('parents.messages.error')}: ${error.message}`);
          this.isLoadingDocs = false;
        }
      })
    );
  }

  // Load PDF document by index
  loadPdfDocument(index: number): void {
    if (index >= 0 && index < this.parentDocuments.length) {
      this.currentDocIndex = index;
      const doc = this.parentDocuments[index];
      const url = environment.baseUrl;
      const fileUrl = `${url}/${doc.relativePath}`;

      // Sanitize the URL for security
      this.currentPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
      this.showPdfViewer = true;
    }
  }

  // Navigate to next document
  nextDocument(): void {
    if (this.currentDocIndex < this.parentDocuments.length - 1) {
      this.loadPdfDocument(this.currentDocIndex + 1);
    }
  }

  // Navigate to previous document
  previousDocument(): void {
    if (this.currentDocIndex > 0) {
      this.loadPdfDocument(this.currentDocIndex - 1);
    }
  }

  // Get file name from path
  getFileName(path: string | undefined): string {
    if (!path) return 'Document';
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || 'Document';
  }

  // Get file icon based on type
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return 'fa-file-pdf';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'fa-file-image';
      case 'doc': case 'docx': return 'fa-file-word';
      default: return 'fa-file';
    }
  }

  // Close documents modal
  closeDocsModal(): void {
    this.showDocsModal = false;
    this.parentDocuments = [];
    this.currentPdfUrl = null;
    this.showPdfViewer = false;
    this.currentDocIndex = 0;
  }

  // Download current document
  downloadCurrentDocument(): void {
    if (this.parentDocuments.length > 0 && this.currentDocIndex < this.parentDocuments.length) {
      const doc = this.parentDocuments[this.currentDocIndex];
      const url = environment.baseUrl;
      const fileUrl = `${url}/${doc.relativePath}`;

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = this.getFileName(doc.relativePath);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

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

  openAssignModal(parentId: string, parentName: string, gender: string): void {
    this.selectedParentIdForModal = parentId;
    this.selectedParentNameForModal = parentName;
    this.showAssignModal = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedStudent = null;
    this.gender = gender;
    this.hasPerformedSearch = false;
  }

  filteredParents() {
    if (this.selectedStatus === 'all') return this.allparents;

    return this.allparents.filter(t =>
      this.convertToAccountStatus(t.accountStatus) === this.selectedStatus
    );
  }

  isParentPending(Parent: iparentViewDtoWithDocs): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Pending;
  }

  isParentRejected(Parent: iparentViewDtoWithDocs): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Rejected;
  }

  isParentActive(Parent: iparentViewDtoWithDocs): boolean {
    return this.convertToAccountStatus(Parent.accountStatus) === AccountStatus.Active;
  }

  isParentBlocked(Parent: iparentViewDtoWithDocs): boolean {
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





    this.openAssignModal(parentId, parent.fullName, parent.gender);
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
    this.gender = '';
    this.isSearching = false;
    this.isAssigning = false;
    this.hasPerformedSearch = false;
  }

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
        next: (response: ApiResponse<iparentViewDtoWithDocs[]>) => {
          this.allparents = response.data || [];
          // Optionally calculate docCount for each parent if your backend doesn't provide it
          // this.allparents.forEach(parent => {
          //   parent.docCount = Math.floor(Math.random() * 5); // For demo only, remove in production
          // });
          this.isLoading = false;
        },
        error: err => {
          this.isLoading = false;
          alert(`${this.translate.instant('parents.messages.loadError')}: ${err.message}`);
        }
      })
    );
  }
}