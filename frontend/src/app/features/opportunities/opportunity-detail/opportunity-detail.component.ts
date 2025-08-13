import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { CommunicationService } from '../../../core/services/communication.service';
import { ActionItemService } from '../../../core/services/action-item.service';
import { AuthService } from '../../../core/services/auth.service';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { Communication } from '../../../shared/models/communication.model';
import { ActionItem } from '../../../shared/models/action-item.model';
import { UserService, AppUser } from '../../../core/services/user.service';

@Component({
  selector: 'app-opportunity-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div *ngIf="opportunity; else loading">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Opportunity Details</h1>
          <div class="space-x-2">
            <a [routerLink]="['/opportunities', opportunity.id, 'edit']" 
               class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Edit
            </a>
            <a routerLink="/opportunities" 
               class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Back to List
            </a>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ opportunity.description }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Opportunity information and details
            </p>
          </div>
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Client</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ opportunity.clientName }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Solution</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ opportunity.solutionName }}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Value</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">\${{ opportunity.value | number }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Stage</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="getStageClass(opportunity.stageId || opportunity.stage)">
                    {{ opportunity.stageId || opportunity.stage }}
                  </span>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Probability</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ opportunity.probability }}%</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Owner</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ ownerName }}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ getFormattedDate(opportunity.createdAt) }}
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ opportunity.description }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Communications Section -->
        <div class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Communications</h2>
            <button 
              (click)="showCommunicationForm = !showCommunicationForm"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
              {{ showCommunicationForm ? 'Cancel' : 'Add Communication' }}
            </button>
          </div>

          <!-- Debug Information -->
          <div class="bg-yellow-50 p-2 mb-4 text-sm text-gray-600">
            Debug: Communications array length: {{ communications.length }}
            <button (click)="addTestData()" 
                    class="ml-4 bg-purple-500 text-white px-2 py-1 rounded text-xs">
              Add Test Data
            </button>
          </div>

          <!-- Add Communication Form -->
          <div *ngIf="showCommunicationForm" class="bg-gray-50 p-4 rounded mb-4">
            <form [formGroup]="communicationForm" (ngSubmit)="addCommunication()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Type</label>
                  <select formControlName="type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="Email">Email</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Online Meeting">Online Meeting</option>
                    <option value="Physical Meeting">Physical Meeting</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Date</label>
                  <input type="datetime-local" formControlName="date" 
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Summary</label>
                <textarea formControlName="summary" rows="3" 
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
              </div>
              <button type="submit" [disabled]="communicationForm.invalid || communicationLoading"
                      class="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">
                {{ communicationLoading ? 'Saving...' : 'Add Communication' }}
              </button>
            </form>
          </div>

          <!-- Communications List -->
          <div class="space-y-4">
            <div *ngFor="let comm of communications" class="bg-white border rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ comm.type }}
                  </span>
                  <span class="text-sm text-gray-500">{{ getFormattedDate(comm.date) }}</span>
                </div>
              </div>
              <p class="text-gray-900">{{ comm.summary }}</p>
              <div *ngIf="comm.attachments && comm.attachments.length > 0" class="mt-2">
                <span class="text-sm text-gray-500">Attachments: {{ comm.attachments.length }}</span>
              </div>
            </div>
            <div *ngIf="communications.length === 0" class="text-gray-500 text-center py-4">
              No communications logged yet.
            </div>
          </div>
        </div>

        <!-- Action Items Section -->
        <div class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Action Items</h2>
            <button 
              (click)="showActionItemForm = !showActionItemForm"
              class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
              {{ showActionItemForm ? 'Cancel' : 'Add Action Item' }}
            </button>
          </div>

          <!-- Debug Information -->
          <div class="bg-yellow-50 p-2 mb-4 text-sm text-gray-600">
            Debug: Action items array length: {{ actionItems.length }}
          </div>

          <!-- Add Action Item Form -->
          <div *ngIf="showActionItemForm" class="bg-gray-50 p-4 rounded mb-4">
            <form [formGroup]="actionItemForm" (ngSubmit)="addActionItem()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" formControlName="description" 
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
                <input type="date" formControlName="dueDate" 
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>
              <button type="submit" [disabled]="actionItemForm.invalid || actionItemLoading"
                      class="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">
                {{ actionItemLoading ? 'Saving...' : 'Add Action Item' }}
              </button>
            </form>
          </div>

          <!-- Action Items List -->
          <div class="space-y-2">
            <div *ngFor="let item of openActionItems" class="bg-white border rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <input type="checkbox" 
                       [checked]="item.isComplete"
                       (change)="toggleActionItem(item)"
                       class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <div class="flex-1">
                  <p class="text-gray-900" [class.line-through]="item.isComplete">{{ item.description }}</p>
                  <div class="flex items-center space-x-4 mt-1">
                    <span *ngIf="item.dueDate" class="text-sm text-gray-500">
                      Due: {{ getFormattedDate(item.dueDate) }}
                    </span>
                    <span *ngIf="item.completedAt" class="text-sm text-green-600">
                      Completed: {{ getFormattedDate(item.completedAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Completed Action Items -->
            <div *ngIf="completedActionItems.length > 0" class="mt-4">
              <button (click)="showCompletedItems = !showCompletedItems" 
                      class="text-sm text-gray-600 hover:text-gray-800">
                {{ showCompletedItems ? 'Hide' : 'Show' }} Completed Items ({{ completedActionItems.length }})
              </button>
              <div *ngIf="showCompletedItems" class="mt-2 space-y-2">
                <div *ngFor="let item of completedActionItems" class="bg-gray-50 border rounded-lg p-4">
                  <div class="flex items-start space-x-3">
                    <input type="checkbox" 
                           [checked]="item.isComplete"
                           (change)="toggleActionItem(item)"
                           class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <div class="flex-1">
                      <p class="text-gray-600 line-through">{{ item.description }}</p>
                      <span class="text-sm text-green-600">
                        Completed: {{ getFormattedDate(item.completedAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="actionItems.length === 0" class="text-gray-500 text-center py-4">
              No action items created yet.
            </div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span class="ml-2 text-gray-600">Loading opportunity...</span>
        </div>
      </ng-template>
    </div>
  `
})
export class OpportunityDetailComponent implements OnInit {
getOwnerName(ownerId: string): string {
  // console.log(ownerId);
  
    const user = this.usersMap.get(ownerId);
    return user?.name || ownerId;
  }
  opportunity: Opportunity | null = null;
  communications: Communication[] = [];
  actionItems: ActionItem[] = [];
  loading = true;
  ownerName: string = '';
  users: AppUser[] = [];
    usersMap: Map<string, AppUser> = new Map();
  // Form states
  showCommunicationForm = false;
  showActionItemForm = false;
  showCompletedItems = false;
  communicationLoading = false;
  actionItemLoading = false;
  
  // Forms
  communicationForm: FormGroup;
  actionItemForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService,
    private communicationService: CommunicationService,
    private actionItemService: ActionItemService,
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.communicationForm = this.fb.group({
      type: ['Email', Validators.required],
      date: [new Date().toISOString().slice(0, 16), Validators.required],
      summary: ['', Validators.required]
    });

    this.actionItemForm = this.fb.group({
      description: ['', Validators.required],
      dueDate: ['']
    });
  }

  // Test method to add sample data
  async addTestData() {
    if (!this.opportunity) return;
    
    try {
      const currentUser = this.authService.getCurrentUser();
      
      // Add test communication
      await this.communicationService.addCommunication({
        opportunityId: this.opportunity.id,
        type: 'Email',
        date: new Date(),
        summary: 'Test communication - discussed project requirements',
        createdBy: currentUser?.uid || 'test-user'
      });

      // Add test action item
      await this.actionItemService.addActionItem({
        opportunityId: this.opportunity.id,
        description: 'Test action item - follow up with client',
        createdBy: currentUser?.uid || 'test-user'
      });

      // Reload data
      await this.loadCommunications(this.opportunity.id);
      await this.loadActionItems(this.opportunity.id);
      
      console.log('Test data added successfully');
    } catch (error) {
      console.error('Error adding test data:', error);
    }
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadOpportunity(id);
      if (this.opportunity) {
          const users = await this.userService.getUsers();
      this.users = users;
      this.usersMap = new Map(users.map(user => [user.id, user]));
         this.ownerName =  this.getOwnerName(this.opportunity.ownerId) ;
      console.log(this.ownerName);
        await Promise.all([
          this.loadCommunications(id),
          this.loadActionItems(id)
        ]);
      }
    }
  }

  async loadOpportunity(id: string) {
    try {
      console.log('Loading opportunity with ID:', id);
      this.opportunity = await this.opportunityService.getOpportunityById(id);
      console.log('Loaded opportunity:', this.opportunity);
   
      
      if (!this.opportunity) {
        console.error('Opportunity not found with ID:', id);
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadCommunications(opportunityId: string) {
    try {
      console.log('Loading communications for opportunity:', opportunityId);
      this.communications = await this.communicationService.getCommunicationsByOpportunity(opportunityId);
      console.log('Loaded communications:', this.communications);
    } catch (error) {
      console.error('Error loading communications:', error);
    }
  }

  async loadActionItems(opportunityId: string) {
    try {
      console.log('Loading action items for opportunity:', opportunityId);
      this.actionItems = await this.actionItemService.getActionItemsByOpportunity(opportunityId);
      console.log('Loaded action items:', this.actionItems);
    } catch (error) {
      console.error('Error loading action items:', error);
    }
  }

  async addCommunication() {
    if (this.communicationForm.invalid || !this.opportunity) return;

    this.communicationLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      const formValue = this.communicationForm.value;
      
      await this.communicationService.addCommunication({
        opportunityId: this.opportunity.id,
        type: formValue.type,
        date: new Date(formValue.date),
        summary: formValue.summary,
        createdBy: currentUser?.uid || 'unknown'
      });

      this.communicationForm.reset({
        type: 'Email',
        date: new Date().toISOString().slice(0, 16),
        summary: ''
      });
      this.showCommunicationForm = false;
      await this.loadCommunications(this.opportunity.id);
    } catch (error) {
      console.error('Error adding communication:', error);
    } finally {
      this.communicationLoading = false;
    }
  }

  async addActionItem() {
    if (this.actionItemForm.invalid || !this.opportunity) return;

    this.actionItemLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      const formValue = this.actionItemForm.value;
      
      const actionItemData: any = {
        opportunityId: this.opportunity.id,
        description: formValue.description,
        createdBy: currentUser?.uid || 'unknown'
      };

      if (formValue.dueDate) {
        actionItemData.dueDate = new Date(formValue.dueDate);
      }

      await this.actionItemService.addActionItem(actionItemData);

      this.actionItemForm.reset();
      this.showActionItemForm = false;
      await this.loadActionItems(this.opportunity.id);
    } catch (error) {
      console.error('Error adding action item:', error);
    } finally {
      this.actionItemLoading = false;
    }
  }

  async toggleActionItem(actionItem: ActionItem) {
    try {
      await this.actionItemService.toggleActionItemComplete(actionItem.id, !actionItem.isComplete);
      await this.loadActionItems(this.opportunity!.id);
    } catch (error) {
      console.error('Error toggling action item:', error);
    }
  }

  get openActionItems(): ActionItem[] {
    return this.actionItems.filter(item => !item.isComplete);
  }

  get completedActionItems(): ActionItem[] {
    return this.actionItems.filter(item => item.isComplete);
  }

  getFormattedDate(date: any): string {
    if (!date) return 'N/A';
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString();
      } else if (date instanceof Date) {
        return date.toLocaleDateString();
      } else {
        return new Date(date).toLocaleDateString();
      }
    } catch {
      return 'Invalid Date';
    }
  }

  getStageClass(stage: string): string {
    switch (stage) {
      case 'Lead': return 'bg-gray-100 text-gray-800';
      case 'Qualified': return 'bg-blue-100 text-blue-800';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Awarded': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
