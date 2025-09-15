import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    // wait for Firebase auth to initialize so we don't redirect prematurely
    await this.authService.waitForAuthInit();
    if (this.authService.isAuthenticated()) return true;
    return this.router.createUrlTree(['/login']);
  }
}
