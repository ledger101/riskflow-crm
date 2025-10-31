import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { OpportunityService } from '../../core/services/opportunity.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockOpportunityService: jasmine.SpyObj<OpportunityService>;

  beforeEach(async () => {
    const opportunityServiceSpy = jasmine.createSpyObj('OpportunityService', ['getOpportunities']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: OpportunityService, useValue: opportunityServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockOpportunityService = TestBed.inject(OpportunityService) as jasmine.SpyObj<OpportunityService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard header', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('h1')?.textContent).toBe('Dashboard');
    expect(compiled.querySelector('p')?.textContent).toBe('Welcome to your Riskflow CRM overview');
  });

  it('should render all widget components', () => {
    // Mock the service to prevent actual calls during rendering
    mockOpportunityService.getOpportunities.and.returnValue(Promise.resolve([]));
    
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('app-pipeline-overview-widget')).toBeTruthy();
    expect(compiled.querySelector('app-financial-performance-widget')).toBeTruthy();
    expect(compiled.querySelector('app-recent-activity-widget')).toBeTruthy();
    expect(compiled.querySelector('app-quick-stats-widget')).toBeTruthy();
  });

  it('should render quick actions section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    const quickActionsSection = compiled.querySelector('h2');
    expect(quickActionsSection?.textContent).toBe('Quick Actions');
    
    const actionButtons = compiled.querySelectorAll('a[routerLink]');
    expect(actionButtons.length).toBeGreaterThanOrEqual(3); // At least 3 action links plus header button
    
    // Check for specific action links
    const viewOpportunitiesLink = Array.from(actionButtons).find(
      button => button.textContent?.includes('View Opportunities')
    );
    expect(viewOpportunitiesLink).toBeTruthy();
    expect(viewOpportunitiesLink?.getAttribute('routerLink')).toBe('/opportunities');
  });

  it('should have responsive grid layout', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check for the secondary widgets grid (3 columns)
    const widgetsGrid = compiled.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
    expect(widgetsGrid).toBeTruthy();
  });
});
