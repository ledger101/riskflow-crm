import { Injectable } from '@angular/core';
import { Opportunity } from '../../shared/models/opportunity.model';
import { PipelineStage } from '../../shared/models/pipeline-stage.model';
import { AppUser } from './user.service';

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
    // For now, create a simple CSV export (would use xlsx library in production)
    const headers = [
      'Client Name',
      'Client Country',
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
        this.escapeCSV(opp.clientCountry || ''),
        this.escapeCSV(opp.description),
        opp.value || 0,
        this.escapeCSV(this.getStageDisplayName(opp.stageId || opp.stage, options.stagesMap)),
        opp.probability || 0,
        this.escapeCSV(this.getOwnerName(opp.ownerId, options.usersMap)),
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
        <td>${opp.description}</td>
        <td>$${(opp.value || 0).toLocaleString()}</td>
        <td>${this.getStageDisplayName(opp.stageId || opp.stage, options.stagesMap)}</td>
        <td>${opp.probability || 0}%</td>
        <td>${this.getOwnerName(opp.ownerId, options.usersMap)}</td>
        <td>${opp.createdAt ? this.formatDate(opp.createdAt.toDate ? opp.createdAt.toDate() : new Date(opp.createdAt)) : ''}</td>
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

  private formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}
