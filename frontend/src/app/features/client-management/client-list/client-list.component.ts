import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../shared/models/client.model';
import { ClientFormComponent } from '../client-form/client-form.component';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  displayedColumns: string[] = ['name', 'country', 'industry', 'contactEmail', 'actions'];
  loading = false;
  
  // Filter options
  countries: string[] = [];
  industries: string[] = [];
  selectedCountry = '';
  selectedIndustry = '';

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  async loadClients(): Promise<void> {
    this.loading = true;
    try {
      this.clients = await this.clientService.getClients();
      this.filteredClients = [...this.clients];
      this.extractFilterOptions();
    } catch (error) {
      this.snackBar.open('Error loading clients', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  private extractFilterOptions(): void {
    const countrySet = new Set(this.clients.map(c => c.country).filter(Boolean));
    const industrySet = new Set(this.clients.map(c => c.industry).filter(Boolean));
    
    this.countries = Array.from(countrySet).sort();
    this.industries = Array.from(industrySet).sort();
  }

  applyFilters(): void {
    this.filteredClients = this.clients.filter(client => {
      const matchesCountry = !this.selectedCountry || client.country === this.selectedCountry;
      const matchesIndustry = !this.selectedIndustry || client.industry === this.selectedIndustry;
      return matchesCountry && matchesIndustry;
    });
  }

  clearFilters(): void {
    this.selectedCountry = '';
    this.selectedIndustry = '';
    this.filteredClients = [...this.clients];
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '600px',
      data: { client: null, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  openEditDialog(client: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '600px',
      data: { client, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  async deleteClient(client: Client): Promise<void> {
    if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
      try {
        await this.clientService.deleteClient(client.id!);
        this.snackBar.open('Client deleted successfully', 'Close', { duration: 3000 });
        this.loadClients();
      } catch (error: any) {
        this.snackBar.open(error.message || 'Error deleting client', 'Close', { duration: 3000 });
      }
    }
  }
}
