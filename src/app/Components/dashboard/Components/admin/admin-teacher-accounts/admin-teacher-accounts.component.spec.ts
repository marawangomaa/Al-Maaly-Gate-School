import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTeacherAccountsComponent } from './admin-teacher-accounts.component';

describe('AdminTeacherAccountsComponent', () => {
  let component: AdminTeacherAccountsComponent;
  let fixture: ComponentFixture<AdminTeacherAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTeacherAccountsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminTeacherAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
