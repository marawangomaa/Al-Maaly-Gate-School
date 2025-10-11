import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAllStudentTestsResultComponent } from './admin-all-student-tests-result.component';

describe('AdminAllStudentTestsResultComponent', () => {
  let component: AdminAllStudentTestsResultComponent;
  let fixture: ComponentFixture<AdminAllStudentTestsResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAllStudentTestsResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAllStudentTestsResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
