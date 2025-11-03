import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

interface QuickStat {
  title: string;
  value: string | number;
  icon: string;
  iconPath: string; // SVG path for inline icons
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

@Component({
  selector: 'app-quick-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-md p-6 h-full">
      <h3 class="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div *ngFor="let stat of stats" 
             class="p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div [ngClass]="'w-10 h-10 rounded-lg flex items-center justify-center ' + stat.color">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="stat.iconPath"></path>
              </svg>
            </div>
            <div *ngIf="stat.trend" [ngClass]="getTrendClass(stat.trend.direction)" class="text-sm font-semibold">
              <svg *ngIf="stat.trend.direction === 'up'" class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <svg *ngIf="stat.trend.direction === 'down'" class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
              </svg>
              {{ stat.trend.value }}%
            </div>
          </div>
          <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.title }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Additional Metrics -->
      <div class="mt-6 pt-5 border-t border-gray-200">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-600">{{ avgDealSize | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-gray-600 mt-1">Avg Deal Size</p>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <p class="text-2xl font-bold text-purple-600">{{ avgSalesCycle }}d</p>
            <p class="text-xs text-gray-600 mt-1">Avg Sales Cycle</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuickStatsWidgetComponent implements OnInit {
  stats: QuickStat[] = [];
  avgDealSize = 0;
  avgSalesCycle = 0;

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    this.loadQuickStats();
  }

  private async loadQuickStats(): Promise<void> {
    try {
      const opportunities = await this.opportunityService.getOpportunities();
      this.calculateQuickStats(opportunities);
    } catch (error) {
      console.error('Error loading quick stats:', error);
    }
  }

  private calculateQuickStats(opportunities: Opportunity[]): void {
    const totalOpportunities = opportunities.length;
    const activeOpportunities = opportunities.filter(opp => {
      const stageKey = (opp.stageId || opp.stage || '').toLowerCase();
      return !['closed-won', 'closed-lost'].includes(stageKey);
    }).length;
    const wonOpportunities = opportunities.filter(opp => (opp.stageId || opp.stage) === 'closed-won').length;
    const lostOpportunities = opportunities.filter(opp => (opp.stageId || opp.stage) === 'closed-lost').length;

    // Calculate conversion rate
    const conversionRate = totalOpportunities > 0 
      ? Math.round((wonOpportunities / totalOpportunities) * 100) 
      : 0;

    // Calculate average deal size
  const wonDeals = opportunities.filter(opp => (opp.stageId || opp.stage) === 'closed-won');
    this.avgDealSize = wonDeals.length > 0 
      ? wonDeals.reduce((sum, opp) => sum + (opp.value || 0), 0) / wonDeals.length 
      : 0;

    // Mock average sales cycle (in days)
    this.avgSalesCycle = 45;

    this.stats = [
      {
        title: 'Total Opportunities',
        value: totalOpportunities,
        icon: 'fas fa-chart-line',
        iconPath: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', // Chart line icon
        color: 'bg-blue-500',
        trend: {
          value: 12,
          direction: 'up'
        }
      },
      {
        title: 'Active Opportunities',
        value: activeOpportunities,
        icon: 'fas fa-hourglass-half',
        iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // Clock/hourglass icon
        color: 'bg-orange-500',
        trend: {
          value: 8,
          direction: 'up'
        }
      },
      {
        title: 'Won This Quarter',
        value: wonOpportunities,
        icon: 'fas fa-trophy',
        iconPath: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', // Badge/trophy icon
        color: 'bg-green-500',
        trend: {
          value: 15,
          direction: 'up'
        }
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate}%`,
        icon: 'fas fa-percentage',
        iconPath: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', // Calculator/percentage icon
        color: 'bg-purple-500',
        trend: {
          value: 3,
          direction: conversionRate > 20 ? 'up' : 'down'
        }
      }
    ];
  }

  getTrendIcon(direction: 'up' | 'down'): string {
    return direction === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }

  getTrendClass(direction: 'up' | 'down'): string {
    return direction === 'up' 
      ? 'text-green-600 text-sm font-medium' 
      : 'text-red-600 text-sm font-medium';
  }
}
