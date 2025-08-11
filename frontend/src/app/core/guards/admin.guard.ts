import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const currentUser$ = this.authService.getCurrentUser();
    return true;
    // currentUser$.pipe(
    //   take(1),
    //   map(user => {
    //     const isAdmin = !!user && (user as any)?.role === 'Admin';
    //     if (!isAdmin) {
    //       this.router.navigate(['/']);
    //     }
    //     return isAdmin;
    //   })
    // );
  }
}

