import { Component } from '@angular/core';
import { NavBarComponent } from "../../Components/nav-bar/nav-bar.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../Components/footer/footer.component";

@Component({
  selector: 'app-loged-in',
  imports: [NavBarComponent, RouterOutlet, FooterComponent],
  templateUrl: './loged-in.component.html',
  styleUrl: './loged-in.component.css'
})
export class LogedInComponent {

}
