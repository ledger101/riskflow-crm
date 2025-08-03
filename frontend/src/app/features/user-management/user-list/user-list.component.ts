import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, AppUser } from '../../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: AppUser[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getUsers().then(users => this.users = users);
  }

  createUser() {
    this.router.navigate(['/admin/users/create']);
  }

  editUser(id: string) {
    this.router.navigate(['/admin/users/edit', id]);
  }
}
