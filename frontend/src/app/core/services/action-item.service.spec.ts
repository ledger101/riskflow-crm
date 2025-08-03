import { TestBed } from '@angular/core/testing';
import { ActionItemService } from './action-item.service';
import { FirebaseService } from './firebase.service';

describe('ActionItemService', () => {
  let service: ActionItemService;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;
  let mockFirestore: any;

  beforeEach(() => {
    mockFirestore = {
      collection: jasmine.createSpy(),
      getDocs: jasmine.createSpy(),
      addDoc: jasmine.createSpy(),
      doc: jasmine.createSpy(),
      updateDoc: jasmine.createSpy()
    };

    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getFirestore']);
    mockFirebaseService.getFirestore.and.returnValue(mockFirestore);

    TestBed.configureTestingModule({
      providers: [
        ActionItemService,
        { provide: FirebaseService, useValue: mockFirebaseService }
      ]
    });
    service = TestBed.inject(ActionItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch action items by opportunity', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ description: 'Follow up call', isComplete: false }) },
      { id: '2', data: () => ({ description: 'Send proposal', isComplete: true }) }
    ];

    const mockSnapshot = { docs: mockDocs };
    spyOn(window as any, 'getDocs').and.returnValue(Promise.resolve(mockSnapshot));

    const result = await service.getActionItemsByOpportunity('opp123');

    expect(result.length).toBe(2);
    expect(result[0].description).toBe('Follow up call');
  });
});
