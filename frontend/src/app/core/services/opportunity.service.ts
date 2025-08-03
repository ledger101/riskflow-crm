import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Opportunity } from '../../shared/models/opportunity.model';

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private firestore: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  async getOpportunities(): Promise<Opportunity[]> {
    const coll = collection(this.firestore, 'opportunities');
    const snapshot = await getDocs(coll);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Opportunity));
  }

  async createOpportunity(opportunity: Omit<Opportunity, 'id'>): Promise<string> {
    const coll = collection(this.firestore, 'opportunities');
    const docRef = await addDoc(coll, {
      ...opportunity,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const docRef = doc(this.firestore, 'opportunities', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Opportunity;
    }
    return null;
  }

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<void> {
    const docRef = doc(this.firestore, 'opportunities', id);
    await updateDoc(docRef, updates);
  }
}
