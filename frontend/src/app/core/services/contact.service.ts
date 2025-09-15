import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Contact } from '../../shared/models/contact.model';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private firebaseService: FirebaseService) {}

  async getContactsByClient(clientId: string): Promise<Contact[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const contactsRef = collection(firestore, 'clients', clientId, 'contacts');
      let q;
      try {
        q = query(contactsRef, orderBy('name'));
      } catch {
        q = query(contactsRef);
      }
      const snap = await getDocs(q);
      const contacts: Contact[] = [];
      snap.forEach(d => contacts.push({ id: d.id, clientId, ...d.data() } as Contact));
      contacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return contacts;
    } catch (e) {
      console.error('Error fetching contacts:', e);
      return [];
    }
  }

  async addContact(clientId: string, contact: Omit<Contact, 'id' | 'createdAt' | 'clientId'>): Promise<string> {
    const firestore = this.firebaseService.getFirestore();
    const contactsRef = collection(firestore, 'clients', clientId, 'contacts');
    const docRef = await addDoc(contactsRef, { ...contact, createdAt: Timestamp.now() });
    return docRef.id;
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    // Note: contactId alone is insufficient to address a subcollection doc path here; consumers should handle updates via their own context if needed.
    // For now, keep method for interface completeness but it's not used in current UI.
    console.warn('updateContact requires full path; not implemented for subcollection in current UI.');
  }

  async deleteContact(contactId: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    console.warn('deleteContact requires full path; not implemented for subcollection in current UI.');
  }
}
