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
      clientCountry: 'Ghana',
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
      clientCountry: 'Ghana',
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
      clientCountry: 'Ghana',
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

    expect(component.quarterlyRevenue).toBe(300000); // Sum of closed-won opportunities
    expect(component.annualRevenue).toBe(300000); // Same for annual in this test
    expect(component.wonOpportunities).toBe(2); // 2 closed-won opportunities
    expect(component.conversionRate).toBeCloseTo(66.67, 1); // 2 of 3 opportunities with probability > 70
  });

  it('should get correct performance colors', () => {
    expect(component.getPerformanceColor(100)).toBe('text-green-600 font-semibold');
    expect(component.getPerformanceColor(85)).toBe('text-blue-600 font-semibold');
    expect(component.getPerformanceColor(65)).toBe('text-yellow-600 font-semibold');
    expect(component.getPerformanceColor(50)).toBe('text-red-600 font-semibold');
  });

  it('should handle empty opportunities array', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve([]));

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.quarterlyRevenue).toBe(0);
    expect(component.annualRevenue).toBe(0);
    expect(component.wonOpportunities).toBe(0);
    expect(component.conversionRate).toBe(0);
  });

  it('should handle service error gracefully', async () => {
    spyOn(console, 'error');
    mockOpportunityService.getOpportunities.and.returnValue(Promise.reject('Service error'));

    component.ngOnInit();
    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith('Error loading financial data:', 'Service error');
  });
});
