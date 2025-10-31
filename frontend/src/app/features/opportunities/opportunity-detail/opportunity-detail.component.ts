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
import { AuditService } from '../../../core/services/audit.service';
import { AuditEntry } from '../../../shared/models/audit-entry.model';
import { Stakeholder } from '../../../shared/models/stakeholder.model';
import { Contact } from '../../../shared/models/contact.model';
import { StakeholderService } from '../../../core/services/stakeholder.service';
import { ContactService } from '../../../core/services/contact.service';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-opportunity-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
      <ng-container *ngIf="opportunity; else loading">
        <!-- Header Card -->
  <div class="bg-white shadow-md rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col gap-2 mb-6">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3 w-1/2 pr-4 min-w-0">
               
              <div>
                <h1 class="text-3xl font-bold text-gray-900 leading-tight">{{ getSolutionDisplayText() }}</h1>
                <p *ngIf="opportunity.description" class="text-gray-600">{{ opportunity.description }}</p>
              </div>
            </div>
            <div class="w-1/2 pl-4 text-right min-w-0"> 
              
               <h2 class="text-3xl font-bold text-gray-900 leading-tight">
                 {{ opportunity.clientName }}</h2>
               
            </div>
          
          </div>
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mt-2">
             
            <div>
              <div class="text-sm font-medium text-gray-500">Value</div>
              <div class="text-xl font-semibold text-blue-700">\${{ opportunity.value | number }}</div>
              <div *ngIf="getValueBreakdown().isOverridden" class="text-xs text-orange-600">Custom value</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Probability</div>
              <div class="text-xl font-bold text-yellow-500">{{ opportunity.probability }}%</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Owner</div>
              <div class="text-lg font-semibold text-gray-900">{{ ownerName }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Created</div>
              <div class="text-lg font-semibold text-gray-900">{{ getFormattedDate(opportunity.createdAt) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Stage</div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-semibold text-blue-700">{{ opportunity.stage }}</span>
                <a [routerLink]="['/opportunities', opportunity.id, 'edit']"
                   aria-label="Edit Stage" title="Edit Stage"
                   class="p-1 rounded hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
                  <!-- Heroicon: PencilSquare -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.862 4.487l1.687 1.687m-2.475-1.06l-7.5 7.5a4.5 4.5 0 00-1.012 1.68l-.708 2.124a.75.75 0 00.948.948l2.124-.708a4.5 4.5 0 001.68-1.012l7.5-7.5m-2.475-1.06a1.875 1.875 0 112.652 2.652m-2.652-2.652L12.75 3.75M6 20.25h12"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

  <!-- Tabs (pill style) -->
  <div class="mb-4">
          <nav class="flex gap-2" aria-label="Tabs">
            <button (click)="activeTab = 'communications'"
                    [ngClass]="activeTab === 'communications' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-4 py-2 rounded-full text-sm font-medium transition focus:outline-none">
              Communications
            </button>
            <button (click)="activeTab = 'actionItems'"
                    [ngClass]="activeTab === 'actionItems' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-4 py-2 rounded-full text-sm font-medium transition focus:outline-none">
              Action Items
            </button>
      <button (click)="activeTab = 'stakeholders'"
        [ngClass]="activeTab === 'stakeholders' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        class="px-4 py-2 rounded-full text-sm font-medium transition focus:outline-none">
        Stakeholders
      </button>
            <button (click)="activeTab = 'audit'"
                    [ngClass]="activeTab === 'audit' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-4 py-2 rounded-full text-sm font-medium transition focus:outline-none">
              Audit Trail
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div *ngIf="activeTab === 'communications'">
          <!-- Solutions breakdown panel -->
          <div *ngIf="getSolutions().length > 0" class="bg-white rounded-lg border p-4 mb-6">
            <h3 class="text-lg font-semibold mb-3">Solutions & Value Breakdown</h3>
            <div class="space-y-2">
              <div *ngFor="let solution of getSolutions()" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="font-medium">{{ solution.name }}</span>
                <span class="text-gray-600">\${{ solution.cost | number }}</span>
              </div>
              <div class="flex justify-between items-center py-2 font-semibold border-t-2">
                <span>{{ getValueBreakdown().isOverridden ? 'Custom Total' : 'Calculated Total' }}</span>
                <span class="text-blue-700">\${{ opportunity.value | number }}</span>
              </div>
              <div *ngIf="getValueBreakdown().isOverridden" class="text-sm text-orange-600">
                Auto-calculated: \${{ getValueBreakdown().calculatedTotal | number }}
              </div>
            </div>
          </div>
          
          <!-- ...existing communications content... -->
          <div class="mt-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Communications</h2>
              <button (click)="showCommunicationForm = !showCommunicationForm"
                      [attr.aria-label]="showCommunicationForm ? 'Cancel' : 'Add Communication'"
                      [attr.title]="showCommunicationForm ? 'Cancel' : 'Add Communication'"
                      class="p-2 rounded hover:bg-gray-100 transition text-blue-600 hover:text-blue-800">
                <ng-container *ngIf="!showCommunicationForm; else closeCommIcon">
                  <!-- Heroicon: Plus -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15M19.5 12h-15" />
                  </svg>
                </ng-container>
                <ng-template #closeCommIcon>
                  <!-- Heroicon: XMark -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </ng-template>
              </button>
            </div>
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
                        class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition">
                  {{ communicationLoading ? 'Saving...' : 'Add Communication' }}
                </button>
              </form>
            </div>
            <div class="space-y-4">
              <div *ngFor="let comm of communications" class="bg-white border rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ comm.type }}
                    </span>
                    <span class="text-sm text-gray-500">{{ getFormattedDate(comm.date) }}</span>
                    <span class="text-sm text-gray-400" *ngIf="comm.createdBy">• {{ comm.createdByName || getOwnerName(comm.createdBy) }}</span>
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
        </div>

  <div *ngIf="activeTab === 'actionItems'">
          <!-- ...existing action items content... -->
          <div class="mt-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Action Items</h2>
              <button (click)="showActionItemForm = !showActionItemForm"
                      [attr.aria-label]="showActionItemForm ? 'Cancel' : 'Add Action Item'"
                      [attr.title]="showActionItemForm ? 'Cancel' : 'Add Action Item'"
                      class="p-2 rounded hover:bg-gray-100 transition text-green-600 hover:text-green-800">
                <ng-container *ngIf="!showActionItemForm; else closeActionIcon">
                  <!-- Heroicon: Plus -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15M19.5 12h-15" />
                  </svg>
                </ng-container>
                <ng-template #closeActionIcon>
                  <!-- Heroicon: XMark -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </ng-template>
              </button>
            </div>
  
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
                        class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition">
                  {{ actionItemLoading ? 'Saving...' : 'Add Action Item' }}
                </button>
              </form>
            </div>
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
                      <span class="text-sm text-gray-400" *ngIf="item.createdBy">By {{ item.createdByName || getOwnerName(item.createdBy) }}</span>
                      <span *ngIf="item.completedAt" class="text-sm text-green-600">
                        Completed: {{ getFormattedDate(item.completedAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
                          <span class="text-sm text-gray-400 mr-3" *ngIf="item.createdBy">By {{ item.createdByName || getOwnerName(item.createdBy) }}</span>
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

        <!-- Stakeholders Tab -->
        <div *ngIf="activeTab === 'stakeholders'">
          <div class="mt-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Stakeholders</h2>
              <button (click)="toggleStakeholderForm()"
                      [attr.aria-label]="showStakeholderForm ? 'Cancel' : 'Add Stakeholder'"
                      [attr.title]="showStakeholderForm ? 'Cancel' : 'Add Stakeholder'"
                      class="p-2 rounded hover:bg-gray-100 transition text-purple-600 hover:text-purple-800">
                <ng-container *ngIf="!showStakeholderForm; else closeStakeholderIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15M19.5 12h-15" />
                  </svg>
                </ng-container>
                <ng-template #closeStakeholderIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </ng-template>
              </button>
            </div>

            <div *ngIf="showStakeholderForm" class="bg-gray-50 p-4 rounded mb-4">
              <form [formGroup]="stakeholderForm" (ngSubmit)="submitStakeholder()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Link Contact</label>
                    <select formControlName="contactId" (change)="onContactChange()"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="">— Custom —</option>
                      <option *ngFor="let c of contacts" [value]="c.id">{{ c.name }} {{ c.title ? '(' + c.title + ')' : '' }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Role</label>
                    <select formControlName="role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="Decision Maker">Decision Maker</option>
                      <option value="Influencer">Influencer</option>
                      <option value="User">User</option>
                      <option value="Agent">Agent</option>
                      <option value="Sponsor">Sponsor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" formControlName="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" formControlName="phone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <label class="inline-flex items-center">
                    <input type="checkbox" formControlName="primary" class="rounded border-gray-300 mr-2">
                    Primary contact for this opportunity
                  </label>
                </div>
                <div *ngIf="!stakeholderForm.get('contactId')?.value" class="flex items-center gap-4">
                  <label class="inline-flex items-center">
                    <input type="checkbox" formControlName="saveToClient" class="rounded border-gray-300 mr-2">
                    Also save to Client Contacts
                  </label>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows="2" formControlName="notes" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                <div class="flex gap-2">
                  <button type="submit" [disabled]="stakeholderForm.invalid || stakeholderLoading"
                          class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition">
                    {{ stakeholderLoading ? 'Saving...' : (editingStakeholderId ? 'Update Stakeholder' : 'Add Stakeholder') }}
                  </button>
                  <button type="button" (click)="cancelStakeholderEdit()" class="px-4 py-2 rounded border">Cancel</button>
                </div>
              </form>
            </div>

            <div class="space-y-3 md:space-y-4">
              <!-- Client primary contact card (read-only) -->
              <div *ngIf="clientPrimaryStakeholder" class="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm hover:shadow transition">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                  <!-- Left -->
                  <div class="md:col-span-5">
                    <h3 class="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      {{ clientPrimaryStakeholder.name }}
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">Primary</span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">From Client</span>
                    </h3>
                    <div class="text-sm text-gray-600" *ngIf="clientPrimaryStakeholder.title">{{ clientPrimaryStakeholder.title }}</div>
                    <div class="text-sm text-gray-500 truncate" *ngIf="clientPrimaryStakeholder.notes">{{ clientPrimaryStakeholder.notes }}</div>
                  </div>

                  <!-- Middle -->
                  <div class="md:col-span-5">
                    <div class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700">Role: {{ clientPrimaryStakeholder.role }}</div>
                    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                      <span *ngIf="clientPrimaryStakeholder.email" class="inline-flex items-center gap-1 text-gray-600" [title]="clientPrimaryStakeholder.email">
                        <!-- Mail icon -->
                        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 8.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 15.75v-7.5m19.5 0A2.25 2.25 0 0 0 19.5 6h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.913 5.569a2.25 2.25 0 0 1-2.374 0L2.25 8.25"/></svg>
                        <span class="truncate max-w-[220px] md:max-w-none">{{ clientPrimaryStakeholder.email }}</span>
                      </span>
                      <span *ngIf="clientPrimaryStakeholder.phone" class="inline-flex items-center gap-1 text-gray-600" [title]="clientPrimaryStakeholder.phone">
                        <!-- Phone icon -->
                        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h2.1c.98 0 1.841.634 2.129 1.566l.724 2.345a2.25 2.25 0 0 1-.52 2.247l-1.21 1.21a15.75 15.75 0 0 0 6.364 6.364l1.21-1.21a2.25 2.25 0 0 1 2.247-.52l2.345.724a2.25 2.25 0 0 1 1.566 2.129v2.1a2.25 2.25 0 0 1-2.25 2.25H18c-8.284 0-15-6.716-15-15V6.75z"/></svg>
                        <span class="truncate max-w-[160px] md:max-w-none">{{ clientPrimaryStakeholder.phone }}</span>
                      </span>
                    </div>
                  </div>

                  <!-- Right -->
                  <div class="md:col-span-2 flex md:justify-end">
                    <span class="text-xs text-gray-500 md:self-start">Managed at Client</span>
                  </div>
                </div>
              </div>

              <!-- Other stakeholders -->
              <div *ngFor="let s of stakeholders" class="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm hover:shadow transition">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                  <!-- Left -->
                  <div class="md:col-span-5">
                    <h3 class="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      {{ s.name }}
                      <span *ngIf="s.primary && !clientPrimaryStakeholder" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">Primary</span>
                      <span *ngIf="s.source === 'client'" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">From Client</span>
                    </h3>
                    <div class="text-sm text-gray-600" *ngIf="s.title">{{ s.title }}</div>
                    <div class="text-sm text-gray-500 truncate" *ngIf="s.notes">{{ s.notes }}</div>
                  </div>

                  <!-- Middle -->
                  <div class="md:col-span-5">
                    <div class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700" *ngIf="s.role">Role: {{ s.role }}</div>
                    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                      <span *ngIf="s.email" class="inline-flex items-center gap-1 text-gray-600" [title]="s.email">
                        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 8.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 15.75v-7.5m19.5 0A2.25 2.25 0 0 0 19.5 6h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.913 5.569a2.25 2.25 0 0 1-2.374 0L2.25 8.25"/></svg>
                        <span class="truncate max-w-[220px] md:max-w-none">{{ s.email }}</span>
                      </span>
                      <span *ngIf="s.phone" class="inline-flex items-center gap-1 text-gray-600" [title]="s.phone">
                        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h2.1c.98 0 1.841.634 2.129 1.566l.724 2.345a2.25 2.25 0 0 1-.52 2.247l-1.21 1.21a15.75 15.75 0 0 0 6.364 6.364l1.21-1.21a2.25 2.25 0 0 1 2.247-.52l2.345.724a2.25 2.25 0 0 1 1.566 2.129v2.1a2.25 2.25 0 0 1-2.25 2.25H18c-8.284 0-15-6.716-15-15V6.75z"/></svg>
                        <span class="truncate max-w-[160px] md:max-w-none">{{ s.phone }}</span>
                      </span>
                    </div>
                  </div>

                  <!-- Right actions -->
                  <div class="md:col-span-2 flex md:justify-end gap-2">
                    <button (click)="makePrimary(s)"
                            [disabled]="s.primary || !!clientPrimaryStakeholder"
                            [class.opacity-40]="s.primary || !!clientPrimaryStakeholder"
                            [class.pointer-events-none]="s.primary || !!clientPrimaryStakeholder"
                            class="p-2 rounded hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                            aria-label="Make Primary" title="Make Primary">
                      <!-- Star icon -->
                      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.75.75 0 0 1 1.04 0l2.49 2.49a.75.75 0 0 0 .531.22h3.52a.75.75 0 0 1 .53 1.281l-2.49 2.489a.75.75 0 0 0-.22.53v3.52a.75.75 0 0 1-1.28.53l-2.49-2.49a.75.75 0 0 0-.53-.22h-3.52a.75.75 0 0 1-.53-1.28l2.49-2.49a.75.75 0 0 0 .22-.53v-3.52z"/></svg>
                    </button>
                    <button (click)="startEditStakeholder(s)"
                            class="p-2 rounded hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                            aria-label="Edit Stakeholder" title="Edit Stakeholder">
                      <!-- Pencil icon -->
                      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.862 4.487l1.687 1.687m-2.475-1.06l-7.5 7.5a4.5 4.5 0 00-1.012 1.68l-.708 2.124a.75.75 0 00.948.948l2.124-.708a4.5 4.5 0 001.68-1.012l7.5-7.5m-2.475-1.06a1.875 1.875 0 112.652 2.652m-2.652-2.652L12.75 3.75M6 20.25h12"/></svg>
                    </button>
                    <button (click)="deleteStakeholder(s)"
                            class="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-700"
                            aria-label="Delete Stakeholder" title="Delete Stakeholder">
                      <!-- Trash icon -->
                      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div *ngIf="stakeholders.length === 0" class="text-gray-500 text-center py-4">No stakeholders yet.</div>
            </div>
          </div>
        </div>

        <!-- Audit Trail Tab -->
        <div *ngIf="activeTab === 'audit'">
          <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">Audit Trail</h2>
            <div class="space-y-3">
              <div *ngFor="let entry of auditEntries" class="bg-white border rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-600">{{ getFormattedDateTime(entry.createdAt) }}</div>
                  <div class="text-sm text-gray-700">{{ entry.userName || entry.userId }}</div>
                </div>
                <div class="mt-1">
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'created'">Opportunity created</div>
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'stage'">Stage changed</div>
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'value'">Value changed</div>
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'probability'">Probability changed</div>
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'description'">Description changed</div>
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'solution'">Solution changed</div>
                  <div class="text-gray-900 font-medium" *ngIf="entry.type === 'owner'">Owner changed</div>
                  <div class="text-sm text-gray-600" *ngIf="entry.type !== 'created'">
                    Old: <span class="font-medium">{{ entry.oldValue }}</span>
                    → New: <span class="font-medium">{{ entry.newValue }}</span>
                  </div>
                </div>
              </div>
              <div *ngIf="auditEntries.length === 0" class="text-gray-500 text-center py-4">No audit entries yet.</div>
            </div>
          </div>
        </div>
    </ng-container>

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
  activeTab: 'communications' | 'actionItems' | 'stakeholders' | 'audit' = 'communications';
getOwnerName(ownerId: string): string {
  // console.log(ownerId);
  
    const user = this.usersMap.get(ownerId);
    return user?.name || ownerId;
  }
  opportunity: Opportunity | null = null;
  communications: Communication[] = [];
  actionItems: ActionItem[] = [];
  auditEntries: AuditEntry[] = [];
  stakeholders: Stakeholder[] = [];
  contacts: Contact[] = [];
  loading = true;
  ownerName: string = '';
  users: AppUser[] = [];
    usersMap: Map<string, AppUser> = new Map();
  // Form states
  showCommunicationForm = false;
  showActionItemForm = false;
  showStakeholderForm = false;
  showCompletedItems = false;
  communicationLoading = false;
  actionItemLoading = false;
  stakeholderLoading = false;
  
  // Forms
  communicationForm: FormGroup;
  actionItemForm: FormGroup;
  stakeholderForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService,
    private communicationService: CommunicationService,
  private actionItemService: ActionItemService,
  private stakeholderService: StakeholderService,
    private authService: AuthService,
  private userService: UserService,
  private auditService: AuditService,
  private contactService: ContactService,
  private clientService: ClientService,
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

    this.stakeholderForm = this.fb.group({
      contactId: [''],
      name: ['', Validators.required],
      title: [''],
      email: [''],
      phone: [''],
      role: ['Other'],
      primary: [false],
  notes: [''],
  saveToClient: [false]
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
          this.loadActionItems(id),
          this.loadAuditEntries(id),
          this.loadStakeholders(id),
          this.loadContacts(this.opportunity.clientId),
          this.loadClientPrimaryContact(this.opportunity.clientId, id)
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

  async loadAuditEntries(opportunityId: string) {
    try {
      this.auditEntries = await this.auditService.getEntries(opportunityId);
    } catch (e) {
      console.error('Error loading audit entries:', e);
    }
  }

  async loadStakeholders(opportunityId: string) {
    try {
      this.stakeholders = await this.stakeholderService.getByOpportunity(opportunityId);
    } catch (e) {
      console.error('Error loading stakeholders:', e);
    }
  }

  async loadContacts(clientId: string) {
    try {
      this.contacts = await this.contactService.getContactsByClient(clientId);
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  }

  clientPrimaryStakeholder: Stakeholder | null = null;
  async loadClientPrimaryContact(clientId: string, opportunityId: string) {
    try {
      const client = await this.clientService.getClientById(clientId);
      if (!client || !client.contactPerson) {
        this.clientPrimaryStakeholder = null;
        return;
      }
      this.clientPrimaryStakeholder = {
        id: 'client-primary',
        opportunityId,
        clientId,
        name: client.contactPerson,
        title: client.contactTitle,
        email: client.contactEmail,
        phone: client.contactPhone,
        role: 'Agent',
        primary: true,
        notes: 'Client primary contact',
        source: 'client',
        createdAt: new Date(),
      } as Stakeholder;
    } catch (e) {
      console.error('Error loading client primary contact:', e);
      this.clientPrimaryStakeholder = null;
    }
  }

  async addCommunication() {
    if (this.communicationForm.invalid || !this.opportunity) return;

    this.communicationLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      const formValue = this.communicationForm.value;
      
      const creatorName = this.getOwnerName(currentUser?.uid || 'unknown');
      await this.communicationService.addCommunication({
        opportunityId: this.opportunity.id,
        type: formValue.type,
        date: new Date(formValue.date),
        summary: formValue.summary,
        createdBy: currentUser?.uid || 'unknown',
        createdByName: creatorName
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
        createdBy: currentUser?.uid || 'unknown',
        createdByName: this.getOwnerName(currentUser?.uid || 'unknown')
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

  // Stakeholders
  toggleStakeholderForm() {
    this.showStakeholderForm = !this.showStakeholderForm;
    if (!this.showStakeholderForm) {
      this.cancelStakeholderEdit();
    }
  }

  onContactChange() {
    const contactId = this.stakeholderForm.get('contactId')?.value as string;
    if (!contactId) return; // custom
    const c = this.contacts.find(x => x.id === contactId);
    if (!c) return;
    this.stakeholderForm.patchValue({
      name: c.name,
      title: c.title || '',
      email: c.email || '',
      phone: c.phone || ''
    });
  }

  editingStakeholderId: string | null = null;

  startEditStakeholder(s: Stakeholder) {
    this.editingStakeholderId = s.id;
    this.showStakeholderForm = true;
    this.stakeholderForm.reset({
      contactId: s.contactId || '',
      name: s.name,
      title: s.title || '',
      email: s.email || '',
      phone: s.phone || '',
      role: s.role || 'Other',
      primary: !!s.primary,
      notes: s.notes || ''
    });
  }

  cancelStakeholderEdit() {
    this.editingStakeholderId = null;
    this.stakeholderForm.reset({
      contactId: '',
      name: '',
      title: '',
      email: '',
      phone: '',
      role: 'Other',
      primary: false,
      notes: ''
    });
  }

  async submitStakeholder() {
    if (!this.opportunity || this.stakeholderForm.invalid) return;
    this.stakeholderLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      const v = this.stakeholderForm.value;
      const payload: Partial<Stakeholder> = {
        ...(v.contactId ? { contactId: v.contactId } : {}),
        clientId: this.opportunity.clientId,
        name: v.name,
        title: v.title || undefined,
        email: v.email || undefined,
        phone: v.phone || undefined,
        role: v.role,
        primary: !!v.primary,
        notes: v.notes || undefined,
        source: v.contactId ? 'client' : 'opportunity',
        createdBy: currentUser?.uid || 'unknown',
        createdByName: this.getOwnerName(currentUser?.uid || 'unknown')
      };

      // Optionally persist to client contacts if custom and opted in
      if (!v.contactId && v.saveToClient) {
        try {
          await this.contactService.addContact(this.opportunity.clientId, {
            name: v.name,
            title: v.title || undefined,
            email: v.email || undefined,
            phone: v.phone || undefined
          });
        } catch (e) {
          console.warn('Could not save to client contacts:', e);
        }
      }

      if (this.editingStakeholderId) {
        await this.stakeholderService.update(this.editingStakeholderId, payload as any);
        if (payload.primary) {
          await this.stakeholderService.ensurePrimary(this.opportunity.id, this.editingStakeholderId);
        }
      } else {
        const id = await this.stakeholderService.add(this.opportunity.id, payload as any);
        // First stakeholder becomes primary if none exists
        const hasPrimary = this.stakeholders.some(s => s.primary);
        if (v.primary || !hasPrimary) {
          await this.stakeholderService.update(id, { primary: true });
          await this.stakeholderService.ensurePrimary(this.opportunity.id, id);
        }
      }

      await this.loadStakeholders(this.opportunity.id);
      this.cancelStakeholderEdit();
      this.showStakeholderForm = false;
    } catch (e) {
      console.error('Error saving stakeholder:', e);
    } finally {
      this.stakeholderLoading = false;
    }
  }

  async deleteStakeholder(s: Stakeholder) {
    if (!confirm('Delete stakeholder ' + s.name + '?')) return;
    try {
      await this.stakeholderService.delete(s.id);
      await this.loadStakeholders(this.opportunity!.id);
    } catch (e) {
      console.error('Error deleting stakeholder:', e);
    }
  }

  async makePrimary(s: Stakeholder) {
    if (!this.opportunity) return;
    try {
      await this.stakeholderService.update(s.id, { primary: true });
      await this.stakeholderService.ensurePrimary(this.opportunity.id, s.id);
      await this.loadStakeholders(this.opportunity.id);
    } catch (e) {
      console.error('Error making primary:', e);
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

  // Formats date with time for audit entries
  getFormattedDateTime(date: any): string {
    if (!date) return 'N/A';

    try {
      const d: Date = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
      // Example: Aug 14, 2025, 09:32
      return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      } as Intl.DateTimeFormatOptions);
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

  getSolutions(): Array<{ id: string; name: string; cost?: number }> {
    if (!this.opportunity) return [];
    
    // Use new solutions array if available
    if (this.opportunity.solutions && this.opportunity.solutions.length > 0) {
      return this.opportunity.solutions;
    }
    
    // Fallback to legacy single solution
    if (this.opportunity.solutionId || this.opportunity.solutionName) {
      return [{
        id: this.opportunity.solutionId || '',
        name: this.opportunity.solutionName || 'Unknown Solution',
        cost: undefined
      }];
    }
    
    return [];
  }

  getSolutionDisplayText(): string {
    if (!this.opportunity) return '';
    
    const solutions = this.getSolutions();
    if (solutions.length === 0) return 'No Solutions';
    if (solutions.length === 1) return solutions[0].name;
    
    return `${solutions[0].name} (+${solutions.length - 1} more)`;
  }

  getValueBreakdown(): { calculatedTotal: number; isOverridden: boolean } {
    if (!this.opportunity) return { calculatedTotal: 0, isOverridden: false };
    
    const solutions = this.getSolutions();
    const calculatedTotal = solutions.reduce((sum, s) => sum + (s.cost || 0), 0);
    const isOverridden = calculatedTotal > 0 && calculatedTotal !== this.opportunity.value;
    
    return { calculatedTotal, isOverridden };
  }
}
