import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolutionService } from '../../../core/services/solution.service';
import { Solution } from '../../../shared/models/solution.model';

interface DialogData {
  solution: Solution | null;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-solution-form',
  templateUrl: './solution-form.component.html',
  styleUrls: ['./solution-form.component.scss']
})
export class SolutionFormComponent implements OnInit {
  solutionForm: FormGroup;
  loading = false;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private solutionService: SolutionService,
    private dialogRef: MatDialogRef<SolutionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = data.mode === 'edit';
    this.solutionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.solution) {
      this.solutionForm.patchValue({
        name: this.data.solution.name,
        description: this.data.solution.description
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.solutionForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.solutionForm.value;

    try {
      if (this.isEditMode && this.data.solution) {
        await this.solutionService.updateSolution(this.data.solution.id!, formValue);
        this.snackBar.open('Solution updated successfully', 'Close', { duration: 3000 });
      } else {
        await this.solutionService.createSolution(formValue);
        this.snackBar.open('Solution created successfully', 'Close', { duration: 3000 });
      }
      
      this.dialogRef.close(true);
    } catch (error) {
      this.snackBar.open('Error saving solution', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getTitle(): string {
    return this.isEditMode ? 'Edit Solution' : 'Create New Solution';
  }
}
