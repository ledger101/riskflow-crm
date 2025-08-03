import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinancialPerformanceWidgetComponent } from './financial-performance-widget.component';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

describe('FinancialPerformanceWidgetComponent', () => {
  let component: FinancialPerformanceWidgetComponent;
  let fixture: ComponentFixture<FinancialPerformanceWidgetComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;

  const mockOpportunities: Opportunity[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Client One',
      solutionId: 'solution1',
      solutionName: 'Solution One',
      ownerId: 'user1',
      description: 'Test opportunity 1',
      value: 100000,
      stage: 'closed-won',
      probability: 100,
      createdAt: new Date()
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Client Two',
      solutionId: 'solution2',
      solutionName: 'Solution Two',
      ownerId: 'user2',
      description: 'Test opportunity 2',
      value: 200000,
      stage: 'closed-won',
      probability: 100,
      createdAt: new Date()
    },
    {
      id: '3',
      clientId: 'client3',
      clientName: 'Client Three',
      solutionId: 'solution3',
      solutionName: 'Solution Three',
      ownerId: 'user3',
      description: 'Test opportunity 3',
      value: 150000,
      stage: 'proposal',
      probability: 60,
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const opportunityServiceSpy = jasmine.createSpyObj('OpportunityService', ['getOpportunities']);

    await TestBed.configureTestingModule({
      imports: [FinancialPerformanceWidgetComponent],
      providers: [
        { provide: OpportunityService, useValue: opportunityServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialPerformanceWidgetComponent);
    component = fixture.componentInstance;
    mockOpportunityService = TestBed.inject(OpportunityService) as jasmine.SpyObj<OpportunityService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load financial data on init', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve(mockOpportunities));

    component.ngOnInit();
    await fixture.whenStable();

    expect(mockOpportunityService.getOpportunities).toHaveBeenCalled();
    expect(component.quarterlyRevenue).toBe(300000); // Sum of closed-won opportunities
  });

  it('should calculate financial metrics correctly', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve(mockOpportunities));

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.metrics.length).toBe(3);
    
    const revenueMetric = component.metrics.find(m => m.title === 'Revenue Generated');
    const pipelineMetric = component.metrics.find(m => m.title === 'Pipeline Value');
    const conversionMetric = component.metrics.find(m => m.title === 'Conversion Rate');

    expect(revenueMetric?.current).toBe(300000);
    expect(pipelineMetric?.current).toBe(150000); // Only proposal stage
    expect(conversionMetric?.current).toBeCloseTo(66.67, 1); // 2 of 3 opportunities won
  });

  it('should get correct trend colors', () => {
    expect(component.getTrendColor('up')).toBe('text-green-600');
    expect(component.getTrendColor('down')).toBe('text-red-600');
    expect(component.getTrendColor('stable')).toBe('text-gray-600');
  });

  it('should get correct trend icons', () => {
    expect(component.getTrendIcon('up')).toBe('fas fa-arrow-up');
    expect(component.getTrendIcon('down')).toBe('fas fa-arrow-down');
    expect(component.getTrendIcon('stable')).toBe('fas fa-minus');
  });

  it('should calculate progress width correctly', () => {
    expect(component.getProgressWidth(250, 500)).toBe(50);
    expect(component.getProgressWidth(600, 500)).toBe(100); // Should cap at 100%
    expect(component.getProgressWidth(0, 500)).toBe(0);
  });

  it('should handle empty opportunities array', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve([]));

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.quarterlyRevenue).toBe(0);
    expect(component.metrics.every(metric => metric.current === 0)).toBe(true);
  });

  it('should handle service error gracefully', async () => {
    spyOn(console, 'error');
    mockOpportunityService.getOpportunities.and.returnValue(Promise.reject('Service error'));

    component.ngOnInit();
    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith('Error loading financial data:', 'Service error');
  });
});
