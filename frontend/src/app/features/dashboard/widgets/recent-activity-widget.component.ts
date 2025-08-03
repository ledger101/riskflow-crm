import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

interface ActivityItem {
  id: string;
  type: 'opportunity' | 'communication' | 'action';
  title: string;
  description: string;
  timestamp: Date;
  opportunityName?: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-recent-activity-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Recent Activity</h3>
        <a routerLink="/opportunities" class="text-blue-500 hover:text-blue-600 text-sm font-medium">
          View All
        </a>
      </div>
      
      <div class="space-y-4" *ngIf="activities.length > 0; else noActivity">
        <div *ngFor="let activity of activities" 
             class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          
          <!-- Activity Icon -->
          <div [ngClass]="'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ' + activity.color">
            <i [ngClass]="activity.icon + ' text-white text-sm'"></i>
          </div>
          
          <!-- Activity Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-xs text-gray-500">{{ getTimeAgo(activity.timestamp) }}</p>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ activity.description }}</p>
            <p *ngIf="activity.opportunityName" class="text-xs text-blue-600 mt-1">
              {{ activity.opportunityName }}
            </p>
          </div>
        </div>
      </div>

      <ng-template #noActivity>
        <div class="text-center py-8">
          <i class="fas fa-clock text-gray-300 text-3xl mb-2"></i>
          <p class="text-gray-500">No recent activity</p>
        </div>
      </ng-template>
    </div>
  `
})
export class RecentActivityWidgetComponent implements OnInit {
  activities: ActivityItem[] = [];

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  private async loadRecentActivity(): Promise<void> {
    try {
      const opportunities = await this.opportunityService.getOpportunities();
      this.generateActivityItems(opportunities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  private generateActivityItems(opportunities: Opportunity[]): void {
    const activities: ActivityItem[] = [];

    // Recent opportunities (created in last 30 days)
    const recentOpportunities = opportunities
      .filter(opp => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return opp.createdAt && opp.createdAt.toDate() > thirtyDaysAgo;
      })
      .sort((a, b) => (b.createdAt?.toDate() || new Date()).getTime() - (a.createdAt?.toDate() || new Date()).getTime())
      .slice(0, 5);

    recentOpportunities.forEach(opp => {
      activities.push({
        id: opp.id || '',
        type: 'opportunity',
        title: 'New Opportunity Created',
        description: `${opp.description} - ${opp.value ? this.formatCurrency(opp.value) : 'No value specified'}`,
        timestamp: opp.createdAt?.toDate() || new Date(),
        opportunityName: opp.description,
        icon: 'fas fa-plus',
        color: 'bg-green-500'
      });
    });

    // Recent communications (mock data for demonstration)
    const mockCommunications = this.generateMockCommunications(opportunities.slice(0, 3));
    activities.push(...mockCommunications);

    // Sort by timestamp and take most recent 8 items
    this.activities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }

  private generateMockCommunications(opportunities: Opportunity[]): ActivityItem[] {
    const communications: ActivityItem[] = [];
    const communicationTypes = [
      { type: 'email', icon: 'fas fa-envelope', color: 'bg-blue-500' },
      { type: 'call', icon: 'fas fa-phone', color: 'bg-purple-500' },
      { type: 'meeting', icon: 'fas fa-calendar', color: 'bg-orange-500' }
    ];

    opportunities.forEach((opp, index) => {
      const commType = communicationTypes[index % communicationTypes.length];
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - (index + 1) * 2);

      communications.push({
        id: `comm-${index}`,
        type: 'communication',
        title: `${commType.type.charAt(0).toUpperCase() + commType.type.slice(1)} logged`,
        description: `Communication recorded for opportunity`,
        timestamp,
        opportunityName: opp.description,
        icon: commType.icon,
        color: commType.color
      });
    });

    return communications;
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
