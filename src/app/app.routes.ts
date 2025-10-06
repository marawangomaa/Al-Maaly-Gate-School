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
          // Shared
          { path: 'overview', loadComponent: () => import('./Components/dashboard/Components/overview/overview.component').then(m => m.OverviewComponent) },
          { path: 'settings', loadComponent: () => import('./Components/dashboard/Components/settings/settings.component').then(m => m.SettingsComponent) },

          // Admin-only
          { path: 'teachers', loadComponent: () => import('./Components/dashboard/Components/teachers/teachers.component').then(m => m.TeachersComponent) },
          { path: 'classes', loadComponent: () => import('./Components/dashboard/Components/classes/classes.component').then(m => m.ClassesComponent) },

          // Teacher-only
          { path: 'tests', loadComponent: () => import('./Components/dashboard/Components/creating-tests/creating-tests.component').then(m => m.CreatingTestsComponent) },
          { path: 'classes', loadComponent: () => import('./Components/dashboard/Components/classes/classes.component').then(m => m.ClassesComponent) },

          // Student-only
          { path: 'grades', loadComponent: () => import('./Components/dashboard/Components/student-grades/student-grades.component').then(m => m.StudentGradesComponent) },
          { path: 'student-classes', loadComponent: () => import('./Components/dashboard/Components/student-classes/student-classes.component').then(m => m.StudentClassesComponent) },
          { path: 'student-tests', loadComponent: () => import('./Components/dashboard/Components/student-tests/student-tests.component').then(m => m.StudentTestsComponent) },
          { path: 'profile', loadComponent: () => import('./Components/dashboard/Components/studen-profile/studen-profile.component').then(m => m.StudenProfileComponent) },

          { path: '', redirectTo: 'overview', pathMatch: 'full' }
        ]
      },
      { path: 'profile', component: ProfileComponent }
    ]
  }
  ,
  { path: '**', redirectTo: '' },
];

