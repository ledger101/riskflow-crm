import { TestBed } from '@angular/core/testing';
import { OpportunityService } from './opportunity.service';
import { FirebaseService } from './firebase.service';

describe('OpportunityService', () => {
  let service: OpportunityService;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;
  let mockFirestore: any;

  beforeEach(() => {
    mockFirestore = {
      collection: jasmine.createSpy(),
      getDocs: jasmine.createSpy()
    };

    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getFirestore']);
    mockFirebaseService.getFirestore.and.returnValue(mockFirestore);

    TestBed.configureTestingModule({
      providers: [
        OpportunityService,
        { provide: FirebaseService, useValue: mockFirebaseService }
      ]
    });
    service = TestBed.inject(OpportunityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch opportunities from Firestore', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ clientName: 'Test Client', value: 10000 }) },
      { id: '2', data: () => ({ clientName: 'Test Client 2', value: 20000 }) }
    ];

    const mockSnapshot = {
      docs: mockDocs
    };

    spyOn(window as any, 'getDocs').and.returnValue(Promise.resolve(mockSnapshot));

    const result = await service.getOpportunities();

    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[0].clientName).toBe('Test Client');
  });
});
