import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LogedInComponent } from './LayOut/loged-in/loged-in.component';
import { VisitorComponent } from './LayOut/visitor/visitor.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LoginComponent } from './Components/login/login.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { RegisterComponent } from './Components/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: VisitorComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'app',
    component: LogedInComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

