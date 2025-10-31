import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipelineOverviewWidgetComponent } from './pipeline-overview-widget.component';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { Router } from '@angular/router';
import { Opportunity } from '../../../shared/models/opportunity.model';
import { of } from 'rxjs';

describe('PipelineOverviewWidgetComponent', () => {
  let component: PipelineOverviewWidgetComponent;
  let fixture: ComponentFixture<PipelineOverviewWidgetComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;
  let mockPipelineStageService: jasmine.SpyObj<PipelineStageService>;
  let mockRouter: jasmine.SpyObj<Router>;

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
      stageId: 'prospecting',
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
      stageId: 'qualification',
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
      stageId: 'closed-won',
      probability: 100,
      createdAt: new Date()
    }
  ];

  const mockStages = [
    { id: 'prospecting', name: 'Prospecting', order: 1, defaultProbability: 20 },
    { id: 'qualification', name: 'Qualification', order: 2, defaultProbability: 40 },
    { id: 'closed-won', name: 'Closed Won', order: 3, defaultProbability: 100 }
  ];

  beforeEach(async () => {
    const opportunityServiceSpy = jasmine.createSpyObj('OpportunityService', 
      ['getOpportunities', 'getOpportunitiesStream']);
    const pipelineStageServiceSpy = jasmine.createSpyObj('PipelineStageService', 
      ['seedDefaultStages', 'getStages', 'getStagesPromise']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PipelineOverviewWidgetComponent],
      providers: [
        { provide: OpportunityService, useValue: opportunityServiceSpy },
        { provide: PipelineStageService, useValue: pipelineStageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PipelineOverviewWidgetComponent);
    component = fixture.componentInstance;
    mockOpportunityService = TestBed.inject(OpportunityService) as jasmine.SpyObj<OpportunityService>;
    mockPipelineStageService = TestBed.inject(PipelineStageService) as jasmine.SpyObj<PipelineStageService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Setup default mock behaviors
    mockPipelineStageService.seedDefaultStages.and.returnValue(Promise.resolve());
    mockPipelineStageService.getStages.and.returnValue(of(mockStages));
    mockPipelineStageService.getStagesPromise.and.returnValue(Promise.resolve(mockStages));
    mockOpportunityService.getOpportunitiesStream.and.returnValue(of(mockOpportunities));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pipeline data on init', async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(component.totalOpportunities).toBe(3);
    expect(component.totalValue).toBe(225000);
  });

  it('should calculate pipeline stages correctly', async () => {
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
    mockOpportunityService.getOpportunitiesStream.and.returnValue(of([]));

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.totalOpportunities).toBe(0);
    expect(component.totalValue).toBe(0);
    expect(component.pipelineStages.every(stage => stage.count === 0)).toBe(true);
  });

  it('should navigate to stage when clicked', () => {
    component.pipelineStages = [
      {
        id: 'prospecting',
        name: 'Prospecting',
        key: 'prospecting',
        count: 1,
        value: 50000,
        percentage: 20,
        color: 'bg-blue-400',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      }
    ];

    component.navigateToStage('prospecting');

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/opportunities'], {
      queryParams: {
        stage: 'prospecting',
        from: 'pipeline-widget'
      }
    });
  });
});
