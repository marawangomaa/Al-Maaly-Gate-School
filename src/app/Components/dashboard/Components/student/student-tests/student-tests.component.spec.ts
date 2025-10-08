import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTestsComponent } from './student-tests.component';

describe('StudentTestsComponent', () => {
  let component: StudentTestsComponent;
  let fixture: ComponentFixture<StudentTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentTestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
