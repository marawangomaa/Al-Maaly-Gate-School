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
        { path: 'overview', loadComponent: () => import('./Components/dashboard/Components/admin/overview/overview.component').then(m => m.OverviewComponent), title: 'Overview' },

        // Admin-only
        { path: 'teachers', loadComponent: () => import('./Components/dashboard/Components/admin/teachers/teachers.component').then(m => m.TeachersComponent), title: 'Teachers' },
        { path: 'classes', loadComponent: () => import('./Components/dashboard/Components/admin/teachers/classes/classes.component').then(m => m.ClassesComponent), title: 'Classes' },

        // Teacher-only
        { path: 'teacher-overview', loadComponent: () => import('./Components/dashboard/Components/teacher/overview/overview.component').then(m => m.OverviewComponent), title: 'Teacher Overview' },
        { path: 'create-class', loadComponent: () => import('./Components/dashboard/Components/teacher/class/creating-classes/creating-classes.component').then(m => m.CreatingClassesComponent), title: 'Creating Classes' },
        { path: 'class-list', loadComponent: () => import('./Components/dashboard/Components/teacher/class/class-list/class-list.component').then(m => m.ClassListComponent), title: 'Classes List' },
        { path: 'create-question', loadComponent: () => import('./Components/dashboard/Components/teacher/question-bank/create-question/create-question.component').then(m => m.CreateQuestionComponent), title: 'Creating Questions' },
        { path: 'question-list', loadComponent: () => import('./Components/dashboard/Components/teacher/question-bank/question-list/question-list.component').then(m => m.QuestionListComponent), title: 'Questions List' },
        { path: 'create-test', loadComponent: () => import('./Components/dashboard/Components/teacher/tests/create-test/create-test.component').then(m => m.CreateTestComponent), title: 'Creating Test' },
        { path: 'test-list', loadComponent: () => import('./Components/dashboard/Components/teacher/tests/test-list/test-list.component').then(m => m.TestListComponent), title: 'Tests List' },

        // Student-only
        { path: 'grades', loadComponent: () => import('./Components/dashboard/Components/student/student-grades/student-grades.component').then(m => m.StudentGradesComponent) },
        { path: 'classes', loadComponent: () => import('./Components/dashboard/Components/student/student-classes/student-classes.component').then(m => m.StudentClassesComponent) },
        { path: 'tests', loadComponent: () => import('./Components/dashboard/Components/student/student-tests/student-tests.component').then(m => m.StudentTestsComponent) },

        { path: '', redirectTo: 'overview', pathMatch: 'full' }
      ]
    },
    { path: 'profile', component: ProfileComponent }
  ]
}
,
  { path: '**', redirectTo: '' },
];

