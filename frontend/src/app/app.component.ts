import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FirebaseService } from './core/services/firebase.service';
import { AuthService } from './core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Riskflow CRM';
  firebaseHealthy = false;
  loading = true;
  isLoginRoute = false;
  isAdmin = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Determine initial route to hide health-check UI on /login
    this.isLoginRoute = this.router.url === '/login';
    try {
      this.firebaseHealthy = await this.firebaseService.healthCheck();
      // Temporarily set all users as admin for testing
      this.isAdmin = true;
    } catch (error) {
      console.error('Health check failed:', error);
      this.firebaseHealthy = false;
    } finally {
      this.loading = false;
    }
    // Check for login route to hide health UI
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = event.urlAfterRedirects === '/login';
      }
    });
  }

  logout(): void {
    this.authService.signOut()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout error:', err));
  }
}
