import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolutionService } from '../../../core/services/solution.service';
import { Solution } from '../../../shared/models/solution.model';
import { SolutionFormComponent } from '../solution-form/solution-form.component';

@Component({
  selector: 'app-solution-list',
  templateUrl: './solution-list.component.html',
  styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit {
  solutions: Solution[] = [];
  displayedColumns: string[] = ['name', 'category', 'cost', 'status', 'description', 'actions'];
  loading = false;

  constructor(
    private solutionService: SolutionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSolutions();
  }

  async loadSolutions(): Promise<void> {
    this.loading = true;
    try {
      this.solutions = await this.solutionService.getSolutions();
    } catch (error) {
      this.snackBar.open('Error loading solutions', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SolutionFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { solution: null, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSolutions();
      }
    });
  }

  openEditDialog(solution: Solution): void {
    const dialogRef = this.dialog.open(SolutionFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { solution, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSolutions();
      }
    });
  }

  async deleteSolution(solution: Solution): Promise<void> {
    if (confirm(`Are you sure you want to delete "${solution.name}"?`)) {
      try {
        await this.solutionService.deleteSolution(solution.id!);
        this.snackBar.open('Solution deleted successfully', 'Close', { duration: 3000 });
        this.loadSolutions();
      } catch (error: any) {
        this.snackBar.open(error.message || 'Error deleting solution', 'Close', { duration: 3000 });
      }
    }
  }
}
