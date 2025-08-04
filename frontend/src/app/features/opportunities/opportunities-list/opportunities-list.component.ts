import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ExportService } from '../../../core/services/export.service';
import { UserService, AppUser } from '../../../core/services/user.service';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { ExportDialogComponent, ExportConfig } from '../../../shared/components/export-dialog.component';

@Component({
  selector: 'app-opportunities-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportDialogComponent],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold">Opportunities</h1>
          <div *ngIf="activeStageFilter" class="mt-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Filtered by: {{ getStageDisplayName(activeStageFilter) }}
              <button (click)="clearStageFilter()" class="ml-2 text-blue-600 hover:text-blue-800">
                <i class="fas fa-times"></i>
              </button>
            </span>
          </div>
        </div>
        <div class="flex space-x-3">
          <button 
            (click)="showExportDialog = true"
            [disabled]="sortedOpportunities.length === 0"
            class="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
            </svg>
            Export ({{ sortedOpportunities.length }})
          </button>
          <a routerLink="/opportunities/create" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Opportunity
          </a>
        </div>
      </div>

      <!-- Stage Filters -->
      <div class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button 
            (click)="filterByStage('')"
            [ngClass]="!activeStageFilter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            class="px-3 py-1 rounded-md text-sm font-medium transition-colors">
            All Stages ({{ opportunities.length }})
          </button>
          <button 
            *ngFor="let stage of availableStages"
            (click)="filterByStage(stage.key)"
            [ngClass]="activeStageFilter === stage.key ? 'text-white ' + stage.bgColor : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            class="px-3 py-1 rounded-md text-sm font-medium transition-colors">
            {{ stage.name }} ({{ getStageCount(stage.key) }})
          </button>
        </div>
      </div>

      <div *ngIf="sortedOpportunities.length > 0; else noOpportunities">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg shadow">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('clientName')">
                  Client
                  <i *ngIf="sortField === 'clientName'" [ngClass]="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                </th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('solutionName')">
                  Solution
                  <i *ngIf="sortField === 'solutionName'" [ngClass]="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                </th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('value')">
                  Value
                  <i *ngIf="sortField === 'value'" [ngClass]="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                </th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('stage')">
                  Stage
                  <i *ngIf="sortField === 'stage'" [ngClass]="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                </th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('probability')">
                  Probability
                  <i *ngIf="sortField === 'probability'" [ngClass]="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                </th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('ownerId')">
                  Owner
                  <i *ngIf="sortField === 'ownerId'" [ngClass]="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
                </th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let opp of sortedOpportunities" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ opp.clientName }}</div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="text-gray-900">{{ opp.solutionName }}</div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="font-semibold text-gray-900">{{ opp.value | currency:'USD':'symbol':'1.0-0' }}</div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <span [ngClass]="getStageColor(opp.stage)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStageDisplayName(opp.stage) }}
                  </span>
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div [ngClass]="getProbabilityColor(opp.probability)" class="h-2 rounded-full transition-all duration-300" 
                           [style.width.%]="opp.probability"></div>
                    </div>
                    <span class="text-sm text-gray-600">{{ opp.probability }}%</span>
                  </div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap text-gray-900">
                  {{ getOwnerName(opp.ownerId) }}
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <a [routerLink]="['/opportunities', opp.id]" 
                       class="text-blue-600 hover:text-blue-800 font-medium">View</a>
                    <a [routerLink]="['/opportunities', opp.id, 'edit']" 
                       class="text-green-600 hover:text-green-800 font-medium">Edit</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #noOpportunities>
        <div class="text-center py-8">
          <i class="fas fa-search text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500 text-lg">{{ activeStageFilter ? 'No opportunities found for this stage.' : 'No opportunities found.' }}</p>
          <a routerLink="/opportunities/create" class="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create First Opportunity
          </a>
        </div>
      </ng-template>
    </div>

    <!-- Export Dialog -->
    <app-export-dialog
      *ngIf="showExportDialog"
      [totalRecords]="sortedOpportunities.length"
      [hasActiveFilters]="!!activeStageFilter"
      (export)="onExport($event)"
      (cancel)="showExportDialog = false">
    </app-export-dialog>
  `
})
export class OpportunitiesListComponent implements OnInit {
  opportunities: Opportunity[] = [];
  sortedOpportunities: Opportunity[] = [];
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  activeStageFilter: string = '';
  showExportDialog = false;
  users: AppUser[] = [];
  usersMap: Map<string, AppUser> = new Map();

  availableStages = [
    { name: 'Prospecting', key: 'prospecting', bgColor: 'bg-gray-500', textColor: 'text-gray-100' },
    { name: 'Qualification', key: 'qualification', bgColor: 'bg-blue-500', textColor: 'text-blue-100' },
    { name: 'Proposal', key: 'proposal', bgColor: 'bg-yellow-500', textColor: 'text-yellow-100' },
    { name: 'Negotiation', key: 'negotiation', bgColor: 'bg-orange-500', textColor: 'text-orange-100' },
    { name: 'Closed Won', key: 'closed-won', bgColor: 'bg-green-500', textColor: 'text-green-100' },
    { name: 'Closed Lost', key: 'closed-lost', bgColor: 'bg-red-500', textColor: 'text-red-100' }
  ];

  constructor(
    private opportunityService: OpportunityService,
    private exportService: ExportService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    // Check for stage filter from query params (from pipeline widget)
    this.route.queryParams.subscribe(params => {
      if (params['stage']) {
        this.activeStageFilter = params['stage'];
      }
    });

    try {
      // Load users first to create the lookup map
      const users = await this.userService.getUsers();
      this.users = users;
      this.usersMap = new Map(users.map(user => [user.id, user]));

      // Then load opportunities
      const data = await this.opportunityService.getOpportunities();
      this.opportunities = data;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private applyFilters(): void {
    let filtered = [...this.opportunities];
    
    if (this.activeStageFilter) {
      filtered = filtered.filter(opp => opp.stage === this.activeStageFilter);
    }
    
    this.sortedOpportunities = filtered;
    this.applySorting();
  }

  filterByStage(stageKey: string): void {
    this.activeStageFilter = stageKey;
    
    // Update URL to reflect filter
    const queryParams = stageKey ? { stage: stageKey } : {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
    
    this.applyFilters();
  }

  clearStageFilter(): void {
    this.filterByStage('');
  }

  getStageCount(stageKey: string): number {
    return this.opportunities.filter(opp => opp.stage === stageKey).length;
  }

  getStageDisplayName(stageKey: string): string {
    const stage = this.availableStages.find(s => s.key === stageKey);
    return stage ? stage.name : stageKey;
  }

  getOwnerName(ownerId: string): string {
    const user = this.usersMap.get(ownerId);
    return user?.name || ownerId;
  }

  getStageColor(stageKey: string): string {
    const stage = this.availableStages.find(s => s.key === stageKey);
    if (!stage) return 'bg-gray-100 text-gray-800';
    
    return `${stage.bgColor} ${stage.textColor}`;
  }

  getProbabilityColor(probability: number): string {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-yellow-500';
    if (probability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.applySorting();
  }

  private applySorting(): void {
    this.sortedOpportunities = [...this.sortedOpportunities].sort((a, b) => {
      const aValue = (a as any)[this.sortField];
      const bValue = (b as any)[this.sortField];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  async onExport(config: ExportConfig): Promise<void> {
    try {
      const filterInfo = this.activeStageFilter ? 
        `Stage: ${this.getStageDisplayName(this.activeStageFilter)}` : 
        'All stages';

      await this.exportService.exportOpportunities(this.sortedOpportunities, {
        format: config.format,
        filename: config.filename,
        includeFilters: config.includeFilters,
        filterInfo: config.includeFilters ? filterInfo : undefined
      });

      this.showExportDialog = false;
      
      // Show success message (you could add a toast service here)
      console.log(`Successfully exported ${this.sortedOpportunities.length} opportunities as ${config.format.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      // Show error message (you could add a toast service here)
      alert('Export failed. Please try again.');
    }
  }
}
