import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'set-password', loadComponent: () => import('./auth/set-password.component').then(m => m.SetPasswordComponent) },
  { path: '', pathMatch: 'full', canActivate: [AuthGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'admin/users', canActivate: [AuthGuard], loadComponent: () => import('./features/user-management/user-list/user-list.component').then(m => m.UserListComponent) },
  { path: 'admin/users/create', canActivate: [AuthGuard], loadComponent: () => import('./features/user-management/user-form/user-form.component').then(m => m.UserFormComponent) },
  { path: 'admin/users/edit/:id', canActivate: [AuthGuard], loadComponent: () => import('./features/user-management/user-form/user-form.component').then(m => m.UserFormComponent) },
  { 
    path: 'admin/solutions', 
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/solution-management/solution-management.module').then(m => m.SolutionManagementModule),
    
  },
  { 
    path: 'admin/clients', 
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/client-management/client-management.module').then(m => m.ClientManagementModule),
    
  },
  { path: 'admin/pipeline-stages', canActivate: [AuthGuard], loadComponent: () => import('./features/admin/pipeline-stage-management/pipeline-stage-management.component').then(m => m.PipelineStageManagementComponent) },
  { path: 'admin/settings', canActivate: [AuthGuard], loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent) },
  { path: 'opportunities', canActivate: [AuthGuard], loadComponent: () => import('./features/opportunities/opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent) },
  { path: 'opportunities/create', canActivate: [AuthGuard], loadComponent: () => import('./features/opportunities/opportunity-form/opportunity-form.component').then(m => m.OpportunityFormComponent) },
  { path: 'opportunities/:id', canActivate: [AuthGuard], loadComponent: () => import('./features/opportunities/opportunity-detail/opportunity-detail.component').then(m => m.OpportunityDetailComponent) },
  { path: 'opportunities/:id/edit', canActivate: [AuthGuard], loadComponent: () => import('./features/opportunities/opportunity-form/opportunity-form.component').then(m => m.OpportunityFormComponent) },
  { path: '**', canActivate: [AuthGuard], redirectTo: '' }
];
