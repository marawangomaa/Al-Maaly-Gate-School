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
  import { ExamComponent } from './Components/exam/exam.component';

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
        { path: 'exam/:id', component: ExamComponent },
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

            // Admin
            {
              path: 'admin-overview',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/overview/overview.component').then(m => m.OverviewComponent)
            },
            {
              path: 'admin-teachers',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/teachers/teachers.component').then(m => m.TeachersComponent)
            },
            {
              path: 'admin-all-classes',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/admin-all-classes/admin-all-classes.component').then(m => m.AdminAllClassesComponent)
            },
            {
              path: 'admin-all-student-tests-result',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/admin-all-student-tests-result/admin-all-student-tests-result.component').then(m => m.AdminAllStudentTestsResultComponent)
            },
            {
              path: 'admin-teachers-accounts',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/admin-teacher-accounts/admin-teacher-accounts.component').then(m => m.AdminTeacherAccountsComponent)
            },
            {
              path: 'admin-students-accounts',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/admin-student-accounts/admin-student-accounts.component').then(m => m.AdminStudentAccountsComponent)
            },
            {
              path: 'admin-analytics',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/analytics/analytics.component').then(m => m.AnalyticsComponent)
            },
            {
              path: 'admin-certfication-create',
              canActivate: [AdminGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/admin/admin-certificate-generation/admin-certificate-generation.component').then(m => m.AdminCertificateGenerationComponent)
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
              path: 'teacher-create-class',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/class/creating-classes/creating-classes.component')
                  .then(m => m.CreatingClassesComponent),
              title: 'Creating Classes'
            },
            {
              path: 'teacher-class-list',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/class/class-list/class-list.component')
                  .then(m => m.ClassListComponent),
              title: 'Classes List'
            },
            {
              path: 'teacher-create-question',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/question-bank/create-question/create-question.component')
                  .then(m => m.CreateQuestionComponent),
              title: 'Creating Questions'
            },
            {
              path: 'teacher-question-list',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/question-bank/question-list/question-list.component')
                  .then(m => m.QuestionListComponent),
              title: 'Questions List'
            },
            {
              path: 'teacher-create-test',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/tests/create-test/create-test.component')
                  .then(m => m.CreateTestComponent),
              title: 'Creating Test'
            },
            {
              path: 'teacher-test-list',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/tests/test-list/test-list.component')
                  .then(m => m.TestListComponent),
              title: 'Tests List'
            },
            {
              path: 'teacher-class-grades',
              canActivate: [TeacherGuard],
              data: { role: 'teacher' },
              loadComponent: () =>
                import('./Components/dashboard/Components/teacher/class-grades/class-grades.component')
                  .then(m => m.ClassGradesComponent),
              title: 'Class Grades'
            },

            // Student
            {
              path: 'grades',
              canActivate: [StudentGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/student/student-grades/student-grades.component').then(m => m.StudentGradesComponent)
            },
            {
              path: 'student-classes',
              canActivate: [StudentGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/student/student-classes/student-classes.component').then(m => m.StudentClassesComponent)
            },
            {
              path: 'student-tests',
              canActivate: [StudentGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/student/student-tests/student-tests.component').then(m => m.StudentTestsComponent)
            },
            {
              path: 'student-profile',
              canActivate: [StudentGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/student/studen-profile/studen-profile.component').then(m => m.StudenProfileComponent)
            },
            {
              path: 'student-grades',
              canActivate: [StudentGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/student/student-grades/student-grades.component').then(m => m.StudentGradesComponent)
            },
            {
              path: 'student-certfication',
              canActivate: [StudentGuard],
              loadComponent: () =>
                import('./Components/dashboard/Components/student/student-certificates/student-certificates.component').then(m => m.StudentCertificatesComponent)
            },

            { path: '', redirectTo: 'overview', pathMatch: 'full' }
          ]
        },

        { path: 'profile', component: ProfileComponent }
      ]
    },

    { path: '**', redirectTo: '' },

  ];
