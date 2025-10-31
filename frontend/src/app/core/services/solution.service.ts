import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Solution } from '../../shared/models/solution.model';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  where
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SolutionService {
  
  constructor(private firebaseService: FirebaseService) {}

  async getSolutions(): Promise<Solution[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const solutionsRef = collection(firestore, 'solutions');
      const q = query(solutionsRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const solutions: Solution[] = [];
      querySnapshot.forEach((doc) => {
        solutions.push({
          id: doc.id,
          ...doc.data()
        } as Solution);
      });
      
      return solutions;
    } catch (error) {
      console.error('Error fetching solutions:', error);
      return [];
    }
  }

  async createSolution(solution: Omit<Solution, 'id'>): Promise<string> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const solutionsRef = collection(firestore, 'solutions');
      
      const solutionData = {
        ...solution,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: solution.isActive !== false // Default to true if not specified
      };
      
      const docRef = await addDoc(solutionsRef, solutionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating solution:', error);
      throw error;
    }
  }

  async updateSolution(id: string, solution: Partial<Solution>): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const solutionRef = doc(firestore, 'solutions', id);
      
      const updateData = {
        ...solution,
        updatedAt: new Date()
      };
      
      await updateDoc(solutionRef, updateData);
    } catch (error) {
      console.error('Error updating solution:', error);
      throw error;
    }
  }

  async deleteSolution(id: string): Promise<void> {
    try {
      // Check if solution is associated with any opportunities
      const isAssociated = await this.isSolutionAssociatedWithOpportunities(id);
      if (isAssociated) {
        throw new Error('Cannot delete solution that is associated with existing opportunities');
      }

      const firestore = this.firebaseService.getFirestore();
      const solutionRef = doc(firestore, 'solutions', id);
      await deleteDoc(solutionRef);
    } catch (error) {
      console.error('Error deleting solution:', error);
      throw error;
    }
  }

  async getSolutionById(id: string): Promise<Solution | null> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const solutionRef = doc(firestore, 'solutions', id);
      const docSnap = await getDoc(solutionRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Solution;
      }
      return null;
    } catch (error) {
      console.error('Error fetching solution by ID:', error);
      return null;
    }
  }

  private async isSolutionAssociatedWithOpportunities(solutionId: string): Promise<boolean> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const opportunitiesRef = collection(firestore, 'opportunities');
      
      // Check both new solutionIds array and legacy solutionId for backward compatibility
      const newQuery = query(opportunitiesRef, where('solutionIds', 'array-contains', solutionId));
      const legacyQuery = query(opportunitiesRef, where('solutionId', '==', solutionId));
      
      const [newSnapshot, legacySnapshot] = await Promise.all([
        getDocs(newQuery),
        getDocs(legacyQuery)
      ]);
      
      return !newSnapshot.empty || !legacySnapshot.empty;
    } catch (error) {
      console.error('Error checking solution associations:', error);
      return false; // Default to false to allow deletion if check fails
    }
  }
}
