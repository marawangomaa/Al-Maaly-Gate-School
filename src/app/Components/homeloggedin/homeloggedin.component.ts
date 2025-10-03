import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { HeroSectionComponent } from "./Components/hero-section/hero-section.component";
import { AboutComponent } from "./Components/about/about.component";
import { OurProgramsComponent } from "./Components/our-programs/our-programs.component";
import { CommunitySaysComponent } from "./Components/community-says/community-says.component";
import { AdmissionsComponent } from "./Components/admissions/admissions.component";
import { ContactUsComponent } from "./Components/contact-us/contact-us.component";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-homeloggedin',
  imports: [HeroSectionComponent, AboutComponent, OurProgramsComponent, CommunitySaysComponent, AdmissionsComponent, ContactUsComponent],
  templateUrl: './homeloggedin.component.html',
  styleUrl: './homeloggedin.component.css'
})
export class HomeloggedinComponent {
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
