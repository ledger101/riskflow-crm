import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Communication } from '../../shared/models/communication.model';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  
  constructor(private firebaseService: FirebaseService) {}

  async getCommunicationsByOpportunity(opportunityId: string): Promise<Communication[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const communicationsRef = collection(firestore, 'communications');
      
      // Try with orderBy first, fallback to simple query if index doesn't exist
      let q;
      try {
        q = query(
          communicationsRef, 
          where('opportunityId', '==', opportunityId),
          orderBy('date', 'desc')
        );
      } catch (indexError) {
        console.warn('Index not found, using simple query:', indexError);
        q = query(
          communicationsRef, 
          where('opportunityId', '==', opportunityId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const communications: Communication[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        communications.push({
          id: doc.id,
          ...data
        } as Communication);
      });
      
      // Sort manually if we couldn't use orderBy
      communications.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      return communications;
    } catch (error) {
      console.error('Error fetching communications:', error);
      return [];
    }
  }

  async addCommunication(communication: Omit<Communication, 'id' | 'createdAt'>): Promise<string> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const communicationsRef = collection(firestore, 'communications');
      const docRef = await addDoc(communicationsRef, {
        ...communication,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  }
}
