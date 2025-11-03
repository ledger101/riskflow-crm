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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="max-w-[1600px] mx-auto p-6 lg:p-8">
        <!-- Dashboard Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p class="text-lg text-gray-600">Welcome to your Riskflow CRM overview</p>
            </div>
            <div class="flex gap-3">
              <a routerLink="/opportunities/create" 
                 class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Opportunity
              </a>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="space-y-6">
          <!-- Pipeline Overview - Full Width -->
          <div class="w-full">
            <app-pipeline-overview-widget></app-pipeline-overview-widget>
          </div>

          <!-- Secondary Widgets Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Financial Performance Widget -->
            <div class="lg:col-span-1">
              <app-financial-performance-widget></app-financial-performance-widget>
            </div>

            <!-- Quick Stats Widget -->
            <div class="lg:col-span-2">
              <app-quick-stats-widget></app-quick-stats-widget>
            </div>
          </div>

          <!-- Recent Activity - Full Width -->
          <div class="w-full">
            <app-recent-activity-widget></app-recent-activity-widget>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
