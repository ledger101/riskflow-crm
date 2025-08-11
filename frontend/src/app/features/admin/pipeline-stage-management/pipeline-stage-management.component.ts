import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineStage } from '../../../shared/models/pipeline-stage.model';

@Component({
  selector: 'app-pipeline-stage-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Pipeline Stage Management</h1>
          <p class="text-gray-600">Manage sales pipeline stages and their default probabilities</p>
        </div>
        <div class="flex space-x-3">
          <button 
            (click)="openCreateForm()"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Stage
          </button>
          <a routerLink="/opportunities" 
             class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Opportunities
          </a>
        </div>
      </div>

      <!-- Form Modal -->
      <div *ngIf="showForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg leading-6 font-medium text-gray-900 text-center mb-4">
              {{ isEditMode ? 'Edit Pipeline Stage' : 'Create New Pipeline Stage' }}
            </h3>
            <form [formGroup]="stageForm" (ngSubmit)="saveStage()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Stage Name</label>
                <input 
                  type="text" 
                  formControlName="name" 
                  placeholder="e.g., Prospecting, Proposal, Negotiation"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <div *ngIf="stageForm.get('name')?.invalid && stageForm.get('name')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  Stage name is required
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Default Probability (%)</label>
                <input 
                  type="number" 
                  formControlName="defaultProbability" 
                  min="0" max="100" step="1"
                  placeholder="e.g., 25, 50, 75"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <div *ngIf="stageForm.get('defaultProbability')?.invalid && stageForm.get('defaultProbability')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  <span *ngIf="stageForm.get('defaultProbability')?.errors?.['required']">Default probability is required</span>
                  <span *ngIf="stageForm.get('defaultProbability')?.errors?.['min'] || stageForm.get('defaultProbability')?.errors?.['max']">
                    Probability must be between 0 and 100
                  </span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Display Order</label>
                <input 
                  type="number" 
                  formControlName="order" 
                  min="0" step="1"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <div class="text-gray-500 text-sm mt-1">
                  Lower numbers appear first in dropdowns
                </div>
              </div>
              
              <div class="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  [disabled]="stageForm.invalid || saving"
                  class="flex-1 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded">
                  {{ saving ? 'Saving...' : (isEditMode ? 'Update Stage' : 'Create Stage') }}
                </button>
                <button 
                  type="button"
                  (click)="closeForm()" 
                  class="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Stages Table -->
      <div *ngIf="stages.length > 0; else noStages" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default Probability
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let stage of stages" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ stage.order }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ stage.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-3">
                      <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="stage.defaultProbability"></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ stage.defaultProbability }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      (click)="openEditForm(stage)" 
                      class="text-blue-600 hover:text-blue-800 font-medium">
                      Edit
                    </button>
                    <button 
                      (click)="deleteStage(stage)"
                      [disabled]="deleting === stage.id" 
                      class="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400">
                      {{ deleting === stage.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #noStages>
        <div class="text-center py-12 bg-white rounded-lg shadow">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No pipeline stages</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating your first pipeline stage.</p>
          <div class="mt-6">
            <button 
              (click)="openCreateForm()"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Create First Stage
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class PipelineStageManagementComponent implements OnInit {
  stages: PipelineStage[] = [];
  stageForm: FormGroup;
  showForm = false;
  isEditMode = false;
  currentStageId: string | null = null;
  saving = false;
  deleting: string | null = null;

  constructor(
    private pipelineStageService: PipelineStageService,
    private fb: FormBuilder
  ) {
    this.stageForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      defaultProbability: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      order: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this.pipelineStageService.getStages().subscribe({
      next: (stages) => {
        this.stages = stages.sort((a, b) => a.order - b.order);
      },
      error: (error) => {
        console.error('Error loading stages:', error);
      }
    });
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.currentStageId = null;
    
    // Set default order to be the next available
    const nextOrder = this.stages.length > 0 ? Math.max(...this.stages.map(s => s.order)) + 1 : 0;
    
    this.stageForm.reset({
      name: '',
      defaultProbability: 50,
      order: nextOrder
    });
  }

  openEditForm(stage: PipelineStage): void {
    this.isEditMode = true;
    this.showForm = true;
    this.currentStageId = stage.id;
    
    this.stageForm.patchValue({
      name: stage.name,
      defaultProbability: stage.defaultProbability,
      order: stage.order
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.currentStageId = null;
    this.isEditMode = false;
    this.stageForm.reset();
  }

  async saveStage(): Promise<void> {
    if (this.stageForm.invalid || this.saving) {
      return;
    }

    this.saving = true;
    
    try {
      const stageData = this.stageForm.value;

      if (this.isEditMode && this.currentStageId) {
        await this.pipelineStageService.updateStage({ 
          id: this.currentStageId, 
          ...stageData 
        });
      } else {
        await this.pipelineStageService.addStage(stageData);
      }
      
      this.closeForm();
    } catch (error) {
      console.error('Error saving stage:', error);
      alert('Failed to save stage. Please try again.');
    } finally {
      this.saving = false;
    }
  }

  async deleteStage(stage: PipelineStage): Promise<void> {
    if (!confirm(`Are you sure you want to delete the "${stage.name}" stage? This action cannot be undone.`)) {
      return;
    }

    this.deleting = stage.id;
    
    try {
      await this.pipelineStageService.deleteStage(stage.id);
    } catch (error) {
      console.error('Error deleting stage:', error);
      alert('Failed to delete stage. Please try again.');
    } finally {
      this.deleting = null;
    }
  }
}
