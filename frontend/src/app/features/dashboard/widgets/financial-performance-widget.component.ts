import { Component, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { SettingsService, SalesTargets } from '../../../core/services/settings.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

interface PerformanceMetric {
  title: string;
  current: number;
  target: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  period: 'quarterly' | 'annual';
}

@Component({
  selector: 'app-financial-performance-widget',
  standalone: true,
  imports: [CommonModule],
  providers: [OpportunityService, SettingsService],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Financial Performance</h3>
        <div class="text-xs text-gray-500">
          Q{{ currentQuarter }} {{ currentYear }}
        </div>
      </div>
      
      <!-- Key Metrics -->
      <div class="space-y-6">
        <!-- Annual Performance -->
        <div class="border-b border-gray-100 pb-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium text-gray-900">Annual Revenue</h4>
            <span [ngClass]="getPerformanceColor(annualPerformance)">
              {{ annualPerformance }}%
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Achieved: {{ annualRevenue | currency }}</span>
              <span class="text-gray-500">Target: {{ salesTargets?.annualTarget | currency }}</span>
            </div>
            
            <!-- Circular Progress -->
            <div class="relative w-24 h-24 mx-auto">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <!-- Background circle -->
                <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none"/>
                <!-- Progress circle -->
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#3b82f6" 
                  stroke-width="8" 
                  fill="none"
                  [attr.stroke-dasharray]="getCircumference()"
                  [attr.stroke-dashoffset]="getStrokeDashoffset(annualPerformance)"
                  class="transition-all duration-500"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-700">{{ annualPerformance }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quarterly Performance -->
        <div class="border-b border-gray-100 pb-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium text-gray-900">Quarterly Revenue</h4>
            <span [ngClass]="getPerformanceColor(quarterlyPerformance)">
              {{ quarterlyPerformance }}%
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Achieved: {{ quarterlyRevenue | currency }}</span>
              <span class="text-gray-500">Target: {{ salesTargets?.quarterlyTarget | currency }}</span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                [ngClass]="'h-3 rounded-full transition-all duration-500 ' + getProgressBarColor(quarterlyPerformance)" 
                [style.width.%]="Math.min(quarterlyPerformance, 100)">
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Metrics -->
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <p class="text-lg font-bold text-green-600">{{ wonOpportunities }}</p>
            <p class="text-xs text-gray-500">Deals Won (Q{{ currentQuarter }})</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-blue-600">{{ conversionRate }}%</p>
            <p class="text-xs text-gray-500">Conversion Rate</p>
          </div>
        </div>
      </div>

      <!-- Target Management (Admin Only) -->
      <div *ngIf="isAdmin" class="mt-6 pt-4 border-t border-gray-200">
        <button 
          (click)="openTargetSettings()"
          class="w-full text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-600 transition-colors">
          <i class="fas fa-cog mr-2"></i>
          Manage Targets
        </button>
      </div>

      <!-- Real-time Update Indicator -->
      <div class="flex items-center justify-center mt-4 text-xs text-gray-400" *ngIf="isLoading">
        <i class="fas fa-sync-alt animate-spin mr-1"></i>
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

  Math = Math; // Expose Math to template

  constructor(
    private opportunityService: OpportunityService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadFinancialData();
    this.loadTargets();
  }

  private async loadTargets(): Promise<void> {
    try {
      this.salesTargets = await this.settingsService.getCurrentTargets();
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

    // Get won opportunities
    const wonOpportunities = opportunities.filter(opp => opp.stage === 'closed-won');
    
    // Calculate quarterly revenue
    const quarterlyWonOpps = wonOpportunities.filter(opp => {
      if (!opp.createdAt) return false;
      const oppDate = opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt);
      return oppDate >= quarterStart && oppDate <= quarterEnd;
    });
    
    // Calculate annual revenue
    const annualWonOpps = wonOpportunities.filter(opp => {
      if (!opp.createdAt) return false;
      const oppDate = opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt);
      return oppDate >= yearStart && oppDate <= yearEnd;
    });

    this.quarterlyRevenue = quarterlyWonOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
    this.annualRevenue = annualWonOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
    this.wonOpportunities = quarterlyWonOpps.length;

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
    this.conversionRate = totalOpportunities > 0 
      ? Math.round((wonOpportunities.length / totalOpportunities) * 100)
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
