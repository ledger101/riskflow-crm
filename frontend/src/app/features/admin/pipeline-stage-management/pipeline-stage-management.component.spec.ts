import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PipelineStageManagementComponent } from './pipeline-stage-management.component';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineStage } from '../../../shared/models/pipeline-stage.model';

describe('PipelineStageManagementComponent', () => {
  let component: PipelineStageManagementComponent;
  let fixture: ComponentFixture<PipelineStageManagementComponent>;
  let mockPipelineStageService: jasmine.SpyObj<PipelineStageService>;

  const mockStages: PipelineStage[] = [
    { id: '1', name: 'Prospecting', defaultProbability: 10, order: 0 },
    { id: '2', name: 'Qualification', defaultProbability: 25, order: 1 },
    { id: '3', name: 'Proposal', defaultProbability: 50, order: 2 },
    { id: '4', name: 'Negotiation', defaultProbability: 75, order: 3 },
    { id: '5', name: 'Closed Won', defaultProbability: 100, order: 4 }
  ];

  beforeEach(async () => {
    const pipelineStageServiceSpy = jasmine.createSpyObj('PipelineStageService', [
      'getStages', 
      'addStage', 
      'updateStage', 
      'deleteStage'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PipelineStageManagementComponent,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: PipelineStageService, useValue: pipelineStageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PipelineStageManagementComponent);
    component = fixture.componentInstance;
    mockPipelineStageService = TestBed.inject(PipelineStageService) as jasmine.SpyObj<PipelineStageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stages on init', () => {
    mockPipelineStageService.getStages.and.returnValue(of(mockStages));

    component.ngOnInit();

    expect(mockPipelineStageService.getStages).toHaveBeenCalled();
    expect(component.stages).toEqual(mockStages);
  });

  it('should handle error when loading stages', () => {
    spyOn(console, 'error');
    mockPipelineStageService.getStages.and.returnValue(throwError('Service error'));

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error loading stages:', 'Service error');
  });

  it('should open create form with default values', () => {
    component.stages = mockStages;
    
    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.isEditMode).toBe(false);
    expect(component.currentStageId).toBeNull();
    expect(component.stageForm.get('name')?.value).toBe('');
    expect(component.stageForm.get('defaultProbability')?.value).toBe(50);
    expect(component.stageForm.get('order')?.value).toBe(5); // Max order + 1
  });

  it('should open edit form with stage data', () => {
    const stageToEdit = mockStages[1];
    
    component.openEditForm(stageToEdit);

    expect(component.showForm).toBe(true);
    expect(component.isEditMode).toBe(true);
    expect(component.currentStageId).toBe(stageToEdit.id);
    expect(component.stageForm.get('name')?.value).toBe(stageToEdit.name);
    expect(component.stageForm.get('defaultProbability')?.value).toBe(stageToEdit.defaultProbability);
    expect(component.stageForm.get('order')?.value).toBe(stageToEdit.order);
  });

  it('should close form and reset state', () => {
    component.showForm = true;
    component.isEditMode = true;
    component.currentStageId = 'test-id';
    component.stageForm.patchValue({ name: 'Test', defaultProbability: 50, order: 1 });

    component.closeForm();

    expect(component.showForm).toBe(false);
    expect(component.isEditMode).toBe(false);
    expect(component.currentStageId).toBeNull();
  });

  it('should create new stage successfully', async () => {
    const newStageData = { name: 'New Stage', defaultProbability: 60, order: 5 };
    const createdStage = { id: 'new-id', ...newStageData };
    
    mockPipelineStageService.addStage.and.returnValue(Promise.resolve(createdStage));
    mockPipelineStageService.getStages.and.returnValue(of(mockStages));
    
    component.stageForm.patchValue(newStageData);
    component.isEditMode = false;
    component.showForm = true;

    await component.saveStage();

    expect(mockPipelineStageService.addStage).toHaveBeenCalledWith(newStageData);
    expect(mockPipelineStageService.getStages).toHaveBeenCalled();
    expect(component.showForm).toBe(false);
    expect(component.saving).toBe(false);
  });

  it('should update existing stage successfully', async () => {
    const updatedStageData = { name: 'Updated Stage', defaultProbability: 80, order: 2 };
    const stageId = 'existing-id';
    
    mockPipelineStageService.updateStage.and.returnValue(Promise.resolve());
    mockPipelineStageService.getStages.and.returnValue(of(mockStages));
    spyOn(window, 'alert');
    
    component.stageForm.patchValue(updatedStageData);
    component.isEditMode = true;
    component.currentStageId = stageId;
    component.showForm = true;

    await component.saveStage();

    expect(mockPipelineStageService.updateStage).toHaveBeenCalledWith({
      id: stageId,
      ...updatedStageData
    });
    expect(mockPipelineStageService.getStages).toHaveBeenCalled();
    expect(component.showForm).toBe(false);
    expect(component.saving).toBe(false);
  });

  it('should handle error when saving stage', async () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');
    spyOn(component, 'loadStages');
    mockPipelineStageService.addStage.and.returnValue(Promise.reject('Save error'));
    
    component.stageForm.patchValue({ name: 'Test', defaultProbability: 50, order: 1 });
    component.isEditMode = false;

    await component.saveStage();

    expect(console.error).toHaveBeenCalledWith('Error saving stage:', 'Save error');
    expect(window.alert).toHaveBeenCalledWith('Failed to save stage. Please try again.');
    expect(component.loadStages).not.toHaveBeenCalled();
    expect(component.saving).toBe(false);
  });

  it('should not save stage if form is invalid', async () => {
    component.stageForm.patchValue({ name: '', defaultProbability: -10, order: 1 });
    spyOn(component, 'loadStages');

    await component.saveStage();

    expect(mockPipelineStageService.addStage).not.toHaveBeenCalled();
    expect(mockPipelineStageService.updateStage).not.toHaveBeenCalled();
    expect(component.loadStages).not.toHaveBeenCalled();
  });

  it('should not save stage if already saving', async () => {
    component.saving = true;
    component.stageForm.patchValue({ name: 'Test', defaultProbability: 50, order: 1 });
    spyOn(component, 'loadStages');

    await component.saveStage();

    expect(mockPipelineStageService.addStage).not.toHaveBeenCalled();
    expect(component.loadStages).not.toHaveBeenCalled();
  });

  it('should delete stage successfully after confirmation', async () => {
    const stageToDelete = mockStages[1];
    spyOn(window, 'confirm').and.returnValue(true);
    mockPipelineStageService.deleteStage.and.returnValue(Promise.resolve());
    mockPipelineStageService.getStages.and.returnValue(of(mockStages));

    await component.deleteStage(stageToDelete);

    expect(window.confirm).toHaveBeenCalledWith(
      `Are you sure you want to delete the "${stageToDelete.name}" stage? This action cannot be undone.`
    );
    expect(mockPipelineStageService.deleteStage).toHaveBeenCalledWith(stageToDelete.id);
    expect(mockPipelineStageService.getStages).toHaveBeenCalled();
    expect(component.deleting).toBeNull();
  });

  it('should not delete stage if user cancels confirmation', async () => {
    const stageToDelete = mockStages[1];
    spyOn(window, 'confirm').and.returnValue(false);

    await component.deleteStage(stageToDelete);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockPipelineStageService.deleteStage).not.toHaveBeenCalled();
    expect(component.deleting).toBeNull();
  });

  it('should handle error when deleting stage', async () => {
    const stageToDelete = mockStages[1];
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(console, 'error');
    spyOn(component, 'loadStages');
    mockPipelineStageService.deleteStage.and.returnValue(Promise.reject('Delete error'));

    await component.deleteStage(stageToDelete);

    expect(console.error).toHaveBeenCalledWith('Error deleting stage:', 'Delete error');
    expect(window.alert).toHaveBeenCalledWith('Failed to delete stage. Please try again.');
    expect(component.loadStages).not.toHaveBeenCalled();
    expect(component.deleting).toBeNull();
  });

  it('should set deleting state during delete operation', async () => {
    const stageToDelete = mockStages[1];
    spyOn(window, 'confirm').and.returnValue(true);
    
    let deletePromiseResolve: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      deletePromiseResolve = resolve;
      // Check that deleting state is set during the operation
      setTimeout(() => {
        expect(component.deleting).toBe(stageToDelete.id);
        resolve();
      }, 10);
    });
    
    mockPipelineStageService.deleteStage.and.returnValue(deletePromise);

    const deleteOperation = component.deleteStage(stageToDelete);
    
    // Wait for the promise to resolve
    await deleteOperation;

    expect(component.deleting).toBeNull();
  });

  it('should validate form fields correctly', () => {
    // Test invalid name
    component.stageForm.get('name')?.setValue('');
    component.stageForm.get('name')?.markAsTouched();
    expect(component.stageForm.get('name')?.invalid).toBe(true);

    // Test valid name
    component.stageForm.get('name')?.setValue('Valid Stage Name');
    expect(component.stageForm.get('name')?.invalid).toBe(false);

    // Test invalid probability (below 0)
    component.stageForm.get('defaultProbability')?.setValue(-1);
    component.stageForm.get('defaultProbability')?.markAsTouched();
    expect(component.stageForm.get('defaultProbability')?.invalid).toBe(true);

    // Test invalid probability (above 100)
    component.stageForm.get('defaultProbability')?.setValue(101);
    expect(component.stageForm.get('defaultProbability')?.invalid).toBe(true);

    // Test valid probability
    component.stageForm.get('defaultProbability')?.setValue(50);
    expect(component.stageForm.get('defaultProbability')?.invalid).toBe(false);

    // Test invalid order (negative)
    component.stageForm.get('order')?.setValue(-1);
    component.stageForm.get('order')?.markAsTouched();
    expect(component.stageForm.get('order')?.invalid).toBe(true);

    // Test valid order
    component.stageForm.get('order')?.setValue(1);
    expect(component.stageForm.get('order')?.invalid).toBe(false);
  });

  it('should sort stages by order after loading', () => {
    const unsortedStages = [
      { id: '1', name: 'Stage 1', defaultProbability: 10, order: 3 },
      { id: '2', name: 'Stage 2', defaultProbability: 25, order: 1 },
      { id: '3', name: 'Stage 3', defaultProbability: 50, order: 2 }
    ];
    
    mockPipelineStageService.getStages.and.returnValue(of(unsortedStages));

    component.loadStages();

    expect(component.stages[0].order).toBe(1);
    expect(component.stages[1].order).toBe(2);
    expect(component.stages[2].order).toBe(3);
  });
});