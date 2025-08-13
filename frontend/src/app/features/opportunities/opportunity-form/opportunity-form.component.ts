import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ClientService } from '../../../core/services/client.service';
import { SolutionService } from '../../../core/services/solution.service';
import { AuthService } from '../../../core/services/auth.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { Client } from '../../../shared/models/client.model';
import { Solution } from '../../../shared/models/solution.model';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { PipelineStage } from '../../../shared/models/pipeline-stage.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-opportunity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-lg">
      <div class="p-6 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold">{{ isEditMode ? 'Edit Opportunity' : 'Create New Opportunity' }}</h2>
          <p class="text-sm text-muted">Manage the details for this sales deal.</p>
        </div>
        <button *ngIf="isEditMode" type="button" (click)="confirmDelete()" [disabled]="loading || deleting"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white h-9 px-3 py-1 disabled:opacity-50">
          <span *ngIf="!deleting">Delete</span>
          <span *ngIf="deleting" class="flex items-center"><span class="animate-spin mr-2 h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>Deleting...</span>
        </button>
      </div>
      <div class="tabs">
        <div class="tab" *ngIf="isEditMode">
          <h3 class="text-lg font-semibold">Change History</h3>
          <ul>
            <li *ngFor="let log of changeLogs">
              <p>{{ log.date }} - {{ log.user }}: {{ log.description }}</p>
            </li>
          </ul>
        </div>
        <div class="tab">
          <form [formGroup]="opportunityForm" (ngSubmit)="onSubmit()" class="p-6 pt-0">
            <div class="grid grid-cols-2 gap-x-4 gap-y-6">
              <div class="col-span-2">
                <label for="clientId" class="block text-sm font-medium text-foreground mb-1">Client *</label>
                <select id="clientId" formControlName="clientId" required
                        class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select a client</option>
                  <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
                </select>
              </div>

              <div class="col-span-2">
                <label for="solutionId" class="block text-sm font-medium text-foreground mb-1">Solution(s) *</label>
                <select id="solutionId" formControlName="solutionId" required
                (change)="getOpportunityValue()"
                        class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select a solution</option>
                  <option *ngFor="let solution of solutions" [value]="solution.id">{{ solution.name }}</option>
                </select>
              </div>

              <div class="col-span-2">
                <label for="description" class="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea id="description" formControlName="description" rows="3"
                          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
              </div>

              <div class="col-span-1">
                <label for="value" class="block text-sm font-medium text-foreground mb-1">Value ($) *</label>
                <input type="number" id="value" formControlName="value" [readOnly]="true" required
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              </div>

              <div class="col-span-1">
                <label for="stageId" class="block text-sm font-medium text-foreground mb-1">Stage *</label>
                <select id="stageId" formControlName="stageId" required
                        (change)="onStageChange($event)"
                        class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select a stage</option>
                  <option *ngFor="let stage of stages" [value]="stage.id">{{ stage.name }}</option>
                </select>
              </div>

              <div class="col-span-1">
                <label for="probability" class="block text-sm font-medium text-foreground mb-1">Probability (%) *</label>
                <input type="number" id="probability" formControlName="probability" min="0" max="100" required
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              </div>

              <div class="col-span-1">
                <label for="ownerId" class="block text-sm font-medium text-foreground mb-1">Owner *</label>
                <select id="ownerId" formControlName="ownerId" required
                        class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select an owner</option>
                  <option *ngFor="let owner of owners" [value]="owner.id">{{ owner.name }} </option>
                </select>
              </div>
            </div>

            <div class="flex justify-end space-x-2 mt-6">
              <button type="button" (click)="goBack()" [disabled]="loading"
                      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Cancel
              </button>
              <button type="submit" [disabled]="opportunityForm.invalid || loading"
                      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                <span *ngIf="loading">Saving...</span>
                <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class OpportunityFormComponent implements OnInit {
  selectedSolution: Solution | undefined;
  getOpportunityValue() {
    const formValue = this.opportunityForm.value;
    const targetSolution = this.solutions.find(s => s.id === formValue.solutionId);
    
    if (targetSolution) {
      this.opportunityForm.patchValue({
        value: targetSolution.cost
      });
    }
  }
  opportunityForm: FormGroup;
  clients: Client[] = [];
  solutions: Solution[] = [];
  stages: PipelineStage[] = [];
  owners: { id: string; name?: string; email?: string; role?: string }[] = [];
  loading = false;
  errorMessage: string | null = null;
  isEditMode = false;
  opportunityId: string | null = null;
  changeLogs: { date: string; user: string; description: string }[] = [];
  deleting = false;

  constructor(
    private fb: FormBuilder,
    private opportunityService: OpportunityService,
    private clientService: ClientService,
    private solutionService: SolutionService,
    private authService: AuthService,
    private userService: UserService,
    private pipelineStageService: PipelineStageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.opportunityForm = this.fb.group({
      clientId: ['', Validators.required],
      solutionId: ['', Validators.required],
      description: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      probability: [25, [Validators.required, Validators.min(0), Validators.max(100)]],
  stageId: ['', Validators.required],
      ownerId: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.opportunityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.opportunityId;

    await this.loadClients();
    await this.loadSolutions();
    await this.loadStages();
    await this.loadOwners();

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.opportunityForm.patchValue({ ownerId: currentUser.uid });
    }

    if (this.isEditMode && this.opportunityId) {
      await this.loadOpportunity(this.opportunityId);
    }
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getClients();
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async loadSolutions() {
    try {
      this.solutions = await this.solutionService.getSolutions();
    } catch (error) {
      console.error('Error loading solutions:', error);
    }
  }

  async loadStages() {
    try {
      this.stages = await this.pipelineStageService.getStagesPromise();
    } catch (error) {
      console.error('Error loading stages:', error);
    }
  }

  async loadOwners() {
    try {
      this.owners = await this.userService.getUsers();
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  }

  onStageChange(event: any) {
    const stageId = event.target.value;
    const selectedStage = this.stages.find(s => s.id === stageId);
    if (selectedStage) {
      this.opportunityForm.get('probability')?.setValue(selectedStage.defaultProbability);
    }
  }

  async loadOpportunity(id: string) {
    try {
      const opportunity = await this.opportunityService.getOpportunityById(id);
      if (opportunity) {
        this.opportunityForm.patchValue({
          clientId: opportunity.clientId,
          solutionId: opportunity.solutionId,
          description: opportunity.description,
          value: opportunity.value,
          probability: opportunity.probability,
          stageId: opportunity.stageId || opportunity.stage,
          ownerId: opportunity.ownerId
        });
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
      this.errorMessage = 'Failed to load opportunity details';
    }
  }

  async onSubmit() {
    if (this.opportunityForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    try {
      const formValue = this.opportunityForm.value;

      const selectedClient = this.clients.find(c => c.id === formValue.clientId);
      this.selectedSolution = this.solutions.find(s => s.id === formValue.solutionId);

      const selectedStage = this.stages.find(s => s.id === formValue.stageId);
      const opportunityData = {
        ...formValue,
        clientName: selectedClient?.name || '',
        solutionName: this.selectedSolution?.name || '',
        stageId: selectedStage ? selectedStage.id : formValue.stageId
      };

      if (this.isEditMode && this.opportunityId) {
        await this.opportunityService.updateOpportunity(this.opportunityId, opportunityData);
      } else {
        await this.opportunityService.createOpportunity(opportunityData);
      }

      this.router.navigate(['/opportunities']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save opportunity';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/opportunities']);
  }

  async confirmDelete() {
    if (!this.isEditMode || !this.opportunityId) return;
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) return;
    this.deleting = true;
    try {
      await this.opportunityService.deleteOpportunity(this.opportunityId);
      this.router.navigate(['/opportunities']);
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete opportunity');
    } finally {
      this.deleting = false;
    }
  }
}
