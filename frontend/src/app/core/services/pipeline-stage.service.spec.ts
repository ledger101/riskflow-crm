import { TestBed } from '@angular/core/testing';
import { PipelineStageService } from './pipeline-stage.service';
import { PipelineStage } from '../../shared/models/pipeline-stage.model';

describe('PipelineStageService', () => {
  let service: PipelineStageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PipelineStageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return stages in order', async () => {
    const stages = await service.getStagesPromise();
    
    expect(stages).toBeTruthy();
    expect(stages.length).toBeGreaterThan(0);
    
    // Verify stages are ordered by order property
    for (let i = 1; i < stages.length; i++) {
      expect(stages[i].order).toBeGreaterThanOrEqual(stages[i - 1].order);
    }
  });

  it('should add a new stage', async () => {
    const initialStages = await service.getStagesPromise();
    const initialCount = initialStages.length;

    const newStage = {
      name: 'Test Stage',
      defaultProbability: 75,
      order: 99
    };

    const addedStage = await service.addStage(newStage);
    expect(addedStage).toBeTruthy();
    expect(addedStage.id).toBeTruthy();
    expect(addedStage.name).toBe(newStage.name);
    expect(addedStage.defaultProbability).toBe(newStage.defaultProbability);
    expect(addedStage.order).toBe(newStage.order);

    const updatedStages = await service.getStagesPromise();
    expect(updatedStages.length).toBe(initialCount + 1);
    
    const createdStage = updatedStages.find(s => s.id === addedStage.id);
    expect(createdStage).toBeTruthy();
  });

  it('should update an existing stage', async () => {
    // First add a stage to update
    const newStage = {
      name: 'Original Stage',
      defaultProbability: 50,
      order: 10
    };
    const addedStage = await service.addStage(newStage);

    // Update the stage
    const updatedStageData: PipelineStage = {
      id: addedStage.id,
      name: 'Updated Stage Name',
      defaultProbability: 80,
      order: 15
    };

    await service.updateStage(updatedStageData);

    // Verify the update
    const stages = await service.getStagesPromise();
    const updatedStage = stages.find(s => s.id === addedStage.id);
    
    expect(updatedStage).toBeTruthy();
    expect(updatedStage!.name).toBe('Updated Stage Name');
    expect(updatedStage!.defaultProbability).toBe(80);
    expect(updatedStage!.order).toBe(15);
  });

  it('should delete an existing stage', async () => {
    // First add a stage to delete
    const newStage = {
      name: 'Stage to Delete',
      defaultProbability: 25,
      order: 5
    };
    const addedStage = await service.addStage(newStage);
    
    const initialStages = await service.getStagesPromise();
    const initialCount = initialStages.length;

    // Delete the stage
    await service.deleteStage(addedStage.id);

    // Verify the deletion
    const updatedStages = await service.getStagesPromise();
    expect(updatedStages.length).toBe(initialCount - 1);
    
    const deletedStage = updatedStages.find(s => s.id === addedStage.id);
    expect(deletedStage).toBeUndefined();
  });

  it('should handle updating non-existent stage gracefully', async () => {
    const nonExistentStage: PipelineStage = {
      id: 'non-existent-id',
      name: 'Non-existent Stage',
      defaultProbability: 50,
      order: 1
    };

    // Should not throw an error
    await expectAsync(service.updateStage(nonExistentStage)).toBeResolved();
  });

  it('should handle deleting non-existent stage gracefully', async () => {
    const nonExistentId = 'non-existent-id';

    // Should not throw an error
    await expectAsync(service.deleteStage(nonExistentId)).toBeResolved();
  });

  it('should validate stage properties', async () => {
    const stages = await service.getStagesPromise();
    
    stages.forEach(stage => {
      expect(stage.id).toBeTruthy();
      expect(stage.name).toBeTruthy();
      expect(stage.defaultProbability).toBeGreaterThanOrEqual(0);
      expect(stage.defaultProbability).toBeLessThanOrEqual(100);
      expect(stage.order).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return observable with stages', (done) => {
    service.getStages().subscribe(stages => {
      expect(stages).toBeTruthy();
      expect(Array.isArray(stages)).toBe(true);
      expect(stages.length).toBeGreaterThan(0);
      done();
    });
  });
});