import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineStage as DomainPipelineStage } from '../../../shared/models/pipeline-stage.model';
import { Subscription } from 'rxjs';

interface PipelineStageDisplay {
  id: string;
  name: string;
  key: string; // slug of name for routing/filtering
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
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">Sales Pipeline Overview</h3>
        <div class="text-sm text-gray-600">
          <span class="font-semibold">{{ totalOpportunities }}</span> total opportunities
        </div>
      </div>
      
      <!-- Pipeline Stage Cards - Equal Size Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div *ngFor="let stage of pipelineStages; let i = index" 
             (click)="navigateToStage(stage.key)"
             class="relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group">
          
          <!-- Stage Card -->
          <div [ngClass]="'relative p-5 rounded-xl border-2 h-full flex flex-col ' + stage.bgColor"
               [style.border-color]="getColorHex(stage.color)">
            
            <!-- Stage Header -->
            <div class="flex items-center justify-between mb-4">
              <div [ngClass]="'w-10 h-10 rounded-lg flex items-center justify-center ' + stage.color">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <ng-container [ngSwitch]="getStageIconType(stage)">
                    <!-- Prospect/Lead icon -->
                    <path *ngSwitchCase="'prospect'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    <!-- Qualification/Check icon -->
                    <path *ngSwitchCase="'qualification'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    <!-- Proposal/Document icon -->
                    <path *ngSwitchCase="'proposal'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    <!-- Won/Star icon -->
                    <path *ngSwitchCase="'won'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    <!-- Default/Generic icon -->
                    <path *ngSwitchDefault stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </ng-container>
                </svg>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
            
