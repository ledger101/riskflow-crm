import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto mt-20 bg-white shadow rounded p-6" *ngIf="!initializing; else loadingTpl">
      <h1 class="text-xl font-semibold mb-4">Set Your Password</h1>
      <p class="text-sm text-gray-600 mb-6" *ngIf="!needsEmail">Complete your account setup by choosing a secure password.</p>

      <!-- Ask for email if missing (opened link on different device/browser) -->
      <form *ngIf="needsEmail" [formGroup]="emailForm" (ngSubmit)="completeLinkFromEmail()" class="space-y-4">
        <p class="text-sm text-gray-700">Enter your email to complete sign-in from the link.</p>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" formControlName="email" class="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" [disabled]="emailForm.invalid || loading" class="bg-blue-600 text-white px-4 py-2 rounded w-full">
          <span *ngIf="!loading">Continue</span>
          <span *ngIf="loading">Processing...</span>
        </button>
        <div class="text-xs text-red-500" *ngIf="error">{{ error }}</div>
      </form>

      <!-- Password form -->
      <form *ngIf="!needsEmail" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input type="password" formControlName="password" class="w-full border rounded px-3 py-2" />
          <div class="text-xs text-red-500 mt-1" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
            Password must be at least 8 characters
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <input type="password" formControlName="confirm" class="w-full border rounded px-3 py-2" />
          <div class="text-xs text-red-500 mt-1" *ngIf="form.get('confirm')?.touched && form.get('confirm')?.invalid">
            Confirmation required
          </div>
          <div class="text-xs text-red-500 mt-1" *ngIf="passwordMismatch">
            Passwords do not match
          </div>
        </div>
        <button type="submit" [disabled]="form.invalid || loading || passwordMismatch" class="bg-blue-600 text-white px-4 py-2 rounded w-full">
          <span *ngIf="!loading">Set Password & Continue</span>
          <span *ngIf="loading">Setting Password...</span>
        </button>
        <div class="text-xs text-red-500" *ngIf="error">{{ error }}</div>
      </form>
    </div>
    <ng-template #loadingTpl>
      <div class="max-w-md mx-auto mt-20 bg-white shadow rounded p-6 text-center text-sm text-gray-600">Initializing...</div>
    </ng-template>
  `
})
export class SetPasswordComponent implements OnInit {
  form: FormGroup;
  emailForm: FormGroup;
  loading = false;
  initializing = true;
  needsEmail = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]]
    });
    this.emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  async ngOnInit() {
    try {
      // If user already authenticated, proceed
      if (this.auth.getCurrentUser()) { this.initializing = false; return; }
      // If this is an email link, attempt completion using stored email
      if (this.auth.isEmailLink()) {
        const storedEmail = window.localStorage.getItem('pendingEmail');
        if (storedEmail) {
          try {
            await this.auth.completeEmailLinkSignIn(undefined, storedEmail);
            // Small delay to ensure auth state is properly propagated
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (e:any) {
            this.error = e.message || 'Failed to complete sign-in.';
          }
        } else {
          // Need to ask user for email
          this.needsEmail = true;
        }
      } else {
        // Not an email-link flow; redirect to login
        this.router.navigate(['/login']);
        return;
      }
    } finally {
      this.initializing = false;
    }
  }

  get passwordMismatch(): boolean {
    const { password, confirm } = this.form.value;
    return password && confirm && password !== confirm;
  }

  async completeLinkFromEmail() {
    if (this.emailForm.invalid) return;
    this.loading = true; this.error = null;
    try {
      await this.auth.completeEmailLinkSignIn(undefined, this.emailForm.value.email);
      // Small delay to ensure auth state is properly propagated
      await new Promise(resolve => setTimeout(resolve, 100));
      this.needsEmail = false;
    } catch (e:any) { 
      this.error = e.message || 'Failed to complete sign-in';
      // Ensure loading is reset even in case of errors
      this.loading = false;
      // Mark form controls as touched to show validation errors
      Object.keys(this.emailForm.controls).forEach(key => {
        const control = this.emailForm.get(key);
        control?.markAsTouched();
      });
    }
    finally { 
      // Only reset loading if we haven't already done so in the catch block
      if (this.loading) {
        this.loading = false;
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.passwordMismatch) return;
    this.loading = true;
    this.error = null;
    try {
      await this.auth.setInitialPassword(this.form.value.password);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e.message || 'Failed to set password';
      // Ensure loading is reset even in case of errors
      this.loading = false;
      // Mark form controls as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    } finally {
      // Only reset loading if we haven't already done so in the catch block
      if (this.loading) {
        this.loading = false;
      }
    }
  }
}
