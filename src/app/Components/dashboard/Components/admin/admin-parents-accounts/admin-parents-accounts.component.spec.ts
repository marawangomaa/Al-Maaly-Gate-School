import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminParentsAccountsComponent } from './admin-parents-accounts.component';

describe('AdminParentAccountsComponent', () => {
  let component: AdminParentsAccountsComponent;
  let fixture: ComponentFixture<AdminParentsAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminParentsAccountsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminParentsAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
