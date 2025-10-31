import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

interface QuickStat {
  title: string;
  value: string | number;
  icon: string;
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
      
      <div class="space-y-4">
        <div *ngFor="let stat of stats" 
             class="p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div [ngClass]="'w-10 h-10 rounded-lg flex items-center justify-center ' + stat.color">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
