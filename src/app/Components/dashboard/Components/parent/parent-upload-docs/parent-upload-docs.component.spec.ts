import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentUploadDocsComponent } from './parent-upload-docs.component';

describe('ParentUploadDocsComponent', () => {
  let component: ParentUploadDocsComponent;
  let fixture: ComponentFixture<ParentUploadDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentUploadDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentUploadDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
