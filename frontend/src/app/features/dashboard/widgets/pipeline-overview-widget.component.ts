import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

interface PipelineStage {
  name: string;
  key: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-pipeline-overview-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">Sales Pipeline Overview</h3>
        <div class="text-sm text-gray-500">
          <span class="font-medium">{{ totalOpportunities }}</span> total opportunities
        </div>
      </div>
      
      <!-- Pipeline Funnel Visualization -->
      <div class="space-y-3 mb-6">
        <div *ngFor="let stage of pipelineStages; let i = index" 
             (click)="navigateToStage(stage.key)"
             class="relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
             [style.width.%]="getFunnelWidth(i)">
          
          <!-- Stage Container -->
          <div [ngClass]="'relative p-4 rounded-lg border-2 border-opacity-20 ' + stage.bgColor + ' border-current'"
               [style.margin-left.%]="getFunnelMargin(i)">
            
            <!-- Stage Content -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div [ngClass]="'w-4 h-4 rounded-full mr-3 ' + stage.color"></div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ stage.name }}</h4>
                  <p class="text-sm text-gray-600">{{ stage.count }} opportunities</p>
                </div>
              </div>
              
              <div class="text-right">
                <p class="font-bold text-lg text-gray-900">{{ stage.value | currency }}</p>
                <p class="text-sm text-gray-500">{{ stage.percentage }}% of total</p>
              </div>
            </div>
            
            <!-- Progress Indicator -->
            <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div [ngClass]="'h-2 rounded-full transition-all duration-300 ' + stage.color" 
                   [style.width.%]="stage.percentage"></div>
            </div>
            
            <!-- Click Indicator -->
            <div class="absolute top-2 right-2 opacity-60">
              <i class="fas fa-external-link-alt text-xs text-gray-500"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline Summary -->
      <div class="pt-4 border-t border-gray-200">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold text-blue-600">{{ totalOpportunities }}</p>
            <p class="text-xs text-gray-500">Total Opportunities</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600">{{ totalValue | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-gray-500">Total Pipeline Value</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-purple-600">{{ averageDealSize | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-gray-500">Avg Deal Size</p>
          </div>
        </div>
      </div>

      <!-- Real-time Update Indicator -->
      <div class="flex items-center justify-center mt-4 text-xs text-gray-400" *ngIf="isLoading">
        <i class="fas fa-sync-alt animate-spin mr-1"></i>
        Updating pipeline data...
      </div>
    </div>
  `
})
export class PipelineOverviewWidgetComponent implements OnInit {
  pipelineStages: PipelineStage[] = [];
  totalOpportunities = 0;
  totalValue = 0;
  averageDealSize = 0;
  isLoading = false;

  private readonly stageDefinitions = [
    { name: 'Prospecting', key: 'prospecting', color: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
    { name: 'Qualification', key: 'qualification', color: 'bg-blue-400', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { name: 'Proposal', key: 'proposal', color: 'bg-yellow-400', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { name: 'Negotiation', key: 'negotiation', color: 'bg-orange-400', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    { name: 'Closed Won', key: 'closed-won', color: 'bg-green-400', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { name: 'Closed Lost', key: 'closed-lost', color: 'bg-red-400', bgColor: 'bg-red-50', textColor: 'text-red-700' }
  ];

  constructor(
    private opportunityService: OpportunityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPipelineData();
  }

  private async loadPipelineData(): Promise<void> {
    try {
      this.isLoading = true;
      const opportunities = await this.opportunityService.getOpportunities();
      this.calculatePipelineStages(opportunities);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private calculatePipelineStages(opportunities: Opportunity[]): void {
    this.totalOpportunities = opportunities.length;
    this.totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    this.averageDealSize = this.totalOpportunities > 0 ? this.totalValue / this.totalOpportunities : 0;

    this.pipelineStages = this.stageDefinitions.map(stageDef => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stageDef.key);
      const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
      const percentage = this.totalValue > 0 ? (stageValue / this.totalValue) * 100 : 0;
      
      return {
        name: stageDef.name,
        key: stageDef.key,
        count: stageOpportunities.length,
        value: stageValue,
        percentage: Math.round(percentage),
        color: stageDef.color,
        bgColor: stageDef.bgColor,
        textColor: stageDef.textColor
      };
    });
  }

  getFunnelWidth(index: number): number {
    // Create funnel effect - stages get progressively narrower
    const baseWidth = 100;
    const reduction = index * 8; // 8% reduction per stage
    return Math.max(baseWidth - reduction, 60); // Minimum 60% width
  }

  getFunnelMargin(index: number): number {
    // Center alignment as funnel narrows
    return index * 4; // 4% left margin increase per stage
  }

  navigateToStage(stageKey: string): void {
    // Navigate to opportunities list with stage filter
    this.router.navigate(['/opportunities'], { 
      queryParams: { 
        stage: stageKey,
        from: 'pipeline-widget'
      } 
    });
  }
}
