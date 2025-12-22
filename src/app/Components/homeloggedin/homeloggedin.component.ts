import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroSectionComponent } from '../home/Components/hero-section/hero-section.component';
import { AboutComponent } from '../home/Components/about/about.component';
import { OurProgramsComponent } from '../home/Components/our-programs/our-programs.component';
import { CommunitySaysComponent } from '../home/Components/community-says/community-says.component';
import { AdmissionsComponent } from '../home/Components/admissions/admissions.component';
import { ContactUsComponent } from '../home/Components/contact-us/contact-us.component';
import { AccordionComponent } from '../home/Components/accordion/accordion.component';
import { OurPartnersComponent } from '../home/Components/our-partners/our-partners.component';
import { OurFeaturesComponent } from '../home/Components/our-features/our-features.component';


@Component({
  selector: 'app-homeloggedin',
  imports: [HeroSectionComponent, AboutComponent, OurProgramsComponent, CommunitySaysComponent, AdmissionsComponent, ContactUsComponent, AccordionComponent, OurPartnersComponent, OurFeaturesComponent],
  templateUrl: './homeloggedin.component.html',
  styleUrl: './homeloggedin.component.css'
})
export class HomeloggedinComponent {
  username: string = 'User'; // default username
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

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
