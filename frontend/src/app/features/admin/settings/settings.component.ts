import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SalesTargets } from '../../../shared/models/sales-targets.model';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-lg mx-auto">
      <h1 class="text-2xl font-bold mb-6">Sales Targets Settings</h1>
      <form [formGroup]="targetsForm" (ngSubmit)="saveTargets()" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Annual Target</label>
          <input type="number" formControlName="annualTarget" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Quarterly Target</label>
          <input type="number" formControlName="quarterlyTarget" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>
        <button type="submit" [disabled]="targetsForm.invalid" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Targets</button>
      </form>
      <div *ngIf="message" class="mt-4 text-green-600">{{ message }}</div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  targetsForm: FormGroup;
  message: string | null = null;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.targetsForm = this.fb.group({
      annualTarget: [0, [Validators.required, Validators.min(0)]],
      quarterlyTarget: [0, [Validators.required, Validators.min(0)]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Load existing targets from Firestore
    const targets = await this.settingsService.getCurrentTargets();
    if (targets) {
      this.targetsForm.patchValue({
        annualTarget: targets.annualTarget ?? targets.annual ?? 0,
        quarterlyTarget: targets.quarterlyTarget ?? targets.quarterly ?? 0
      });
    }
  }

  async saveTargets(): Promise<void> {
    if (this.targetsForm.invalid) return;
    const { annualTarget, quarterlyTarget } = this.targetsForm.value;
    await this.settingsService.updateSalesTargets({
      annual: annualTarget,
      annualTarget,
      quarterly: quarterlyTarget,
      quarterlyTarget
    });
    this.message = 'Targets saved!';
  }
}
