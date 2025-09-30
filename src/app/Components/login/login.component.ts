import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    // Mock authentication (replace with real API call)
    if (this.email === 'admin@test.com' && this.password === '123456') {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/app']); // Go to logged-in layout
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
