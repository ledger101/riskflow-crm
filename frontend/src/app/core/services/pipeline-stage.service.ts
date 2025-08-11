import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { PipelineStage } from '../../shared/models/pipeline-stage.model';

@Injectable({
  providedIn: 'root'
})
export class PipelineStageService {
  // For now, using a mock implementation. Replace with Firebase when available
  private mockStages: PipelineStage[] = [
    { id: '1', name: 'Tender', defaultProbability: 10, order: 0 },
    { id: '2', name: 'Lead', defaultProbability: 10, order: 1 },
    { id: '3', name: 'Contact', defaultProbability: 15, order: 2 },
    { id: '4', name: 'Proposal', defaultProbability: 20, order: 3 },
    { id: '5', name: 'Decision', defaultProbability: 25, order: 4 },
    { id: '6', name: 'Awarded', defaultProbability: 40, order: 5 },
    { id: '7', name: 'Client', defaultProbability: 50, order: 6 },
    { id: '8', name: 'Implementation', defaultProbability: 70, order: 7 },
    { id: '9', name: 'Acceptance Testing', defaultProbability: 90, order: 8 },
    { id: '10', name: 'Go-Live', defaultProbability: 100, order: 9 },
  ];

  constructor() {}

  getStages(): Observable<PipelineStage[]> {
    return of([...this.mockStages].sort((a, b) => a.order - b.order));
  }

  getStagesPromise(): Promise<PipelineStage[]> {
    return firstValueFrom(this.getStages());
  }

  addStage(stage: Omit<PipelineStage, 'id'>): Promise<any> {
    const newStage: PipelineStage = {
      ...stage,
      id: Date.now().toString()
    };
    this.mockStages.push(newStage);
    return Promise.resolve(newStage);
  }

  updateStage(stage: PipelineStage): Promise<void> {
    const index = this.mockStages.findIndex(s => s.id === stage.id);
    if (index >= 0) {
      this.mockStages[index] = stage;
    }
    return Promise.resolve();
  }

  deleteStage(stageId: string): Promise<void> {
    const index = this.mockStages.findIndex(s => s.id === stageId);
    if (index >= 0) {
      this.mockStages.splice(index, 1);
    }
    return Promise.resolve();
  }
}
