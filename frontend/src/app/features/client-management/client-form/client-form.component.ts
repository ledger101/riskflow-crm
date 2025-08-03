import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../shared/models/client.model';
import { CountriesService } from '../../../core/services/countries.service';

interface DialogData {
  client: Client | null;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  loading = false;
  isEditMode: boolean;

  // Common options for dropdowns
  countries: string[] = [];

  industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
    'Construction', 'Transportation', 'Energy', 'Telecommunications', 'Media',
    'Real Estate', 'Agriculture', 'Government', 'Non-Profit', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar,
    @Inject(CountriesService) private countriesService: CountriesService
  ) {
    this.isEditMode = data.mode === 'edit';
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', Validators.required],
      industry: ['', Validators.required],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadCountries();

    if (this.isEditMode && this.data.client) {
      this.clientForm.patchValue({
        name: this.data.client.name,
        country: this.data.client.country,
        industry: this.data.client.industry,
        contactEmail: this.data.client.contactEmail,
        contactPhone: this.data.client.contactPhone,
        address: this.data.client.address
      });
    }
  }

  loadCountries(): void {
    this.countriesService.getCountries().then((data: string[]) => {
      this.countries = data;
    });
  }

  openAddCountryDialog(): void {
    const newCountry = prompt('Enter new country name:');
    if (newCountry) {
      this.countriesService.addCountry(newCountry).then(() => {
        this.loadCountries();
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.clientForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.clientForm.value;

    try {
      if (this.isEditMode && this.data.client) {
        await this.clientService.updateClient(this.data.client.id!, formValue);
        this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
      } else {
        await this.clientService.createClient(formValue);
        this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
      }
      
      this.dialogRef.close(true);
    } catch (error) {
      this.snackBar.open('Error saving client', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getTitle(): string {
    return this.isEditMode ? 'Edit Client' : 'Create New Client';
  }
}
