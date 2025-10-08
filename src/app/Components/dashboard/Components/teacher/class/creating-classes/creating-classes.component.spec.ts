import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatingClassesComponent } from './creating-classes.component';

describe('CreatingClassesComponent', () => {
  let component: CreatingClassesComponent;
  let fixture: ComponentFixture<CreatingClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatingClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatingClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
