import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'set-password', loadComponent: () => import('./auth/set-password.component').then(m => m.SetPasswordComponent) },
  { path: '', pathMatch: 'full',  loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'admin/users', loadComponent: () => import('./features/user-management/user-list/user-list.component').then(m => m.UserListComponent) },
  { path: 'admin/users/create', loadComponent: () => import('./features/user-management/user-form/user-form.component').then(m => m.UserFormComponent) },
  { path: 'admin/users/edit/:id', loadComponent: () => import('./features/user-management/user-form/user-form.component').then(m => m.UserFormComponent) },
  { 
    path: 'admin/solutions', 
    loadChildren: () => import('./features/solution-management/solution-management.module').then(m => m.SolutionManagementModule),
    
  },
  { 
    path: 'admin/clients', 
    loadChildren: () => import('./features/client-management/client-management.module').then(m => m.ClientManagementModule),
    
  },
  { path: 'admin/pipeline-stages', loadComponent: () => import('./features/admin/pipeline-stage-management/pipeline-stage-management.component').then(m => m.PipelineStageManagementComponent) },
  { path: 'opportunities', loadComponent: () => import('./features/opportunities/opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent) },
  { path: 'opportunities/create', loadComponent: () => import('./features/opportunities/opportunity-form/opportunity-form.component').then(m => m.OpportunityFormComponent) },
  { path: 'opportunities/:id', loadComponent: () => import('./features/opportunities/opportunity-detail/opportunity-detail.component').then(m => m.OpportunityDetailComponent) },
  { path: 'opportunities/:id/edit', loadComponent: () => import('./features/opportunities/opportunity-form/opportunity-form.component').then(m => m.OpportunityFormComponent) },
  { path: '**', redirectTo: '' }
];
