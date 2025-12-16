import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiResponse, AuthResponse, RegisterRequest } from '../../Interfaces/auth';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ParentRegistrationResponse } from "../../Interfaces/ParentRegistrationResponse";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  selectedFiles: File[] = [];
  fileError = '';
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        userName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        contactInfo: ['', [Validators.minLength(10)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: ['', Validators.required],
        relation: [''],
      },
      { validators: this.matchPasswordValidator }
    );

    // Watch for role changes
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'parent') {
        this.registerForm.get('relation')?.setValidators([Validators.required]);
      } else {
        this.registerForm.get('relation')?.clearValidators();
        this.selectedFiles = [];
        this.fileError = '';
      }
      this.registerForm.get('relation')?.updateValueAndValidity();
    });
  }

  // ✅ Custom validator: make sure password === confirmPassword
  matchPasswordValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    if (password !== confirm) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  // ✅ Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);

    // Check total files won't exceed 3
    if (this.selectedFiles.length + newFiles.length > 3) {
      this.fileError = this.translate.instant('REGISTER.FILE_MAX_LIMIT');
      input.value = ''; // Clear file input
      return;
    }

    // Validate each file
    for (const file of newFiles) {
      // Check file type
      if (!this.allowedFileTypes.includes(file.type)) {
        this.fileError = this.translate.instant('REGISTER.FILE_INVALID_TYPE', { fileName: file.name });
        input.value = ''; // Clear file input
        return;
      }

      // Check file size
      if (file.size > this.maxFileSize) {
        this.fileError = this.translate.instant('REGISTER.FILE_TOO_LARGE', { fileName: file.name });
        input.value = ''; // Clear file input
        return;
      }
    }

    // Add valid files
    this.selectedFiles.push(...newFiles);
    this.fileError = '';
    input.value = ''; // Clear file input for next selection
  }

  private registerParentWithFiles(formValues: any) {
    const formData = new FormData();

    // Add all RegisterRequest fields (EXACTLY as in your C# class)
    formData.append('Email', formValues.email);
    formData.append('UserName', formValues.userName);
    formData.append('FullName', formValues.fullName);
    formData.append('ContactInfo', formValues.contactInfo || '');
    formData.append('Password', formValues.password);
    formData.append('ConfirmPassword', formValues.confirmPassword);
    formData.append('Role', formValues.role);

    // Add ParentRegisterRequest specific fields
    if (formValues.relation) {
      formData.append('Relation', formValues.relation);
    }

    // Add files
    if (this.selectedFiles.length > 0) {
      // First file as IdentityDocument
      formData.append('IdentityDocument', this.selectedFiles[0], this.selectedFiles[0].name);

      // Additional documents as array/list
      for (let i = 1; i < this.selectedFiles.length; i++) {
        formData.append('AdditionalDocuments', this.selectedFiles[i], this.selectedFiles[i].name);
      }
    }

    // DEBUG: Log what you're sending
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value.type, value.size);
      } else {
        console.log(key, value);
      }
    }

    // Call the service
    this.authService.registerParentWithFiles(formData).subscribe({
      next: (response: ApiResponse<ParentRegistrationResponse>) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = this.translate.instant('REGISTER.PARENT_SUCCESS');
          setTimeout(() => this.router.navigate(['/login']), 1500);
          this.registerForm.reset();
          this.selectedFiles = [];
        } else {
          this.errorMessage = response.message || this.translate.instant('REGISTER.PARENT_FAILED');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.translate.instant('REGISTER.SOMETHING_WRONG');
        console.error('❌ Full error:', err);
        console.error('❌ Error details:', err.error);
      }
    });
  }

  // ✅ Remove selected file
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.fileError = '';
  }

  // ✅ Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ✅ Main submit function
  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = this.translate.instant('REGISTER.FORM_ERRORS');
      return;
    }

    const role = this.registerForm.get('role')?.value;
    const formValues = this.registerForm.value;

    // Additional validation for parent role
    if (role === 'parent') {
      if (this.selectedFiles.length === 0) {
        this.fileError = this.translate.instant('REGISTER.FILE_REQUIRED');
        return;
      }

      if (this.selectedFiles.length > 3) {
        this.fileError = this.translate.instant('REGISTER.FILE_MAX_LIMIT');
        return;
      }
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.fileError = '';
    this.isLoading = true;

    if (role === 'parent' && this.selectedFiles.length > 0) {
      // Parent registration with files
      this.registerParentWithFiles(formValues);
    } else {
      // Normal registration without files
      this.registerNormal(formValues);
    }
  }

  private registerNormal(formValues: any) {
    const registerRequest: RegisterRequest = {
      fullName: formValues.fullName,
      userName: formValues.userName,
      email: formValues.email,
      contactInfo: formValues.contactInfo || '',
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      role: formValues.role
    };

    this.authService.register(registerRequest).subscribe({
      next: (response: ApiResponse<AuthResponse>) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = this.translate.instant('REGISTER.SUCCESS');
          setTimeout(() => this.router.navigate(['/login']), 1500);
          this.registerForm.reset();
          this.selectedFiles = [];
        } else {
          this.errorMessage = response.message || this.translate.instant('REGISTER.FAILED');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.translate.instant('REGISTER.SOMETHING_WRONG');
        console.error('❌ Error:', err);
      }
    });
  }

  // ✅ Cancel registration
  onCancel() {
    this.router.navigate(['/login']);
  }
}