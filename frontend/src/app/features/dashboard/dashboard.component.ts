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
            <div class="lg:col-span-1">
              <app-quick-stats-widget></app-quick-stats-widget>
            </div>

            <!-- Quick Actions Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-md p-6 h-full">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div class="space-y-3">
                  <a routerLink="/opportunities" 
                     class="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                    <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <span class="font-semibold text-gray-900 group-hover:text-green-700">View Opportunities</span>
                  </a>
                  <a routerLink="/admin/users" 
                     class="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                    <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    </div>
                    <span class="font-semibold text-gray-900 group-hover:text-purple-700">Manage Users</span>
                  </a>
                  <a routerLink="/opportunities" 
                     class="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
                    <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <span class="font-semibold text-gray-900 group-hover:text-orange-700">Export Reports</span>
                  </a>
                </div>
              </div>
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
