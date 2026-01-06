import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Services/AuthService';
import { ParentUploadDocsComponent } from '../dashboard/Components/parent/parent-upload-docs/parent-upload-docs.component';


@Component({
  selector: 'app-account-status-displayer',
  standalone: true,
  imports: [CommonModule, ParentUploadDocsComponent],
  templateUrl: './account-status-displayer.component.html',
  styleUrls: ['./account-status-displayer.component.css']
})
export class AccountStatusDisplayerComponent implements OnInit, OnDestroy {
  statusTitle = '';
  statusMessage = '';
  statusIcon = '';
  statusColorClass = '';
  additionalInfo = '';
  isParent: boolean = false;

  private routeData: any;
  private statusSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isParent = this.authService.isParent();
    this.routeData = window.history.state;

    this.route.paramMap.subscribe(params => {
      const statusParam = params.get('status');

      if (statusParam) {
        this.setStatusByParam(statusParam);
        return;
      }

      if (this.hasRouteData()) {
        this.initializeFromRouteData();
        return;
      }

      this.setUnknownStatus();
    });
  }

  private setStatusByParam(statusParam: string): void {
    switch (statusParam.toLowerCase()) {
      case 'pending':
        this.setPendingStatus();
        break;
      case 'blocked':
        this.setBlockedStatus();
        break;
      case 'rejected':
        this.setRejectedStatus();
        break;
      default:
        this.setUnknownStatus();
    }
  }

  private hasRouteData(): boolean {
    return !!(this.routeData?.message || this.routeData?.estimatedTime);
  }

  private initializeFromRouteData(): void {
    this.statusMessage = this.routeData.message || 'حالة غير معروفة';
    this.additionalInfo = this.routeData.estimatedTime || '';

    const currentRoute = this.router.url;
    this.setStatusByRoute(currentRoute);
  }

  private setStatusByRoute(route: string): void {
    if (route.includes('pending')) {
      this.setPendingStatus();
    } else if (route.includes('blocked')) {
      this.setBlockedStatus();
    } else if (route.includes('rejected')) {
      this.setRejectedStatus();
    } else {
      this.setUnknownStatus();
    }
  }

  private setPendingStatus(): void {
    this.statusTitle = 'حساب قيد المراجعة';
    this.statusIcon = 'bi bi-clock-history';
    this.statusColorClass = 'text-warning';
    this.statusMessage = this.routeData.message ||
      'حسابك قيد المراجعة والموافقة من قبل إدارة المدرسة.';
  }

  private setBlockedStatus(): void {
    this.statusTitle = 'حساب موقوف';
    this.statusIcon = 'bi bi-slash-circle';
    this.statusColorClass = 'text-danger';
    this.statusMessage = this.routeData.message ||
      'حسابك موقوف مؤقتاً. يرجى التواصل مع إدارة المدرسة لمعرفة السبب.';
  }

  private setRejectedStatus(): void {
    this.statusTitle = 'طلب مرفوض';
    this.statusIcon = 'bi bi-x-circle';
    this.statusColorClass = 'text-danger';
    this.statusMessage = this.routeData.message ||
      'تم رفض طلب التسجيل الخاص بك. يمكنك التواصل مع الإدارة لمعرفة السبب.';
  }

  private setUnknownStatus(): void {
    this.statusTitle = 'حالة غير معروفة';
    this.statusIcon = 'bi bi-question-circle';
    this.statusColorClass = 'text-info';
    this.statusMessage = this.routeData.message ||
      'حالة حسابك غير معروفة. يرجى التواصل مع الدعم الفني.';
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }
}