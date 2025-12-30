import { Routes } from '@angular/router';
import { ProfileComponent } from './Components/profile/profile.component';
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
import { AccountStatusDisplayerComponent } from './Components/account-status-displayer/account-status-displayer.component';
import { accountStatusGuard } from './Guards/acount-status.guard';
import { ConfirmEmailComponent } from './Components/confirm-email/confirm-email.component';
import { GuestGuard } from './Guards/guest.guard';

export const routes: Routes = [

  // Visitor layout
  {
    path: '',
    component: VisitorComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home', component: HomeComponent,
        canActivate: [GuestGuard]
      },
      {
        path: 'login', component: LoginComponent,
        canActivate: [GuestGuard]
      },
      {
        path: 'register', component: RegisterComponent,
        canActivate: [GuestGuard]
      },
      {
        path: 'confirm-email',
        component: ConfirmEmailComponent,
        canActivate: [GuestGuard]
      }
    ]
  },

  // Logged in layout
  {
    path: 'app',
    component: LogedInComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeloggedinComponent },
      { path: 'exam/:id', component: ExamComponent },
      // Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [accountStatusGuard],
        children: [

          // Shared
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
              import('./Components/dashboard/Components/admin/overview/overview.component')
                .then(m => m.OverviewComponent)
          },
          {
            path: 'admin-all-classes',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-all-classes/admin-all-classes.component')
                .then(m => m.AdminAllClassesComponent)
          },
          {
            path: 'admin-all-student-tests-result',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-all-student-tests-result/admin-all-student-tests-result.component')
                .then(m => m.AdminAllStudentTestsResultComponent)
          },
          {
            path: 'admin-teachers-accounts',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-teacher-accounts/admin-teacher-accounts.component')
                .then(m => m.AdminTeacherAccountsComponent)
          },
          {
            path: 'admin-students-accounts',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-student-accounts/admin-student-accounts.component')
                .then(m => m.AdminStudentAccountsComponent)
          },
          {
            path: 'parent-management',
            canActivate: [AdminGuard],
            data: { role: 'parent' },
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/parent-management/parent-management.component')
                .then(m => m.ParentManagementComponent),
            title: 'Parent Management'
          },
          {
            path: 'admin-parents-accounts',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-parents-accounts/admin-parents-accounts.component')
                .then(m => m.AdminParentsAccountsComponent)
          },
          {
            path: 'admin-analytics',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/analytics/analytics.component')
                .then(m => m.AnalyticsComponent)
          },
          {
            path: 'admin-certfication-create',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-certificate-generation/admin-certificate-generation.component')
                .then(m => m.AdminCertificateGenerationComponent)
          },
          {
            path: 'admin-subject-management',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-subject-management/admin-subject-management.component')
                .then(m => m.AdminSubjectManagementComponent)
          },
          {
            path: 'admin-grade',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/admin-grades/admin-grades.component')
                .then(m => m.AdminGradesComponent)
          },
          {
            path: 'admin-curriculum',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/curriculum/curriculum.component')
                .then(m => m.CurriculumComponent)
          },
          {
            path: 'subject-component-types',
            canActivate: [AdminGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/admin/subject-component-types/subject-component-types.component')
                .then(m => m.SubjectComponentTypesComponent)
          },

          // Teacher
          {
            path: 'teacher-overview',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/overview/overview.component')
                .then(m => m.OverviewComponent)
          },
          {
            path: 'teacher-create-class',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/class/creating-classes/creating-classes.component')
                .then(m => m.CreatingClassesComponent)
          },
          {
            path: 'teacher-class-list',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/class/class-list/class-list.component')
                .then(m => m.ClassListComponent)
          },
          {
            path: 'teacher-create-question',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/question-bank/create-question/create-question.component')
                .then(m => m.CreateQuestionComponent)
          },
          {
            path: 'teacher-question-list',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/question-bank/question-list/question-list.component')
                .then(m => m.QuestionListComponent)
          },
          {
            path: 'teacher-create-test',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/tests/create-test/create-test.component')
                .then(m => m.CreateTestComponent)
          },
          {
            path: 'teacher-test-list',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/tests/test-list/test-list.component')
                .then(m => m.TestListComponent)
          },
          {
            path: 'teacher-class-grades',
            canActivate: [TeacherGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/teacher/class-grades/class-grades.component')
                .then(m => m.ClassGradesComponent)
          },

          // Parent
          {
            path: 'children-of-parent',
            loadComponent: () =>
              import('./Components/dashboard/Components/parent/children-of-parent/children-of-parent.component')
                .then(m => m.ChildrenOfParentComponent),
            title: 'children of parent'
          },
          {
            path: 'parent-overview',
            loadComponent: () =>
              import('./Components/dashboard/Components/parent/overview/overview.component')
                .then(m => m.OverviewComponent)
          },

          // Student
          {
            path: 'grades',
            canActivate: [StudentGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-grades/student-grades.component')
                .then(m => m.StudentGradesComponent)
          },
          {
            path: 'student-classes',
            canActivate: [StudentGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-classes/student-classes.component')
                .then(m => m.StudentClassesComponent)
          },
          {
            path: 'student-tests',
            canActivate: [StudentGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-tests/student-tests.component')
                .then(m => m.StudentTestsComponent)
          },
          {
            path: 'student-profile',
            canActivate: [StudentGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/student/overview/overview.component')
                .then(m => m.OverviewComponent)
          },
          {
            path: 'student-grades',
            canActivate: [StudentGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-grades/student-grades.component')
                .then(m => m.StudentGradesComponent)
          },
          {
            path: 'student-certfication',
            canActivate: [StudentGuard],
            loadComponent: () =>
              import('./Components/dashboard/Components/student/student-certificates/student-certificates.component')
                .then(m => m.StudentCertificatesComponent)
          }
        ]
      }, {
        path: 'account/status/:status',
        component: AccountStatusDisplayerComponent
      },

      { path: 'profile', component: ProfileComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
