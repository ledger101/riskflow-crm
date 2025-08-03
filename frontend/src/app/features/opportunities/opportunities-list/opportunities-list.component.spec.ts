import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunitiesListComponent } from './opportunities-list.component';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

describe('OpportunitiesListComponent', () => {
  let component: OpportunitiesListComponent;
  let fixture: ComponentFixture<OpportunitiesListComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;

  const mockOpportunities: Opportunity[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Test Client 1',
      solutionId: 'solution1',
      solutionName: 'Test Solution 1',
      ownerId: 'user1',
      description: 'Test opportunity 1',
      value: 10000,
      stage: 'Lead',
      probability: 25,
      createdAt: new Date()
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Test Client 2',
      solutionId: 'solution2',
      solutionName: 'Test Solution 2',
      ownerId: 'user2',
      description: 'Test opportunity 2',
      value: 25000,
      stage: 'Proposal',
      probability: 50,
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    mockOpportunityService = jasmine.createSpyObj('OpportunityService', ['getOpportunities']);

    await TestBed.configureTestingModule({
      imports: [OpportunitiesListComponent],
      providers: [
        { provide: OpportunityService, useValue: mockOpportunityService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunitiesListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load opportunities on init', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve(mockOpportunities));
    
    component.ngOnInit();
    await fixture.whenStable();
    
    expect(mockOpportunityService.getOpportunities).toHaveBeenCalled();
    expect(component.opportunities).toEqual(mockOpportunities);
  });

  it('should display opportunities in table', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve(mockOpportunities));
    
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('table')).toBeTruthy();
    expect(compiled.querySelectorAll('tbody tr').length).toBe(2);
    expect(compiled.textContent).toContain('Test Client 1');
    expect(compiled.textContent).toContain('Test Solution 1');
  });

  it('should display no opportunities message when list is empty', async () => {
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve([]));
    
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('table')).toBeFalsy();
    expect(compiled.textContent).toContain('No opportunities found');
  });
});
