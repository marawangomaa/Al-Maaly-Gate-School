import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Al-Maaly-Gate-School';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('ar');
  }
}