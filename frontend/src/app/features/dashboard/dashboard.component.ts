import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PipelineOverviewWidgetComponent } from './widgets/pipeline-overview-widget.component';
import { FinancialPerformanceWidgetComponent } from './widgets/financial-performance-widget.component';
import { RecentActivityWidgetComponent } from './widgets/recent-activity-widget.component';
import { QuickStatsWidgetComponent } from './widgets/quick-stats-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    PipelineOverviewWidgetComponent,
    FinancialPerformanceWidgetComponent,
    RecentActivityWidgetComponent,
    QuickStatsWidgetComponent
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <!-- Dashboard Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-2 text-gray-600">Welcome to your Riskflow CRM overview</p>
        </div>

        <!-- Widgets Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <!-- Pipeline Overview Widget -->
          <div class="col-span-1 lg:col-span-2 xl:col-span-2">
            <app-pipeline-overview-widget></app-pipeline-overview-widget>
          </div>

          <!-- Financial Performance Widget -->
          <div class="col-span-1">
            <app-financial-performance-widget></app-financial-performance-widget>
          </div>

          <!-- Recent Activity Widget -->
          <div class="col-span-1 lg:col-span-2">
            <app-recent-activity-widget></app-recent-activity-widget>
          </div>

          <!-- Quick Stats Widget -->
          <div class="col-span-1">
            <app-quick-stats-widget></app-quick-stats-widget>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a routerLink="/opportunities/create" 
               class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors">
              Create Opportunity
            </a>
            <a routerLink="/opportunities" 
               class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors">
              View Opportunities
            </a>
            <a routerLink="/admin/users" 
               class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors">
              Manage Users
            </a>
            <a routerLink="/opportunities" 
               class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors">
              Export Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
