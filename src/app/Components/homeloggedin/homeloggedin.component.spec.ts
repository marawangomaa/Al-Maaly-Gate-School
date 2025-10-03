import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeloggedinComponent } from './homeloggedin.component';

describe('HomeloggedinComponent', () => {
  let component: HomeloggedinComponent;
  let fixture: ComponentFixture<HomeloggedinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeloggedinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeloggedinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
