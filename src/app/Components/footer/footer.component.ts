import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../Services/theme.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      v => (this.isDarkMode = v)
    );
  }

  openWhatsApp(): void {
    const phone = '201140106990';
    window.open(`https://wa.me/${phone}`, '_blank');
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }
}
