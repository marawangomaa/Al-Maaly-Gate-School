import { Component } from '@angular/core';
import { ParentService } from '../../../../../Services/parent.service';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-parent-upload-docs',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule],
  templateUrl: './parent-upload-docs.component.html',
  styleUrls: ['./parent-upload-docs.component.css']
})
export class ParentUploadDocsComponent {
  files: (File | null)[] = [null];
  isUploading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private parentService: ParentService,
    private translate: TranslateService
  ) { }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // ✅ PDF ONLY
    if (file.type !== 'application/pdf') {
      this.errorMessage = this.translate.instant('PARENT_UPLOAD_DOCS_TS.ERRORS.ONLY_PDF');
      input.value = '';
      return;
    }

    this.files[index] = file;

    // Allow re-selecting same file
    input.value = '';

    // Keep ONE empty placeholder
    if (index === this.files.length - 1) {
      this.files.push(null);
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);

    // Ensure one empty placeholder exists
    if (!this.files.includes(null)) {
      this.files.push(null);
    }
  }

  upload(): void {
    const selectedFiles = this.files.filter(f => f !== null) as File[];

    if (selectedFiles.length === 0) {
      this.errorMessage = this.translate.instant('PARENT_UPLOAD_DOCS_TS.ERRORS.NO_FILES_SELECTED');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    this.isUploading = true;
    this.errorMessage = null;
    this.successMessage = null;

    ApiResponseHandler
      .handleApiResponse(
        this.parentService.uploadParentDocs(formData)
      )
      .subscribe({
        next: () => {
          this.successMessage = this.translate.instant('PARENT_UPLOAD_DOCS.FILES_UPLOAD_SUCCESS');
          this.files = [null];
        },
        error: err => {
          this.errorMessage = err.message;
        },
        complete: () => {
          this.isUploading = false;
        }
      });
  }

  get hasSelectedFiles(): boolean {
    return this.files.some(f => f !== null);
  }
}