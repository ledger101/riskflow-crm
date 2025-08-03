import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunityFormComponent } from './opportunity-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ClientService } from '../../../core/services/client.service';
import { SolutionService } from '../../../core/services/solution.service';
import { AuthService } from '../../../core/services/auth.service';

describe('OpportunityFormComponent', () => {
  let component: OpportunityFormComponent;
  let fixture: ComponentFixture<OpportunityFormComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;
  let mockClientService: jasmine.SpyObj<ClientService>;
  let mockSolutionService: jasmine.SpyObj<SolutionService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockOpportunityService = jasmine.createSpyObj('OpportunityService', ['createOpportunity', 'getOpportunityById', 'updateOpportunity']);
    mockClientService = jasmine.createSpyObj('ClientService', ['getClients']);
    mockSolutionService = jasmine.createSpyObj('SolutionService', ['getSolutions']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
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

  it('should initialize form with default values', () => {
    mockClientService.getClients.and.returnValue(Promise.resolve([]));
    mockSolutionService.getSolutions.and.returnValue(Promise.resolve([]));
    mockAuthService.getCurrentUser.and.returnValue({ uid: 'user123' } as any);

    component.ngOnInit();

    expect(component.opportunityForm.get('stage')?.value).toBe('Lead');
    expect(component.opportunityForm.get('probability')?.value).toBe(25);
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
