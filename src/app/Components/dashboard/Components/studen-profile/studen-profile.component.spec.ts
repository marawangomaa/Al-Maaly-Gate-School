import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudenProfileComponent } from './studen-profile.component';

describe('StudenProfileComponent', () => {
  let component: StudenProfileComponent;
  let fixture: ComponentFixture<StudenProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudenProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudenProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
