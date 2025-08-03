import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { ActionItem } from '../../shared/models/action-item.model';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ActionItemService {
  
  constructor(private firebaseService: FirebaseService) {}

  async getActionItemsByOpportunity(opportunityId: string): Promise<ActionItem[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const actionItemsRef = collection(firestore, 'actionItems');
      
      // Try with orderBy first, fallback to simple query if index doesn't exist
      let q;
      try {
        q = query(
          actionItemsRef, 
          where('opportunityId', '==', opportunityId),
          orderBy('createdAt', 'desc')
        );
      } catch (indexError) {
        console.warn('Index not found, using simple query:', indexError);
        q = query(
          actionItemsRef, 
          where('opportunityId', '==', opportunityId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const actionItems: ActionItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        actionItems.push({
          id: doc.id,
          ...data
        } as ActionItem);
      });
      
      // Sort manually if we couldn't use orderBy
      actionItems.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      return actionItems;
    } catch (error) {
      console.error('Error fetching action items:', error);
      return [];
    }
  }

  async addActionItem(actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'isComplete' | 'completedAt'>): Promise<string> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const actionItemsRef = collection(firestore, 'actionItems');
      const docRef = await addDoc(actionItemsRef, {
        ...actionItem,
        isComplete: false,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding action item:', error);
      throw error;
    }
  }

  async toggleActionItemComplete(actionItemId: string, isComplete: boolean): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const actionItemRef = doc(firestore, 'actionItems', actionItemId);
      const updateData: any = { 
        isComplete 
      };
      
      if (isComplete) {
        updateData.completedAt = Timestamp.now();
      } else {
        updateData.completedAt = null;
      }
      
      await updateDoc(actionItemRef, updateData);
    } catch (error) {
      console.error('Error updating action item:', error);
      throw error;
    }
  }
}
