import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCertificateGenerationComponent } from './admin-certificate-generation.component';

describe('AdminCertificateGenerationComponent', () => {
  let component: AdminCertificateGenerationComponent;
  let fixture: ComponentFixture<AdminCertificateGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCertificateGenerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCertificateGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
