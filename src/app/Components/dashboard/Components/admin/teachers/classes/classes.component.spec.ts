import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAllClassesComponent } from './admin-all-classes.component';

describe('AdminAllClassesComponent', () => {
  let component: AdminAllClassesComponent;
  let fixture: ComponentFixture<AdminAllClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAllClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAllClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