            <!-- Stage Content -->
            <div class="flex-1">
              <h4 class="font-bold text-lg text-gray-900 mb-2">{{ stage.name }}</h4>
              <div class="space-y-2">
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-gray-600">Value</span>
                  <span class="font-bold text-xl text-gray-900">{{ stage.value | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-gray-600">Count</span>
                  <span class="font-semibold text-lg text-gray-700">{{ stage.count }}</span>
                </div>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs text-gray-500">% of Total</span>
                <span class="text-sm font-semibold text-gray-700">{{ stage.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [ngClass]="'h-2 rounded-full transition-all duration-500 ' + stage.color" 
                     [style.width.%]="stage.percentage"></div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!isLoading && pipelineStages.length === 0" class="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-sm text-gray-500 py-8">
          No pipeline stages configured yet.
        </div>
      </div>

      <!-- Pipeline Summary -->
      <div class="pt-6 border-t border-gray-200" *ngIf="pipelineStages.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <p class="text-3xl font-bold text-blue-600 mb-1">{{ totalOpportunities }}</p>
            <p class="text-sm text-gray-600 font-medium">Total Opportunities</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-3xl font-bold text-green-600 mb-1">{{ totalValue | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-sm text-gray-600 font-medium">Total Pipeline Value</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <p class="text-3xl font-bold text-purple-600 mb-1">{{ averageDealSize | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-sm text-gray-600 font-medium">Avg Deal Size</p>
          </div>
        </div>
      </div>

      <!-- Real-time Update Indicator -->
      <div class="flex items-center justify-center mt-4 text-xs text-gray-400" *ngIf="isLoading">
        <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Updating pipeline data...
      </div>
    </div>
  `
})
export class PipelineOverviewWidgetComponent implements OnInit, OnDestroy {
  pipelineStages: PipelineStageDisplay[] = [];
  totalOpportunities = 0;
  totalValue = 0;
  averageDealSize = 0;
  isLoading = false;

  // Color palettes to assign dynamically (extend as needed)
  private readonly colorPalette = [
    { color: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-700' },
    { color: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
    { color: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { color: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
    { color: 'bg-green-400', bg: 'bg-green-50', text: 'text-green-700' },
    { color: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-700' },
    { color: 'bg-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    { color: 'bg-teal-400', bg: 'bg-teal-50', text: 'text-teal-700' }
  ];

  private stagesSub?: Subscription;
  private oppSub?: Subscription;
  private opportunities: Opportunity[] = [];

  constructor(
    private opportunityService: OpportunityService,
    private pipelineStageService: PipelineStageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDataFlow();
  }

  ngOnDestroy(): void {
  this.stagesSub?.unsubscribe();
  this.oppSub?.unsubscribe();
  }

  private async initializeDataFlow(): Promise<void> {
    this.isLoading = true;
    try {
      // Ensure default stages exist (safe no-op if already present)
      await this.pipelineStageService.seedDefaultStages();
      // Subscribe to real-time opportunities and stages
      this.oppSub = this.opportunityService.getOpportunitiesStream().subscribe({
        next: opps => {
          this.opportunities = opps;
          // Rebuild with latest stages if already loaded
          if (this.pipelineStages.length) {
            // Use last known stage ids to fetch ordering for rebuild
            this.pipelineStageService.getStagesPromise().then(stages => this.buildPipeline(stages, this.opportunities));
          }
        },
        error: err => console.error('Opportunities stream error:', err)
      });
      this.stagesSub = this.pipelineStageService.getStages().subscribe({
        next: stages => this.buildPipeline(stages, this.opportunities),
        error: err => console.error('Pipeline stages stream error:', err)
      });
    } catch (error) {
      console.error('Error initializing pipeline data flow:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private buildPipeline(stages: DomainPipelineStage[], opportunities: Opportunity[]): void {
    this.totalOpportunities = opportunities.length;
    this.totalValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
    this.averageDealSize = this.totalOpportunities ? this.totalValue / this.totalOpportunities : 0;

    // Aggregate value for each stage
    const displayStages: PipelineStageDisplay[] = stages
      .sort((a, b) => a.order - b.order)
      .map((stage, idx) => {
        const key = this.slugify(stage.name);
        // Match opportunities where stage field matches (id | name | slug)
        const matching = opportunities.filter(o => {
          const normalized = o.stage?.toLowerCase?.();
          const normalizedId = o.stageId?.toLowerCase?.();
          return normalizedId === stage.id.toLowerCase() ||
                 normalized === stage.id.toLowerCase() ||
                 normalized === stage.name.toLowerCase() ||
                 normalized === key;
        });
  const value = matching.reduce((sum, o) => sum + Number(o.value || 0), 0);
        const palette = this.colorPalette[idx % this.colorPalette.length];
        return {
          id: stage.id,
          name: stage.name,
          key,
          count: matching.length,
          value, // aggregated value for this stage
          percentage: this.totalValue ? Math.round((value / this.totalValue) * 100) : 0,
          color: palette.color,
          bgColor: palette.bg,
          textColor: palette.text
        } as PipelineStageDisplay;
      })
      .filter(stage => stage.count > 0 && stage.value > 0);

    this.pipelineStages = displayStages;
  }

  getColorHex(colorClass: string): string {
    // Map Tailwind color classes to hex values for border-color
    const colorMap: { [key: string]: string } = {
      'bg-gray-400': '#9CA3AF',
      'bg-blue-400': '#60A5FA',
      'bg-yellow-400': '#FBBF24',
      'bg-orange-400': '#FB923C',
      'bg-green-400': '#4ADE80',
      'bg-red-400': '#F87171',
      'bg-indigo-400': '#818CF8',
      'bg-teal-400': '#2DD4BF'
    };
    return colorMap[colorClass] || '#9CA3AF';
  }

  getStageIconType(stage: PipelineStageDisplay): string {
    // Determine icon type based on stage name/key
    const key = stage.key.toLowerCase();
    const name = stage.name.toLowerCase();
    
    if (key.includes('prospect') || name.includes('prospect') || key.includes('lead') || name.includes('lead')) {
      return 'prospect';
    } else if (key.includes('qualif') || name.includes('qualif')) {
      return 'qualification';
    } else if (key.includes('proposal') || name.includes('proposal') || key.includes('negotiat') || name.includes('negotiat')) {
      return 'proposal';
    } else if (key.includes('won') || name.includes('won') || key.includes('closed') || name.includes('closed')) {
      return 'won';
    }
    
    return 'default';
  }

  navigateToStage(stageKey: string): void {
    // stageKey passed in *currently* is slug; find stage id to route consistently by id
    const target = this.pipelineStages.find(ps => ps.key === stageKey);
    const routeStage = target ? target.id : stageKey; // fallback to provided key if not found
    this.router.navigate(['/opportunities'], {
      queryParams: {
        stage: routeStage,
        from: 'pipeline-widget'
      }
    });
  }
}
