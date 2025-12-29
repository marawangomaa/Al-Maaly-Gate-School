import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationStatusComponent } from './confirmation-status.component';

describe('ConfirmationStatusComponent', () => {
  let component: ConfirmationStatusComponent;
  let fixture: ComponentFixture<ConfirmationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
