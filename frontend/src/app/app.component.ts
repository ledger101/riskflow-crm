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
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Solution {
  id: string;
  name: string;
  cost?: number;
}

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
  showMigrationButton = false;
  migrationRunning = false;
  migrationStatus: { type: 'success' | 'error' | 'info', message: string } | null = null;

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
      
      // Check if migration is needed
      this.checkMigrationNeeded();
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

  async checkMigrationNeeded() {
    try {
      // Check if any opportunities need migration
      const db = this.firebaseService.getFirestore();
      const opportunitiesSnap = await getDocs(collection(db, 'opportunities'));
      
      for (const docSnap of opportunitiesSnap.docs) {
        const data = docSnap.data();
        // If we find any opportunity with legacy format, show migration button
        if (data['solutionId'] && !data['solutions']) {
          this.showMigrationButton = true;
          break;
        }
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  }

  async runMigration() {
    if (this.migrationRunning) return;
    
    this.migrationRunning = true;
    this.migrationStatus = { type: 'info', message: 'Starting migration...' };

    try {
      const db = this.firebaseService.getFirestore();
      
      // Step 1: Load all solutions
      this.migrationStatus = { type: 'info', message: 'Loading solutions...' };
      const solutionsSnap = await getDocs(collection(db, 'solutions'));
      const solutionsMap = new Map<string, Solution>();
      
      solutionsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        solutionsMap.set(docSnap.id, {
          id: docSnap.id,
          name: data['name'] || 'Unknown',
          cost: data['cost'] || 0
        });
      });
      
      // Step 2: Load and process opportunities
      this.migrationStatus = { type: 'info', message: 'Processing opportunities...' };
      const opportunitiesSnap = await getDocs(collection(db, 'opportunities'));
      
      let updated = 0;
      let skipped = 0;
      
      for (const docSnap of opportunitiesSnap.docs) {
        const data = docSnap.data();
        
        // Skip if already has new format
        if (data['solutions'] && data['solutionIds']) {
          skipped++;
          continue;
        }

        const updateData: any = {};
        let needsUpdate = false;

        // Migrate from legacy solutionId to new format
        if (data['solutionId'] && !data['solutions']) {
          const solution = solutionsMap.get(data['solutionId']);
          
          if (solution) {
            updateData['solutions'] = [{
              id: solution.id,
              name: solution.name,
              cost: solution.cost || 0
            }];
            updateData['solutionIds'] = [solution.id];
            
            // Update value if not set or zero, using solution cost
            if (!data['value'] || data['value'] === 0) {
              updateData['value'] = solution.cost || 0;
            }
            
            needsUpdate = true;
          } else {
            // Create placeholder for missing solution
            updateData['solutions'] = [{
              id: data['solutionId'],
              name: data['solutionName'] || 'Unknown Solution',
              cost: 0
            }];
            updateData['solutionIds'] = [data['solutionId']];
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          const docRef = doc(db, 'opportunities', docSnap.id);
          await updateDoc(docRef, updateData);
          updated++;
        } else {
          skipped++;
        }
      }

      this.migrationStatus = { 
        type: 'success', 
        message: `Migration complete! Updated: ${updated}, Skipped: ${skipped}` 
      };
      this.showMigrationButton = false;
      
      // Clear status after 5 seconds
      setTimeout(() => {
        this.migrationStatus = null;
      }, 5000);

    } catch (error) {
      console.error('Migration failed:', error);
      this.migrationStatus = { 
        type: 'error', 
        message: `Migration failed: ${error}` 
      };
    } finally {
      this.migrationRunning = false;
    }
  }

  logout(): void {
    this.authService.signOut()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout error:', err));
  }
}
