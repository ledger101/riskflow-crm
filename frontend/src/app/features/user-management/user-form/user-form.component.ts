import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

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
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
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
    if (this.userForm.invalid) {
      console.log('Invalid Form');
      
      return;
    }

    console.log('loading');
    
    this.loading = true;
    this.errorMessage = null;

    try {
      const { name, email, password, role } = this.userForm.value;
      if (this.isEdit && this.userId) {
        await this.userService.updateUser(this.userId, { name, email, role });
      } else {
        await this.userService.createUser({ name, email, password, role });
      }
      this.router.navigate(['/admin/users']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save user';
    } finally {
      this.loading = false;
    }
  }
}
