import { TestBed } from '@angular/core/testing';
import { CommunicationService } from './communication.service';
import { FirebaseService } from './firebase.service';

describe('CommunicationService', () => {
  let service: CommunicationService;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;
  let mockFirestore: any;

  beforeEach(() => {
    mockFirestore = {
      collection: jasmine.createSpy(),
      getDocs: jasmine.createSpy(),
      addDoc: jasmine.createSpy()
    };

    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getFirestore']);
    mockFirebaseService.getFirestore.and.returnValue(mockFirestore);

    TestBed.configureTestingModule({
      providers: [
        CommunicationService,
        { provide: FirebaseService, useValue: mockFirebaseService }
      ]
    });
    service = TestBed.inject(CommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch communications by opportunity', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ type: 'Email', summary: 'Test email' }) },
      { id: '2', data: () => ({ type: 'Call', summary: 'Test call' }) }
    ];

    const mockSnapshot = { docs: mockDocs };
    spyOn(window as any, 'getDocs').and.returnValue(Promise.resolve(mockSnapshot));

    const result = await service.getCommunicationsByOpportunity('opp123');

    expect(result.length).toBe(2);
    expect(result[0].type).toBe('Email');
  });
});
