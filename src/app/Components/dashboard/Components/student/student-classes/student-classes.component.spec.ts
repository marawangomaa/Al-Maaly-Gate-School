import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentClassesComponent } from './student-classes.component';

describe('StudentClassesComponent', () => {
  let component: StudentClassesComponent;
  let fixture: ComponentFixture<StudentClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
