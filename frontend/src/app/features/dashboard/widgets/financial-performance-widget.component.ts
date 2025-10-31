import { Component, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { SalesTargets } from '../../../shared/models/sales-targets.model';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-financial-performance-widget',
  standalone: true,
  imports: [CommonModule],
  providers: [OpportunityService],
  template: `
    <div class="bg-white rounded-xl shadow-md p-6 h-full">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">Financial Performance</h3>
        <div class="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Q{{ currentQuarter }} {{ currentYear }}
        </div>
      </div>
      
      <!-- Key Metrics -->
      <div class="space-y-6">
        <!-- Annual Performance -->
        <div class="border-b border-gray-100 pb-5">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-semibold text-gray-900">Annual Revenue</h4>
            <span [ngClass]="getPerformanceColor(annualPerformance)" class="text-sm font-bold">
              {{ annualPerformance }}%
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Achieved</span>
              <span class="font-semibold text-gray-900">{{ annualRevenue | currency }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Target</span>
              <span class="font-semibold text-gray-900">{{ salesTargets?.annualTarget | currency }}</span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                [ngClass]="'h-3 rounded-full transition-all duration-500 ' + getProgressBarColor(annualPerformance)" 
                [style.width.%]="Math.min(annualPerformance, 100)">
              </div>
            </div>
          </div>
        </div>

        <!-- Quarterly Performance -->
        <div class="border-b border-gray-100 pb-5">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-semibold text-gray-900">Quarterly Revenue</h4>
            <span [ngClass]="getPerformanceColor(quarterlyPerformance)" class="text-sm font-bold">
              {{ quarterlyPerformance }}%
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Achieved</span>
              <span class="font-semibold text-gray-900">{{ quarterlyRevenue | currency }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Target</span>
              <span class="font-semibold text-gray-900">{{ salesTargets?.quarterlyTarget | currency }}</span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                [ngClass]="'h-3 rounded-full transition-all duration-500 ' + getProgressBarColor(quarterlyPerformance)" 
                [style.width.%]="Math.min(quarterlyPerformance, 100)">
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Metrics -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <p class="text-2xl font-bold text-green-600">{{ wonOpportunities }}</p>
            <p class="text-xs text-gray-600 mt-1">Deals Won (Q{{ currentQuarter }})</p>
          </div>
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-600">{{ conversionRate }}%</p>
            <p class="text-xs text-gray-600 mt-1">Conversion Rate</p>
          </div>
        </div>
      </div>

      <!-- Target Management (Admin Only) -->
      <div *ngIf="isAdmin" class="mt-6 pt-4 border-t border-gray-200">
        <button 
          (click)="openTargetSettings()"
          class="w-full text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Manage Targets
        </button>
      </div>

      <!-- Real-time Update Indicator -->
      <div class="flex items-center justify-center mt-4 text-xs text-gray-400" *ngIf="isLoading">
        <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Updating performance data...
      </div>
    </div>
  `
})
export class FinancialPerformanceWidgetComponent implements OnInit {
  salesTargets: SalesTargets | null = null;
  annualRevenue = 0;
  quarterlyRevenue = 0;
  annualPerformance = 0;
  quarterlyPerformance = 0;
  wonOpportunities = 0;
  conversionRate = 0;
  currentYear = new Date().getFullYear();
  currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  isLoading = false;
  isAdmin = false; // Would be determined by user role
  revenue: number = 0;

  Math = Math; // Expose Math to template
  constructor(
    private opportunityService: OpportunityService,
    private settingsService: SettingsService
  ) {}
  
  ngOnInit(): void {
    this.loadFinancialData();
    this.loadTargets();

    this.opportunityService.getOpportunitiesStream().subscribe({
      next: (opportunities: Opportunity[]) => {
        // Only consider opportunities with probability > 70 as revenue
        this.revenue = opportunities
          .filter(o => o.probability > 70)
          .reduce((sum, o) => sum + (o.value || 0), 0);
      },
      error: err => {
        console.error('Error loading opportunities', err);
      }
    });
  }

  private async loadTargets(): Promise<void> {
    try {
      this.salesTargets = await this.settingsService.getCurrentTargets();
      // Update performance calculations when targets are loaded
      if (this.salesTargets) {
        this.annualPerformance = this.salesTargets.annualTarget
          ? Math.round((this.annualRevenue / this.salesTargets.annualTarget) * 100)
          : 0;
        this.quarterlyPerformance = this.salesTargets.quarterlyTarget
          ? Math.round((this.quarterlyRevenue / this.salesTargets.quarterlyTarget) * 100)
          : 0;
      }
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  }

  private async loadFinancialData(): Promise<void> {
    try {
      this.isLoading = true;
      const opportunities = await this.opportunityService.getOpportunities();
      this.calculateFinancialMetrics(opportunities);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private calculateFinancialMetrics(opportunities: Opportunity[]): void {
    const currentYear = this.currentYear;
    const currentQuarter = this.currentQuarter;
    
    // Filter opportunities by time periods
    const quarterStart = this.settingsService.getQuarterStartDate(currentYear, currentQuarter);
    const quarterEnd = this.settingsService.getQuarterEndDate(currentYear, currentQuarter);
    const yearStart = this.settingsService.getYearStartDate(currentYear);
    const yearEnd = this.settingsService.getYearEndDate(currentYear);

    // Opportunities contributing to revenue are those with probability > 70 (business rule)
    const revenueOpps = opportunities.filter(o => (o.probability || 0) > 70);

    const quarterlyRevenueOpps = revenueOpps.filter(opp => {
      if (!opp.createdAt) return false;
      const oppDate = opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt);
      return oppDate >= quarterStart && oppDate <= quarterEnd;
    });

    const annualRevenueOpps = revenueOpps.filter(opp => {
      if (!opp.createdAt) return false;
      const oppDate = opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt);
      return oppDate >= yearStart && oppDate <= yearEnd;
    });

    this.quarterlyRevenue = quarterlyRevenueOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
    this.annualRevenue = annualRevenueOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
    this.wonOpportunities = quarterlyRevenueOpps.length; // Interpreting as count of high-probability deals this quarter

    // Calculate performance percentages
    if (this.salesTargets) {
      this.quarterlyPerformance = this.salesTargets.quarterlyTarget > 0 
        ? Math.round((this.quarterlyRevenue / this.salesTargets.quarterlyTarget) * 100)
        : 0;
      
      this.annualPerformance = this.salesTargets.annualTarget > 0 
        ? Math.round((this.annualRevenue / this.salesTargets.annualTarget) * 100)
        : 0;
    }

    // Calculate conversion rate
    const totalOpportunities = opportunities.length;
    // Conversion rate: proportion of high-probability ( >70 ) opportunities relative to total
    this.conversionRate = totalOpportunities > 0 
      ? Math.round((revenueOpps.length / totalOpportunities) * 100)
      : 0;
  }

  getPerformanceColor(percentage: number): string {
    if (percentage >= 100) return 'text-green-600 font-semibold';
    if (percentage >= 80) return 'text-blue-600 font-semibold';
    if (percentage >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getCircumference(): number {
    const radius = 40;
    return 2 * Math.PI * radius;
  }

  getStrokeDashoffset(percentage: number): number {
    const circumference = this.getCircumference();
    const progress = Math.min(percentage, 100) / 100;
    return circumference - (progress * circumference);
  }

  openTargetSettings(): void {
    // Would open a dialog for target management
    console.log('Opening target settings dialog...');
    // This would implement a Material Dialog for target editing
  }
}
