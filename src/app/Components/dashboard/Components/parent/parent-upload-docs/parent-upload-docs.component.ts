import { Component } from '@angular/core';
import { ParentService } from '../../../../../Services/parent.service';
import { ApiResponseHandler } from '../../../../../utils/api-response-handler';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-parent-upload-docs',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './parent-upload-docs.component.html',
  styleUrls: ['./parent-upload-docs.component.css']
})
export class ParentUploadDocsComponent {

  files: (File | null)[] = [null];
  isUploading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private parentService: ParentService) {}

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.files[index] = input.files[0];

    // IMPORTANT: allow re-selecting same file
    input.value = '';

    // Always keep ONE empty placeholder at the end
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
      this.errorMessage = 'Please select at least one file';
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
          this.successMessage = 'Files uploaded successfully';
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
