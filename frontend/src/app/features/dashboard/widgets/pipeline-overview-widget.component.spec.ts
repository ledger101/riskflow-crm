import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipelineOverviewWidgetComponent } from './pipeline-overview-widget.component';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

describe('PipelineOverviewWidgetComponent', () => {
  let component: PipelineOverviewWidgetComponent;
  let fixture: ComponentFixture<PipelineOverviewWidgetComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;

  const mockOpportunities: Opportunity[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Client One',
      clientCountry: 'Ghana',
      solutionId: 'solution1',
      solutionName: 'Solution One',
      ownerId: 'user1',
      description: 'Test opportunity 1',
      value: 50000,
      stage: 'prospecting',
      probability: 20,
      createdAt: new Date()
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Client Two',
      clientCountry: 'Ghana',
      solutionId: 'solution2',
      solutionName: 'Solution Two',
      ownerId: 'user2',
      description: 'Test opportunity 2',
      value: 75000,
      stage: 'qualification',
      probability: 40,
      createdAt: new Date()
    },
    {
      id: '3',
      clientId: 'client3',
      clientName: 'Client Three',
      clientCountry: 'Ghana',
      solutionId: 'solution3',
      solutionName: 'Solution Three',
      ownerId: 'user3',
      description: 'Test opportunity 3',
      value: 100000,
      stage: 'closed-won',
      probability: 100,
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const opportunityServiceSpy = jasmine.createSpyObj('OpportunityService', ['getOpportunities']);

    await TestBed.configureTestingModule({
      imports: [PipelineOverviewWidgetComponent],
      providers: [
        { provide: OpportunityService, useValue: opportunityServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PipelineOverviewWidgetComponent);
    component = fixture.componentInstance;
    mockOpportunityService = TestBed.inject(OpportunityService) as jasmine.SpyObj<OpportunityService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pipeline data on init', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve(mockOpportunities));

    component.ngOnInit();
    await fixture.whenStable();

    expect(mockOpportunityService.getOpportunities).toHaveBeenCalled();
    expect(component.totalOpportunities).toBe(3);
    expect(component.totalValue).toBe(225000);
  });

  it('should calculate pipeline stages correctly', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve(mockOpportunities));

    component.ngOnInit();
    await fixture.whenStable();

    const prospectingStage = component.pipelineStages.find(stage => stage.name === 'Prospecting');
    const qualificationStage = component.pipelineStages.find(stage => stage.name === 'Qualification');
    const closedWonStage = component.pipelineStages.find(stage => stage.name === 'Closed Won');

    expect(prospectingStage?.count).toBe(1);
    expect(prospectingStage?.value).toBe(50000);
    expect(qualificationStage?.count).toBe(1);
    expect(qualificationStage?.value).toBe(75000);
    expect(closedWonStage?.count).toBe(1);
    expect(closedWonStage?.value).toBe(100000);
  });

  it('should handle empty opportunities array', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve([]));

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.totalOpportunities).toBe(0);
    expect(component.totalValue).toBe(0);
    expect(component.pipelineStages.every(stage => stage.count === 0)).toBe(true);
  });

  it('should handle service error gracefully', async () => {
    spyOn(console, 'error');
    mockOpportunityService.getOpportunities.and.returnValue(Promise.reject('Service error'));

    component.ngOnInit();
    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith('Error loading pipeline data:', 'Service error');
  });
});
