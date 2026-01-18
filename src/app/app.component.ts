import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from './Services/UtilServices/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Al-Maaly-Gate-School';

  constructor(private translate: TranslateService, private toastService: ToastService) {
    // Set default language
    this.translate.setDefaultLang('en');
    // Use Arabic as initial language
    this.translate.use('ar');
  }

  ngOnInit() {
    this.toastService.info();
    this.toastService.success();
    this.toastService.warning();
    this.toastService.error();
  }

  ngOnDestroy() {
  }
}