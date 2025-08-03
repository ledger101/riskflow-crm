import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ClientService } from '../../../core/services/client.service';
import { SolutionService } from '../../../core/services/solution.service';
import { AuthService } from '../../../core/services/auth.service';
import { Client } from '../../../shared/models/client.model';
import { Solution } from '../../../shared/models/solution.model';
import { Opportunity } from '../../../shared/models/opportunity.model';

@Component({
  selector: 'app-opportunity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Edit' : 'Create' }} Opportunity</h1>
      
      <form [formGroup]="opportunityForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="clientId" class="block text-sm font-medium text-gray-700">Client</label>
          <select 
            id="clientId" 
            formControlName="clientId" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('clientId')?.invalid && opportunityForm.get('clientId')?.touched">
            <option value="">Select a client</option>
            <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
          </select>
          <div *ngIf="opportunityForm.get('clientId')?.invalid && opportunityForm.get('clientId')?.touched" 
               class="text-red-500 text-sm mt-1">
            Client is required
          </div>
        </div>

        <div>
          <label for="solutionId" class="block text-sm font-medium text-gray-700">Solution</label>
          <select 
            id="solutionId" 
            formControlName="solutionId" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('solutionId')?.invalid && opportunityForm.get('solutionId')?.touched">
            <option value="">Select a solution</option>
            <option *ngFor="let solution of solutions" [value]="solution.id">{{ solution.name }}</option>
          </select>
          <div *ngIf="opportunityForm.get('solutionId')?.invalid && opportunityForm.get('solutionId')?.touched" 
               class="text-red-500 text-sm mt-1">
            Solution is required
          </div>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea 
            id="description" 
            formControlName="description" 
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('description')?.invalid && opportunityForm.get('description')?.touched">
          </textarea>
          <div *ngIf="opportunityForm.get('description')?.invalid && opportunityForm.get('description')?.touched" 
               class="text-red-500 text-sm mt-1">
            Description is required
          </div>
        </div>

        <div>
          <label for="value" class="block text-sm font-medium text-gray-700">Value ($)</label>
          <input 
            type="number" 
            id="value" 
            formControlName="value" 
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('value')?.invalid && opportunityForm.get('value')?.touched">
          <div *ngIf="opportunityForm.get('value')?.invalid && opportunityForm.get('value')?.touched" 
               class="text-red-500 text-sm mt-1">
            Value must be a positive number
          </div>
        </div>

        <div>
          <label for="probability" class="block text-sm font-medium text-gray-700">Probability (%)</label>
          <input 
            type="number" 
            id="probability" 
            formControlName="probability" 
            min="0" 
            max="100"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('probability')?.invalid && opportunityForm.get('probability')?.touched">
          <div *ngIf="opportunityForm.get('probability')?.invalid && opportunityForm.get('probability')?.touched" 
               class="text-red-500 text-sm mt-1">
            Probability must be between 0 and 100
          </div>
        </div>

        <div>
          <label for="stage" class="block text-sm font-medium text-gray-700">Stage</label>
          <select 
            id="stage" 
            formControlName="stage" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('stage')?.invalid && opportunityForm.get('stage')?.touched">
            <option value="">Select a stage</option>
            <option value="Lead">Lead</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Awarded">Awarded</option>
            <option value="Lost">Lost</option>
          </select>
          <div *ngIf="opportunityForm.get('stage')?.invalid && opportunityForm.get('stage')?.touched" 
               class="text-red-500 text-sm mt-1">
            Stage is required
          </div>
        </div>

        <div>
          <label for="ownerId" class="block text-sm font-medium text-gray-700">Owner</label>
          <input 
            type="text" 
            id="ownerId" 
            formControlName="ownerId" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [class.border-red-500]="opportunityForm.get('ownerId')?.invalid && opportunityForm.get('ownerId')?.touched">
          <div *ngIf="opportunityForm.get('ownerId')?.invalid && opportunityForm.get('ownerId')?.touched" 
               class="text-red-500 text-sm mt-1">
            Owner is required
          </div>
        </div>

        <div class="flex space-x-4 pt-4">
          <button 
            type="submit" 
            [disabled]="opportunityForm.invalid || loading"
            class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">
            {{ loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }} Opportunity
          </button>
          <button 
            type="button" 
            (click)="goBack()"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </form>

      <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>
    </div>
  `
})
export class OpportunityFormComponent implements OnInit {
  opportunityForm: FormGroup;
  clients: Client[] = [];
  solutions: Solution[] = [];
  loading = false;
  errorMessage: string | null = null;
  isEditMode = false;
  opportunityId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private opportunityService: OpportunityService,
    private clientService: ClientService,
    private solutionService: SolutionService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.opportunityForm = this.fb.group({
      clientId: ['', Validators.required],
      solutionId: ['', Validators.required],
      description: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      probability: [25, [Validators.required, Validators.min(0), Validators.max(100)]],
      stage: ['Lead', Validators.required],
      ownerId: ['', Validators.required]
    });
  }

  async ngOnInit() {
    // Check if this is edit mode
    this.opportunityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.opportunityId;

    // Load dropdown data
    await this.loadClients();
    await this.loadSolutions();
    
    // Set default owner to current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.opportunityForm.patchValue({ ownerId: currentUser.uid });
    }

    // If edit mode, load the opportunity data
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
          stage: opportunity.stage,
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
      
      // Get client and solution names for denormalization
      const selectedClient = this.clients.find(c => c.id === formValue.clientId);
      const selectedSolution = this.solutions.find(s => s.id === formValue.solutionId);

      const opportunityData = {
        ...formValue,
        clientName: selectedClient?.name || '',
        solutionName: selectedSolution?.name || ''
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
}
