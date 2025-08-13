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
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
      
      <div class="space-y-4">
        <div *ngFor="let stat of stats" 
             class="flex items-center justify-between p-4 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <div [ngClass]="'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ' + stat.color">
              <i [ngClass]="stat.icon + ' text-white'"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-gray-700">{{ stat.value }}</p>
            </div>
          </div>
          
          <div *ngIf="stat.trend" class="text-right">
            <span [ngClass]="getTrendClass(stat.trend.direction)">
              <i [ngClass]="getTrendIcon(stat.trend.direction)"></i>
              {{ stat.trend.value }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Additional Metrics -->
      <div class="mt-6 pt-4 border-t border-gray-200">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <p class="text-lg font-bold text-blue-600">{{ avgDealSize | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-gray-500">Avg Deal Size</p>
          </div>
          <div>
            <p class="text-lg font-bold text-purple-600">{{ avgSalesCycle }}d</p>
            <p class="text-xs text-gray-500">Avg Sales Cycle</p>
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
