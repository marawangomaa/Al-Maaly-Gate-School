import { Component } from '@angular/core';
import { NavBarComponent } from "../../Components/nav-bar/nav-bar.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../Components/footer/footer.component";

@Component({
  selector: 'app-visitor',
  imports: [NavBarComponent, RouterOutlet, FooterComponent],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.css'
})
export class VisitorComponent {

}
