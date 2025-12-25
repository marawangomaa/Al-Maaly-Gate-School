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
import { ParentRegisterRequest } from "../../Interfaces/ParentRegisterRequest";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

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

    // Watch role changes
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'parent') {
        this.registerForm.get('relation')?.setValidators([Validators.required]);
      } else {
        this.registerForm.get('relation')?.clearValidators();
      }
      this.registerForm.get('relation')?.updateValueAndValidity();
    });
  }

  // ✅ Custom validator: password === confirmPassword
  matchPasswordValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    if (password !== confirm) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = this.translate.instant('REGISTER.FORM_ERRORS');
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const role = this.registerForm.get('role')?.value;

    if (role === 'parent') {
      this.registerParent();
    } else {
      this.registerNormal();
    }
  }

  // ✅ Register normal user (teacher, admin, etc.)
  private registerNormal() {
    const formValues = this.registerForm.value;

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
        } else {
          this.errorMessage = response.message || this.translate.instant('REGISTER.FAILED');
        }
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.translate.instant('REGISTER.SOMETHING_WRONG');
        console.error(err);
      }
    });
  }

  // ✅ Register parent (no files at registration)
  private registerParent() {
    const formValues = this.registerForm.value;

    const parentRequest: ParentRegisterRequest = {
      fullName: formValues.fullName,
      userName: formValues.userName,
      email: formValues.email,
      contactInfo: formValues.contactInfo || '',
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      role: formValues.role,
      relation: formValues.relation
    };

    this.authService.registerParent(parentRequest).subscribe({
      next: (response: ApiResponse<ParentRegistrationResponse>) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = this.translate.instant('REGISTER.PARENT_SUCCESS');
          setTimeout(() => this.router.navigate(['/login']), 1500);
          this.registerForm.reset();
        } else {
          this.errorMessage = response.message || this.translate.instant('REGISTER.PARENT_FAILED');
        }
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.translate.instant('REGISTER.SOMETHING_WRONG');
        console.error(err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}
