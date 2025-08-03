import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Client } from '../../shared/models/client.model';
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
export class ClientService {
  
  constructor(private firebaseService: FirebaseService) {}

  async getClients(): Promise<Client[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const clientsRef = collection(firestore, 'clients');
      const q = query(clientsRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        } as Client);
      });
      
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async createClient(client: Omit<Client, 'id'>): Promise<string> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const clientsRef = collection(firestore, 'clients');
      const docRef = await addDoc(clientsRef, {
        ...client,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const clientRef = doc(firestore, 'clients', id);
      await updateDoc(clientRef, {
        ...client,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      // Check if client is associated with any opportunities
      const isAssociated = await this.isClientAssociatedWithOpportunities(id);
      if (isAssociated) {
        throw new Error('Cannot delete client that is associated with existing opportunities');
      }

      const firestore = this.firebaseService.getFirestore();
      const clientRef = doc(firestore, 'clients', id);
      await deleteDoc(clientRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const clientRef = doc(firestore, 'clients', id);
      const docSnap = await getDoc(clientRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Client;
      }
      return null;
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      return null;
    }
  }

  async getClientsByCountry(country: string): Promise<Client[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const clientsRef = collection(firestore, 'clients');
      const q = query(clientsRef, where('country', '==', country), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        } as Client);
      });
      
      return clients;
    } catch (error) {
      console.error('Error fetching clients by country:', error);
      return [];
    }
  }

  async getClientsByIndustry(industry: string): Promise<Client[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const clientsRef = collection(firestore, 'clients');
      const q = query(clientsRef, where('industry', '==', industry), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        } as Client);
      });
      
      return clients;
    } catch (error) {
      console.error('Error fetching clients by industry:', error);
      return [];
    }
  }

  private async isClientAssociatedWithOpportunities(clientId: string): Promise<boolean> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const opportunitiesRef = collection(firestore, 'opportunities');
      const q = query(opportunitiesRef, where('clientId', '==', clientId));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking client associations:', error);
      return false; // Default to false to allow deletion if check fails
    }
  }
}
