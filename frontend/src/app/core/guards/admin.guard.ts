import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.authService.getCurrentUser();
    // Check for "admin" custom claim or role property
    if (user && (user as any).role === 'Admin') {
      return true;
    }
    return this.router.createUrlTree(['/']);
  }
}
