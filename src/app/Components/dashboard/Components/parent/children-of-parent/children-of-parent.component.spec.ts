import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildrenOfParentComponent } from './children-of-parent.component';

describe('ChildrenOfParentComponent', () => {
  let component: ChildrenOfParentComponent;
  let fixture: ComponentFixture<ChildrenOfParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildrenOfParentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildrenOfParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
