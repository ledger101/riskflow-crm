import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunityDetailComponent } from './opportunity-detail.component';
import { ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../shared/models/opportunity.model';

describe('OpportunityDetailComponent', () => {
  let component: OpportunityDetailComponent;
  let fixture: ComponentFixture<OpportunityDetailComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;
  let mockActivatedRoute: any;

  const mockOpportunity: Opportunity = {
    id: '1',
    clientId: 'client1',
    clientName: 'Test Client',
    solutionId: 'solution1',
    solutionName: 'Test Solution',
    ownerId: 'user1',
    description: 'Test opportunity',
    value: 10000,
    stage: 'Lead',
    probability: 25,
    createdAt: new Date()
  };

  beforeEach(async () => {
    mockOpportunityService = jasmine.createSpyObj('OpportunityService', ['getOpportunityById']);
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [OpportunityDetailComponent],
      providers: [
        { provide: OpportunityService, useValue: mockOpportunityService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load opportunity on init', async () => {
    mockOpportunityService.getOpportunityById.and.returnValue(Promise.resolve(mockOpportunity));
    
    await component.ngOnInit();
    
    expect(mockOpportunityService.getOpportunityById).toHaveBeenCalledWith('1');
    expect(component.opportunity).toEqual(mockOpportunity);
    expect(component.loading).toBeFalsy();
  });

  it('should return correct stage class', () => {
    expect(component.getStageClass('Lead')).toBe('bg-gray-100 text-gray-800');
    expect(component.getStageClass('Awarded')).toBe('bg-green-100 text-green-800');
    expect(component.getStageClass('Lost')).toBe('bg-red-100 text-red-800');
  });
});
