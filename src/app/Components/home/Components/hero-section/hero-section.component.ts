import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-hero-section',
  imports: [TranslateModule, TranslatePipe],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent implements OnInit {
  translate = inject(TranslateService);
  constructor() { }

  ngOnInit(): void {
  }
}
