import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardNavComponent } from "./Components/dashboard-nav/dashboard-nav.component";

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, DashboardNavComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
