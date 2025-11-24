import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSubjectManagementComponent } from './admin-subject-management.component';

describe('AdminSubjectManagementComponent', () => {
  let component: AdminSubjectManagementComponent;
  let fixture: ComponentFixture<AdminSubjectManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSubjectManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSubjectManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
