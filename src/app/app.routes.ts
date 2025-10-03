import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LogedInComponent } from './LayOut/loged-in/loged-in.component';
import { VisitorComponent } from './LayOut/visitor/visitor.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LoginComponent } from './Components/login/login.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { RegisterComponent } from './Components/register/register.component';
import { HomeloggedinComponent } from './Components/homeloggedin/homeloggedin.component';

export const routes: Routes = [
  {
  path: '',
  component: VisitorComponent,
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
  ]
},
{
  path: 'app',
  component: LogedInComponent,
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeloggedinComponent },
    {
      path: 'dashboard',
      component: DashboardComponent,
      children: [
        { path: 'overview', loadComponent: () => import('./Components/dashboard/Components/overview/overview.component').then(m => m.OverviewComponent) },
        { path: 'analytics', loadComponent: () => import('./Components/dashboard/Components/analytics/analytics.component').then(m => m.AnalyticsComponent) },
        { path: 'settings', loadComponent: () => import('./Components/dashboard/Components/settings/settings.component').then(m => m.SettingsComponent) },
        { path: '', redirectTo: 'overview', pathMatch: 'full' }
      ]
    },
    { path: 'profile', component: ProfileComponent }
  ]
}
,
  { path: '**', redirectTo: '' },
];

