import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunityFormComponent } from './opportunity-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ClientService } from '../../../core/services/client.service';
import { SolutionService } from '../../../core/services/solution.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Solution } from '../../../shared/models/solution.model';

describe('OpportunityFormComponent', () => {
  let component: OpportunityFormComponent;
  let fixture: ComponentFixture<OpportunityFormComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;
  let mockClientService: jasmine.SpyObj<ClientService>;
  let mockSolutionService: jasmine.SpyObj<SolutionService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockOpportunityService = jasmine.createSpyObj('OpportunityService', ['createOpportunity', 'getOpportunityById', 'updateOpportunity']);
    mockClientService = jasmine.createSpyObj('ClientService', ['getClients']);
    mockSolutionService = jasmine.createSpyObj('SolutionService', ['getSolutions']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [OpportunityFormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: OpportunityService, useValue: mockOpportunityService },
        { provide: ClientService, useValue: mockClientService },
        { provide: SolutionService, useValue: mockSolutionService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', async () => {
    mockClientService.getClients.and.returnValue(Promise.resolve([]));
    mockSolutionService.getSolutions.and.returnValue(Promise.resolve([]));
    mockUserService.getUsers.and.returnValue(Promise.resolve([]));
    mockAuthService.getCurrentUser.and.returnValue({ uid: 'user123' } as any);

    await component.ngOnInit();

    expect(component.opportunityForm.get('stage')?.value).toBe('Lead');
    expect(component.opportunityForm.get('probability')?.value).toBe(25);
  });

  it('should auto-fill opportunity value when solution is selected in create mode', async () => {
    const mockSolutions: Solution[] = [
      { id: 'solution1', name: 'Solution 1', description: 'Test solution', cost: 5000 },
      { id: 'solution2', name: 'Solution 2', description: 'Another solution', cost: 10000 }
    ];

    mockClientService.getClients.and.returnValue(Promise.resolve([]));
    mockSolutionService.getSolutions.and.returnValue(Promise.resolve(mockSolutions));
    mockUserService.getUsers.and.returnValue(Promise.resolve([]));
    mockAuthService.getCurrentUser.and.returnValue({ uid: 'user123' } as any);

    // Ensure we're in create mode (not edit mode)
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    await component.ngOnInit();

    // Simulate selecting a solution
    component.opportunityForm.get('solutionId')?.setValue('solution1');

    // Check that the value field was auto-filled with the solution cost
    expect(component.opportunityForm.get('value')?.value).toBe(5000);

    // Test with another solution
    component.opportunityForm.get('solutionId')?.setValue('solution2');
    expect(component.opportunityForm.get('value')?.value).toBe(10000);
  });

  it('should not auto-fill opportunity value in edit mode', async () => {
    const mockSolutions: Solution[] = [
      { id: 'solution1', name: 'Solution 1', description: 'Test solution', cost: 5000 }
    ];

    mockClientService.getClients.and.returnValue(Promise.resolve([]));
    mockSolutionService.getSolutions.and.returnValue(Promise.resolve(mockSolutions));
    mockUserService.getUsers.and.returnValue(Promise.resolve([]));
    mockAuthService.getCurrentUser.and.returnValue({ uid: 'user123' } as any);
    mockOpportunityService.getOpportunityById.and.returnValue(Promise.resolve({
      id: 'opp1',
      clientId: 'client1',
      clientName: 'Test Client',
      solutionId: 'solution1',
      solutionName: 'Solution 1',
      ownerId: 'user123',
      description: 'Test opportunity',
      value: 3000, // Different from solution cost
      stage: 'Proposal',
      probability: 75,
      createdAt: new Date()
    }));

    // Set edit mode
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('opp1');

    await component.ngOnInit();

    // The value should remain as loaded from the opportunity (3000), not auto-filled from solution (5000)
    expect(component.opportunityForm.get('value')?.value).toBe(3000);
  });

  it('should validate required fields', () => {
    const form = component.opportunityForm;
    
    expect(form.get('clientId')?.valid).toBeFalsy();
    expect(form.get('solutionId')?.valid).toBeFalsy();
    expect(form.get('description')?.valid).toBeFalsy();
    
    form.patchValue({
      clientId: 'client1',
      solutionId: 'solution1',
      description: 'Test opportunity'
    });
    
    expect(form.get('clientId')?.valid).toBeTruthy();
    expect(form.get('solutionId')?.valid).toBeTruthy();
    expect(form.get('description')?.valid).toBeTruthy();
  });
});
