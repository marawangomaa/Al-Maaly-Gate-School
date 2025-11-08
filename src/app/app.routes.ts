import { Routes } from '@angular/router';
import { ProfileComponent } from './Components/profile/profile.component';
import { RoleGuard } from './Guards/role-guard.guard';
import { VisitorComponent } from './LayOut/visitor/visitor.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { LogedInComponent } from './LayOut/loged-in/loged-in.component';
import { HomeloggedinComponent } from './Components/homeloggedin/homeloggedin.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AdminGuard } from './Guards/admin.guard';
import { TeacherGuard } from './Guards/teacher.guard';
import { StudentGuard } from './Guards/student.guard';

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

          // ✅ Shared
          {
            path: 'overview',
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/overview/overview.component')
                .then(m => m.OverviewComponent),
            title: 'Overview'
          },

          // ✅ Admin-only
          {
            path: 'teachers',
            canActivate: [AdminGuard],
            data: { role: 'admin' },
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/teachers/teachers.component')
                .then(m => m.TeachersComponent),
            title: 'Teachers'
          },
          {
            path: 'classes',
            canActivate: [AdminGuard],
            data: { role: 'admin' },
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/teachers/classes/classes.component')
                .then(m => m.ClassesComponent),
            title: 'Classes'
          },

          // ✅ Teacher-only
          {
            path: 'teacher-overview',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/overview/overview.component')
                .then(m => m.OverviewComponent),
            title: 'Teacher Overview'
          },
          {
            path: 'create-class',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/class/creating-classes/creating-classes.component')
                .then(m => m.CreatingClassesComponent),
            title: 'Creating Classes'
          },
          {
            path: 'class-list',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/class/class-list/class-list.component')
                .then(m => m.ClassListComponent),
            title: 'Classes List'
          },
          {
            path: 'create-question',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/question-bank/create-question/create-question.component')
                .then(m => m.CreateQuestionComponent),
            title: 'Creating Questions'
          },
          {
            path: 'question-list',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/question-bank/question-list/question-list.component')
                .then(m => m.QuestionListComponent),
            title: 'Questions List'
          },
          {
            path: 'create-test',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/tests/create-test/create-test.component')
                .then(m => m.CreateTestComponent),
            title: 'Creating Test'
          },
          {
            path: 'test-list',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/tests/test-list/test-list.component')
                .then(m => m.TestListComponent),
            title: 'Tests List'
          },
          {
            path: 'class-grades',
            canActivate: [TeacherGuard],
            data: { role: 'teacher' },
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/class-grades/class-grades.component')
                .then(m => m.ClassGradesComponent),
            title: 'Class Grades'
          },

          // ✅ Student-only
          {
            path: 'grades',
            canActivate: [StudentGuard],
            data: { role: 'student' },
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-grades/student-grades.component')
                .then(m => m.StudentGradesComponent)
          },
          {
            path: 'classes',
            canActivate: [StudentGuard],
            data: { role: 'student' },
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-classes/student-classes.component')
                .then(m => m.StudentClassesComponent)
          },
          {
            path: 'tests',
            canActivate: [StudentGuard],
            data: { role: 'student' },
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-tests/student-tests.component')
                .then(m => m.StudentTestsComponent)
          },

          { path: '', redirectTo: 'overview', pathMatch: 'full' }
        ]
      },

      { path: 'profile', component: ProfileComponent }
    ]
  },

  { path: '**', redirectTo: '' },

];
