import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;
  linkMode = false;
  linkCompleted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // If this is an email link, show linkMode and attempt auto-complete
    if (this.authService.isEmailLink()) {
      this.linkMode = true;
      // If email known (from local storage) we can attempt completion automatically
      const storedEmail = window.localStorage.getItem('pendingEmail');
      if (storedEmail) {
        this.completeLink(storedEmail);
      }
    }
  }

  async onSubmit() {
    if (this.linkMode) {
      // Email link flow: send link to provided email
      if (this.loginForm.get('email')?.invalid) return;
      this.loading = true;
      this.errorMessage = null;
      try {
        await this.authService.sendSignInLink(this.loginForm.value.email);
        alert('Sign-in link sent. Check your email.');
      } catch (e: any) {
        this.errorMessage = e.message || 'Failed to send sign-in link';
      } finally { this.loading = false; }
      return;
    }

    if (this.loginForm.invalid) { return; }
    this.loading = true; this.errorMessage = null;
    try {
      await this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password);
      this.router.navigate(['/']);
    } catch (error: any) { this.errorMessage = error.message || 'Login failed'; }
    finally { this.loading = false; }
  }

  async completeLink(email: string) {
    this.loading = true; this.errorMessage = null;
    try {
      await this.authService.completeEmailLinkSignIn(undefined, email);
      this.linkCompleted = true;
      this.router.navigate(['/set-password']);
    } catch (e: any) { this.errorMessage = e.message || 'Link sign-in failed'; }
    finally { this.loading = false; }
  }
}
