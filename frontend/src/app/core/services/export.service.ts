import { Injectable } from '@angular/core';
import { Opportunity } from '../../shared/models/opportunity.model';
import { PipelineStage } from '../../shared/models/pipeline-stage.model';
import { AppUser } from './user.service';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  format: 'excel' | 'pdf';
  filename?: string;
  includeFilters?: boolean;
  filterInfo?: string;
  stagesMap?: Map<string, PipelineStage>;
  usersMap?: Map<string, AppUser>;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  async exportOpportunities(opportunities: Opportunity[], options: ExportOptions): Promise<void> {
    try {
      const filename = options.filename || this.generateFilename(options.format, options.filterInfo);
      
      if (options.format === 'excel') {
        await this.exportToExcel(opportunities, filename, options);
      } else if (options.format === 'pdf') {
        await this.exportToPDF(opportunities, filename, options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  private async exportToExcel(opportunities: Opportunity[], filename: string, options: ExportOptions): Promise<void> {
    // Create Excel workbook using xlsx library
    const workbook = XLSX.utils.book_new();

    // Prepare data for Excel
    const headers = [
      'Client Name',
      'Client Country',
      'Solution Name',
      'Description',
      'Value',
      'Stage',
      'Probability',
      'Owner',
      'Created Date'
    ];

    const data = opportunities.map(opp => [
      opp.clientName,
      opp.clientCountry,
      opp.solutionName || '',
      opp.description || '',
      this.formatCurrency(opp.value || 0),
      this.getStageDisplayName(opp.stageId || opp.stage, options.stagesMap),
      opp.probability || 0,
      this.getOwnerName(opp.ownerId, options.usersMap),
      this.formatDate(opp.createdAt)
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Add filter information if requested
    if (options.includeFilters && options.filterInfo) {
      // Add filter info as a separate sheet or at the top
      const filterSheet = XLSX.utils.aoa_to_sheet([
        ['Filters Applied:', options.filterInfo],
        ['Generated:', new Date().toLocaleString()],
        [''] // Empty row
      ]);
      XLSX.utils.book_append_sheet(workbook, filterSheet, 'Filters');
    }

    // Add main data sheet
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Opportunities');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create blob and download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadFile(blob, filename + '.xlsx');
  }

  private async exportToPDF(opportunities: Opportunity[], filename: string, options: ExportOptions): Promise<void> {
    // Simple PDF export using HTML and print (would use jsPDF in production)
    const htmlContent = this.generatePDFHTML(opportunities, filename, options);
    
    // Create a new window with the content for printing/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private generatePDFHTML(opportunities: Opportunity[], filename: string, options: ExportOptions): string {
    const filterInfo = options.includeFilters && options.filterInfo ? 
      `<p><strong>Filters Applied:</strong> ${options.filterInfo}</p>` : '';
    
    const tableRows = opportunities.map(opp => `
      <tr>
        <td>${opp.clientName}</td>
        <td>${opp.clientCountry || ''}</td>
        <td>${opp.solutionName || ''}</td>
        <td>${opp.description || ''}</td>
        <td>${this.formatCurrency(opp.value || 0)}</td>
        <td>${this.getStageDisplayName(opp.stageId || opp.stage, options.stagesMap)}</td>
        <td>${opp.probability || 0}%</td>
        <td>${this.getOwnerName(opp.ownerId, options.usersMap)}</td>
        <td>${this.formatDate(opp.createdAt)}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Opportunities Export</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${filterInfo}
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Client Country</th>
                <th>Solution Name</th>
                <th>Description</th>
                <th>Value</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Owner</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  private getStageDisplayName(stageIdentifier: string, stagesMap?: Map<string, PipelineStage>): string {
    if (!stageIdentifier || !stagesMap) return stageIdentifier;
    const stage = stagesMap.get(stageIdentifier.toLowerCase());
    return stage ? stage.name : stageIdentifier;
  }

  private getOwnerName(ownerId: string, usersMap?: Map<string, AppUser>): string {
    if (!ownerId || !usersMap) return ownerId;
    const user = usersMap.get(ownerId);
    return user && user.name ? user.name : ownerId;
  }

  private downloadFile(content: string | Blob, filename: string, contentType?: string): void {
    let blob: Blob;
    if (content instanceof Blob) {
      blob = content;
    } else {
      blob = new Blob([content], { type: contentType || 'text/plain' });
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateFilename(format: 'excel' | 'pdf', filterInfo?: string): string {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filter = filterInfo ? `-${filterInfo.toLowerCase().replace(/\s+/g, '-')}` : '';
    return `opportunities-${date}-${time}${filter}`;
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private formatDate(timestamp: any): string {
    if (!timestamp) return '';
    
    let date: Date;
    
    // If it's already a Date object, use it
    if (timestamp instanceof Date) {
      date = timestamp;
    }
    // If it's a Firestore Timestamp, convert it
    else if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    }
    // If it's a string or number, try to parse it
    else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
