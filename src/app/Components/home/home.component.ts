import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroSectionComponent } from "./Components/hero-section/hero-section.component";
import { AboutComponent } from "./Components/about/about.component";
import { OurProgramsComponent } from "./Components/our-programs/our-programs.component";
import { CommunitySaysComponent } from "./Components/community-says/community-says.component";
import { AdmissionsComponent } from "./Components/admissions/admissions.component";
import { ContactUsComponent } from "./Components/contact-us/contact-us.component";
import { OurPartnersComponent } from "./Components/our-partners/our-partners.component";
import { OurFeaturesComponent } from "./Components/our-features/our-features.component";
import { AccordionComponent } from "./Components/accordion/accordion.component";

@Component({
  selector: 'app-home',
  standalone: true, // This makes it standalone
  imports: [HeroSectionComponent, AboutComponent, OurProgramsComponent, CommunitySaysComponent, AdmissionsComponent, ContactUsComponent, OurPartnersComponent, OurFeaturesComponent, AccordionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // fixed "styleUrl" -> "styleUrls"
})
export class HomeComponent {
  username: string = 'User'; // default username
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Check if running in the browser before accessing localStorage
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        this.username = savedUsername;
      }
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('username');
    }
    this.username = 'User';
    alert('You have been logged out successfully.');
  }
}
