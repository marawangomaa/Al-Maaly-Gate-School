import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogedInComponent } from './loged-in.component';

describe('LogedInComponent', () => {
  let component: LogedInComponent;
  let fixture: ComponentFixture<LogedInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogedInComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogedInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
