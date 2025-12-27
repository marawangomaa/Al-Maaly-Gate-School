import { Router } from "@angular/router";
import { AuthService } from "../Services/auth.service";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class GuestGuard {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app']);
      return false;
    }
    return true;
  }
}
