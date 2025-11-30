import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCertificatesComponent } from './student-certificates.component';

describe('StudentCertificatesComponent', () => {
  let component: StudentCertificatesComponent;
  let fixture: ComponentFixture<StudentCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCertificatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
