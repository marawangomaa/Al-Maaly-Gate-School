import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {
  contactForm!: FormGroup;
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  // Dynamic contact info that can be translated
  contactInfo = {
    email: 'aischools555@gmail.com',
    address: this.translate.instant('CONTACT.CONTACT_INFO.ADDRESS.VALUE'),
    MaillingBox: this.translate.instant('CONTACT.CONTACT_INFO.MAILING_BOX.VALUE')
  };

  constructor() { }

  ngOnInit(): void {
    this.initializeForm();

    // Update contact info when language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateContactInfo();
    });
  }

  initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  updateContactInfo(): void {
    this.contactInfo = {
      email: 'aischools555@gmail.com',
      address: this.translate.instant('CONTACT.CONTACT_INFO.ADDRESS.VALUE'),
      MaillingBox: this.translate.instant('CONTACT.CONTACT_INFO.MAILING_BOX.VALUE')
    };
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form Data:', this.contactForm.value);

      // Show success message in current language
      const successMessage = this.translate.instant('CONTACT.FORM.SUCCESS');
      alert(successMessage);

      this.contactForm.reset();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return this.translate.instant('CONTACT.FORM.ERRORS.REQUIRED');
    }

    if (control.errors['email']) {
      return this.translate.instant('CONTACT.FORM.ERRORS.EMAIL');
    }

    if (control.errors['minlength']) {
      if (controlName === 'name') {
        return this.translate.instant('CONTACT.FORM.ERRORS.MIN_LENGTH_NAME');
      } else if (controlName === 'message') {
        return this.translate.instant('CONTACT.FORM.ERRORS.MIN_LENGTH_MESSAGE');
      }
    }

    return '';
  }
}