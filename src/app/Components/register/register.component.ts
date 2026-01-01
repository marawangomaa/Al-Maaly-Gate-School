import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormsModule,
  ValidatorFn
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
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Date limits for birthday
  maxBirthDate: string;
  minBirthDate: string;

  // Country code patterns for validation
  private countryPatterns: { [key: string]: { pattern: RegExp, example: string, length: number } } = {
    // Arabian Gulf
    '+966': { pattern: /^5[0-9]{8}$/, example: '512345678', length: 9 }, // Saudi Arabia: 5XXXXXXXX
    '+971': { pattern: /^5[0-9]{8}$/, example: '501234567', length: 9 }, // UAE: 5XXXXXXXX
    '+973': { pattern: /^[36]\d{7}$/, example: '36123456', length: 8 }, // Bahrain: 3XXXXXXX or 6XXXXXXX
    '+974': { pattern: /^[3567]\d{7}$/, example: '33123456', length: 8 }, // Qatar: 3,5,6,7XXXXXXX
    '+968': { pattern: /^[79]\d{7}$/, example: '92123456', length: 8 }, // Oman: 7,9XXXXXXX
    '+965': { pattern: /^[569]\d{7}$/, example: '51234567', length: 8 }, // Kuwait: 5,6,9XXXXXXX

    // Middle East
    '+20': { pattern: /^1[0125]\d{8}$/, example: '1012345678', length: 10 }, // Egypt: 10, 11, 12, 15XXXXXXXX
    '+962': { pattern: /^7[789]\d{7}$/, example: '791234567', length: 9 }, // Jordan: 77, 78, 79XXXXXXX
    '+963': { pattern: /^9\d{8}$/, example: '912345678', length: 9 }, // Syria: 9XXXXXXXX
    '+961': { pattern: /^(3|7[0-9]|8[0-9])\d{6}$/, example: '70123456', length: 7 }, // Lebanon: 3XXXXXX, 70-79, 80-89XXXXXX
    '+964': { pattern: /^7[0-9]{9}$/, example: '7712345678', length: 10 }, // Iraq: 7XXXXXXXXX
    '+967': { pattern: /^7[0-9]{8}$/, example: '712345678', length: 9 }, // Yemen: 7XXXXXXXX
    '+970': { pattern: /^5[0-9]{8}$/, example: '591234567', length: 9 }, // Palestine: 5XXXXXXXX
    '+249': { pattern: /^9[0-9]{8}$/, example: '911234567', length: 9 }, // Sudan: 9XXXXXXXX
    '+213': { pattern: /^(5|6|7)\d{8}$/, example: '551234567', length: 9 }, // Algeria: 5,6,7XXXXXXXX
    '+212': { pattern: /^6[0-9]{8}$/, example: '612345678', length: 9 }, // Morocco: 6XXXXXXXX
    '+216': { pattern: /^[2459]\d{7}$/, example: '20123456', length: 8 }, // Tunisia: 2,4,5,9XXXXXXX
    '+218': { pattern: /^9[0-9]{8}$/, example: '912345678', length: 9 }, // Libya: 9XXXXXXXX
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    // Set date limits (min: 100 years ago, max: today)
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100);
    const maxDate = new Date();

    this.maxBirthDate = maxDate.toISOString().split('T')[0];
    this.minBirthDate = minDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        userName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        gender: ['', Validators.required],
        birthday: ['', [Validators.required, this.ageValidator(2, 100)]],
        countryCode: [''],
        mobileNumber: ['', [this.mobileNumberFormatValidator.bind(this)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: ['', Validators.required],
      },
      {
        validators: [
          this.matchPasswordValidator,
          this.mobileNumberCompleteValidator.bind(this)
        ]
      }
    );


    // Watch country code changes for mobile number validation
    this.registerForm.get('countryCode')?.valueChanges.subscribe((countryCode) => {
      const mobileControl = this.registerForm.get('mobileNumber');
      if (countryCode && mobileControl?.value) {
        mobileControl.updateValueAndValidity();
      }
    });
  }

  // ✅ Prevent typing non-numeric characters in mobile field
  onMobileKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;

    // Allow only numbers (0-9), backspace, delete, tab, arrow keys
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      return;
    }

    // Allow only numeric characters
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // ✅ Format mobile number (remove any non-numeric characters)
  formatMobileNumber() {
    const mobileControl = this.registerForm.get('mobileNumber');
    if (mobileControl?.value) {
      // Remove all non-numeric characters
      const formattedValue = mobileControl.value.replace(/\D/g, '');
      mobileControl.setValue(formattedValue, { emitEvent: false });
    }
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

  // ✅ Mobile number format validator (single field)
  mobileNumberFormatValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const countryCode = this.registerForm?.get('countryCode')?.value;

    // If empty and no country code, it's optional
    if (!value && !countryCode) {
      return null;
    }

    // If has value but no country code, mark as pending
    if (value && !countryCode) {
      return { pendingCountryCode: true };
    }

    // If country code but no value, it's okay (optional)
    if (!value && countryCode) {
      return null;
    }

    // Validate based on country code pattern
    if (value && countryCode) {
      const pattern = this.countryPatterns[countryCode];
      if (pattern) {
        if (!pattern.pattern.test(value)) {
          return {
            invalidMobile: true,
            expectedFormat: pattern.example,
            expectedLength: pattern.length
          };
        }
      } else {
        // Default validation for other countries
        if (!/^\d{5,15}$/.test(value)) {
          return { invalidMobile: true };
        }
      }
    }

    return null;
  }

  // ✅ Mobile number complete validator (cross-field)
  mobileNumberCompleteValidator(form: AbstractControl): ValidationErrors | null {
    const countryCode = form.get('countryCode')?.value;
    const mobileNumber = form.get('mobileNumber')?.value;

    // If both empty, it's optional
    if (!countryCode && !mobileNumber) {
      form.get('countryCode')?.setErrors(null);
      form.get('mobileNumber')?.setErrors(null);
      return null;
    }

    // If one is provided but not the other
    if ((countryCode && !mobileNumber) || (!countryCode && mobileNumber)) {
      if (countryCode && !mobileNumber) {
        form.get('mobileNumber')?.setErrors({ required: true });
      }
      if (mobileNumber && !countryCode) {
        form.get('countryCode')?.setErrors({ required: true });
      }
      return { incompleteMobile: true };
    }

    // Clear errors if both are provided
    form.get('countryCode')?.setErrors(null);
    form.get('mobileNumber')?.setErrors(null);
    return null;
  }

  // ✅ Age validator (min 5 years old, max 100 years old)
  ageValidator(minAge: number, maxAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();

      // Check if date is in the future
      if (birthDate > today) {
        return { futureDate: true };
      }

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < minAge) {
        return { invalidAge: { min: minAge } };
      }

      if (age > maxAge) {
        return { invalidAge: { max: maxAge } };
      }

      return null;
    };
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = this.translate.instant('REGISTER.FORM_ERRORS');
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;


    // if (role === 'parent') {
    //   this.registerParent();
    // } else {
    this.registerNormal();
    // }
  }

  // ✅ Register normal user (teacher, admin, etc.)
  private registerNormal() {
    const formValues = this.registerForm.value;

    // Combine country code and mobile number
    const contactInfo = formValues.countryCode && formValues.mobileNumber
      ? `${formValues.countryCode}${formValues.mobileNumber}`
      : '';

    const registerRequest: RegisterRequest = {
      fullName: formValues.fullName,
      userName: formValues.userName,
      email: formValues.email,
      gender: formValues.gender,
      birthday: formValues.birthday,
      contactInfo: contactInfo,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      role: formValues.role
    };

    this.authService.register(registerRequest).subscribe({
      next: (response: ApiResponse<AuthResponse>) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = this.translate.instant('REGISTER.SUCCESS');
          setTimeout(() => {
            this.router.navigate(['/confirm-email'], {
              queryParams: { email: registerRequest.email }
            });
          }, 1500);
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
  // private registerParent() {
  //   const formValues = this.registerForm.value;

  //   // Combine country code and mobile number
  //   const contactInfo = formValues.countryCode && formValues.mobileNumber
  //     ? `${formValues.countryCode}${formValues.mobileNumber}`
  //     : '';

  //   const parentRequest: ParentRegisterRequest = {
  //     fullName: formValues.fullName,
  //     userName: formValues.userName,
  //     email: formValues.email,
  //     gender: formValues.gender,
  //     birthday: formValues.birthday,
  //     contactInfo: contactInfo,
  //     password: formValues.password,
  //     confirmPassword: formValues.confirmPassword,
  //     role: formValues.role,
  //     relation: formValues.relation
  //   };

  //   this.authService.registerParent(parentRequest).subscribe({
  //     next: (response: ApiResponse<ParentRegistrationResponse>) => {
  //       this.isLoading = false;
  //       if (response.success) {
  //         this.successMessage = this.translate.instant('REGISTER.PARENT_SUCCESS');
  //         setTimeout(() => this.router.navigate(['/login']), 1500);
  //         this.registerForm.reset();
  //       } else {
  //         this.errorMessage = response.message || this.translate.instant('REGISTER.PARENT_FAILED');
  //       }
  //     },
  //     error: err => {
  //       this.isLoading = false;
  //       this.errorMessage = err.error?.message || this.translate.instant('REGISTER.SOMETHING_WRONG');
  //       console.error(err);
  //     }
  //   });
  // }

  onCancel() {
    this.router.navigate(['/login']);
  }
}