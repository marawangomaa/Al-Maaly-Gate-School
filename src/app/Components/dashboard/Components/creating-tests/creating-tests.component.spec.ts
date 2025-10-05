import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatingTestsComponent } from './creating-tests.component';

describe('CreatingTestsComponent', () => {
  let component: CreatingTestsComponent;
  let fixture: ComponentFixture<CreatingTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatingTestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatingTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
