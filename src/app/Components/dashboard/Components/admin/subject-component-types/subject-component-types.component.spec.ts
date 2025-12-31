import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectComponentTypesComponent } from './subject-component-types.component';

describe('SubjectComponentTypesComponent', () => {
  let component: SubjectComponentTypesComponent;
  let fixture: ComponentFixture<SubjectComponentTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectComponentTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectComponentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
