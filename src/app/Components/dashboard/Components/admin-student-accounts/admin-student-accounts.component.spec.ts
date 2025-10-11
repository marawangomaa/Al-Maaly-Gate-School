import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStudentAccountsComponent } from './admin-student-accounts.component';

describe('AdminStudentAccountsComponent', () => {
  let component: AdminStudentAccountsComponent;
  let fixture: ComponentFixture<AdminStudentAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStudentAccountsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminStudentAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
