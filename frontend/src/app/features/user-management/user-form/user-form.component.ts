import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-form.component.html',
 // styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId: string | null = null;
  loading = false;
  inviting = false;
  inviteSent = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;
    if (this.isEdit && this.userId) {
      this.userService.getUsers().then(users => {
        const user = users.find(u => u.id === this.userId);
        if (user) {
          this.userForm.patchValue({ 
            name: user.name || '', 
            email: user.email, 
            role: user.role 
          });
        }
      });
    }
  }

  async onSubmit() {
    if (this.userForm.invalid) { return; }
    this.loading = true; this.errorMessage = null;
    try {
      const { name, email, password, role } = this.userForm.value;
      if (this.isEdit && this.userId) {
        await this.userService.updateUser(this.userId, { name, email, role });
      } else {
        if (!password) {
          // If no password provided, just send invite
          await this.sendInviteInternal();
          this.loading = false;
          return;
        }
        await this.userService.createUser({ name, email, password, role });
      }
      this.router.navigate(['/admin/users']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save user';
    } finally {
      this.loading = false;
    }
  }

  async sendInvite() {
    if (this.userForm.get('email')?.invalid || this.userForm.get('role')?.invalid) return;
    this.inviting = true; this.errorMessage = null;
    try {
      await this.sendInviteInternal();
      this.inviteSent = true;
    } catch (e: any) { this.errorMessage = e.message || 'Failed to send invite'; }
    finally { this.inviting = false; }
  }

  private async sendInviteInternal() {
    const { name, email, role } = this.userForm.value;
    // Create placeholder invited user
    try { await this.userService.inviteUser({ name, email, role }); } catch { /* ignore duplicate */ }
    await this.authService.sendSignInLink(email);
    alert('Invitation link sent to ' + email);
  }
}
