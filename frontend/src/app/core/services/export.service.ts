import { Injectable } from '@angular/core';
import { Opportunity } from '../../shared/models/opportunity.model';

export interface ExportOptions {
  format: 'excel' | 'pdf';
  filename?: string;
  includeFilters?: boolean;
  filterInfo?: string;
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
    // For now, create a simple CSV export (would use xlsx library in production)
    const headers = [
      'Client Name',
      'Description', 
      'Value',
      'Stage',
      'Probability',
      'Owner',
      'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...opportunities.map(opp => [
        this.escapeCSV(opp.clientName),
        this.escapeCSV(opp.description),
        opp.value || 0,
  this.escapeCSV(this.getStageDisplayName(opp.stageId || opp.stage)),
        opp.probability || 0,
        this.escapeCSV(opp.ownerId),
        opp.createdAt ? this.formatDate(opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt)) : ''
      ].join(','))
    ].join('\n');

    // Add filter information if requested
    let finalContent = csvContent;
    if (options.includeFilters && options.filterInfo) {
      finalContent = `Filters Applied: ${options.filterInfo}\nGenerated: ${new Date().toLocaleString()}\n\n${csvContent}`;
    }

    this.downloadFile(finalContent, filename + '.csv', 'text/csv');
  }

  private async exportToPDF(opportunities: Opportunity[], filename: string, options: ExportOptions): Promise<void> {
    // Simple PDF export using HTML and print (would use jsPDF in production)
    const htmlContent = this.generatePDFHTML(opportunities, options);
    
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

  private generatePDFHTML(opportunities: Opportunity[], options: ExportOptions): string {
    const filterInfo = options.includeFilters && options.filterInfo ? 
      `<p><strong>Filters Applied:</strong> ${options.filterInfo}</p>` : '';
    
    const tableRows = opportunities.map(opp => `
      <tr>
        <td>${opp.clientName}</td>
        <td>${opp.description}</td>
        <td>$${(opp.value || 0).toLocaleString()}</td>
  <td>${this.getStageDisplayName(opp.stageId || opp.stage)}</td>
        <td>${opp.probability || 0}%</td>
        <td>${opp.ownerId}</td>
        <td>${opp.createdAt ? this.formatDate(opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt)) : ''}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Opportunities Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Opportunities Report</h1>
        <div class="meta">
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Opportunities:</strong> ${opportunities.length}</p>
          ${filterInfo}
        </div>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Description</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Probability</th>
              <th>Owner</th>
              <th>Created</th>
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

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateFilename(format: string, filterInfo?: string): string {
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

  private formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  private getStageDisplayName(stageKey: string): string {
    const stageMap: { [key: string]: string } = {
      'prospecting': 'Prospecting',
      'qualification': 'Qualification',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost'
    };
    return stageMap[stageKey] || stageKey;
  }
}
