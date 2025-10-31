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
  iconPath: string; // SVG path for dynamic icons
  color: string;
}

@Component({
  selector: 'app-recent-activity-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">Recent Activity</h3>
        <a routerLink="/opportunities" class="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors">
          View All →
        </a>
      </div>
      
      <div class="space-y-4" *ngIf="activities.length > 0; else noActivity">
        <div *ngFor="let activity of activities" 
             class="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
          
          <!-- Activity Icon -->
          <div [ngClass]="'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ' + activity.color">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="activity.iconPath"></path>
            </svg>
          </div>
          
          <!-- Activity Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <p class="font-semibold text-gray-900">{{ activity.title }}</p>
              <p class="text-xs text-gray-500 font-medium">{{ getTimeAgo(activity.timestamp) }}</p>
            </div>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
            <p *ngIf="activity.opportunityName" class="text-xs text-blue-600 font-medium mt-1">
              {{ activity.opportunityName }}
            </p>
          </div>
        </div>
      </div>

      <ng-template #noActivity>
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
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
        iconPath: 'M12 4v16m8-8H4', // Plus icon
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
      { 
        type: 'email', 
        icon: 'fas fa-envelope', 
        iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', // Email icon
        color: 'bg-blue-500' 
      },
      { 
        type: 'call', 
        icon: 'fas fa-phone', 
        iconPath: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', // Phone icon
        color: 'bg-purple-500' 
      },
      { 
        type: 'meeting', 
        icon: 'fas fa-calendar', 
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', // Calendar icon
        color: 'bg-orange-500' 
      }
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
        iconPath: commType.iconPath,
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
