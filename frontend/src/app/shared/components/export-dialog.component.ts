import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ExportConfig {
  format: 'excel' | 'pdf';
  filename: string;
  includeFilters: boolean;
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
         (click)="onBackdropClick($event)">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" 
           (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Export Opportunities</h3>
          <p class="text-sm text-gray-500 mt-1">
            Configure your export settings
          </p>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 space-y-4">
          <!-- Format Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                (click)="exportConfig.format = 'excel'"
                [class]="getFormatButtonClass('excel')"
                class="flex items-center justify-center p-3 text-sm font-medium rounded-lg border transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3h8v2H6V7zm0 4h8v2H6v-2z"/>
                </svg>
                Excel (XLSX)
              </button>
              <button
                type="button"
                (click)="exportConfig.format = 'pdf'"
                [class]="getFormatButtonClass('pdf')"
                class="flex items-center justify-center p-3 text-sm font-medium rounded-lg border transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                </svg>
                PDF
              </button>
            </div>
          </div>

          <!-- Filename -->
          <div>
            <label for="filename" class="block text-sm font-medium text-gray-700 mb-2">
              Filename (optional)
            </label>
            <input
              type="text"
              id="filename"
              [(ngModel)]="exportConfig.filename"
              placeholder="Leave blank for auto-generated name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>

          <!-- Options -->
          <div>
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="exportConfig.includeFilters"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <span class="ml-2 text-sm text-gray-700">
                Include current filter information
              </span>
            </label>
          </div>

          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>{{ totalRecords }}</strong> opportunities will be exported
                  <span *ngIf="hasActiveFilters && exportConfig.includeFilters" class="block mt-1">
                    with current filter settings applied
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Cancel
          </button>
          <button
            type="button"
            (click)="onExport()"
            [disabled]="isExporting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!isExporting">Export</span>
            <span *ngIf="isExporting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ExportDialogComponent {
  @Input() totalRecords = 0;
  @Input() hasActiveFilters = false;
  @Output() export = new EventEmitter<ExportConfig>();
  @Output() cancel = new EventEmitter<void>();

  isExporting = false;

  exportConfig: ExportConfig = {
    format: 'excel',
    filename: '',
    includeFilters: true
  };

  getFormatButtonClass(format: string): string {
    const baseClasses = 'flex items-center justify-center p-3 text-sm font-medium rounded-lg border transition-colors';
    const selected = this.exportConfig.format === format;
    
    if (selected) {
      return `${baseClasses} bg-blue-600 text-white border-blue-600`;
    }
    return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`;
  }

  onBackdropClick(event: Event): void {
    this.onCancel();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  async onExport(): Promise<void> {
    if (this.isExporting) return;
    
    this.isExporting = true;
    try {
      this.export.emit({ ...this.exportConfig });
    } finally {
      this.isExporting = false;
    }
  }
}
