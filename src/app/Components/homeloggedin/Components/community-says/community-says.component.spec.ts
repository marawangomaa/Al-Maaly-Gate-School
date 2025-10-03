import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitySaysComponent } from './community-says.component';

describe('CommunitySaysComponent', () => {
  let component: CommunitySaysComponent;
  let fixture: ComponentFixture<CommunitySaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunitySaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunitySaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
