import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Firestore, collection, getDocs, setDoc, updateDoc, doc, query, where, getDocs as getDocsAlias, addDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface AppUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  confirmed?: boolean;
  invitedAt?: any;
  confirmedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth: Auth;
  private firestore: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.auth = this.firebaseService.getAuth();
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Returns true if the email exists in admin-managed user records (userRoles collection).
   * Performs a direct equality query then falls back to a case-insensitive scan for robustness.
   */
  async isEmailAllowed(email: string): Promise<boolean> {
    const candidate = (email || '').trim();
    if (!candidate) return false;

    // First: direct match (fast path)
    const directQ = query(collection(this.firestore, 'userRoles'), where('email', '==', candidate));
    const directSnap = await getDocs(directQ);
    if (!directSnap.empty) return true;

    // Fallback: case-insensitive compare across small dataset
    const all = await getDocs(collection(this.firestore, 'userRoles'));
    const norm = candidate.toLowerCase();
    return all.docs.some(d => (d.data()['email'] || '').toString().trim().toLowerCase() === norm);
  }

  // Legacy direct creation with password (kept)
  async createUser(userData: { name: string; email: string; password: string; role: string }): Promise<void> {
    const userCred = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);
    await setDoc(doc(this.firestore, 'userRoles', userCred.user.uid), {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      confirmed: true,
      confirmedAt: new Date()
    });
  }

  // New: create placeholder invited user (no auth user yet) returns doc id
  async inviteUser(userData: { name: string; email: string; role: string }): Promise<string> {
    const ref = await addDoc(collection(this.firestore, 'userRoles'), {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      confirmed: false,
      invitedAt: new Date()
    });
    return ref.id;
  }

  async markUserConfirmed(authUid: string, email: string): Promise<void> {
    // Try to find placeholder by email if no doc with authUid exists
    const userDocRef = doc(this.firestore, 'userRoles', authUid);
    const userDocSnap = await getDocsAlias(query(collection(this.firestore, 'userRoles'), where('email', '==', email)));

    // If there's already a doc with authUid, just update it
    // However since placeholder has random id, we copy data into auth uid doc
    if (!userDocSnap.empty) {
      const placeholder = userDocSnap.docs[0];
      // If placeholder id equals authUid just update; else create new doc with authUid and delete placeholder (simplify by just updating placeholder for now)
      await updateDoc(placeholder.ref, {
        confirmed: true,
        confirmedAt: new Date()
      });
    } else {
      // No placeholder, create new
      await setDoc(userDocRef, { email, confirmed: true, confirmedAt: new Date(), role: 'Read-Only' });
    }
  }

  async updateUser(userId: string, userData: { name: string; email: string; role: string }): Promise<void> {
    await updateDoc(doc(this.firestore, 'userRoles', userId), userData);
  }

  async getUsers(): Promise<AppUser[]> {
    const snapshot = await getDocs(collection(this.firestore, 'userRoles'));
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      name: docSnap.data()['name'] || '',
      email: docSnap.data()['email'] || '',
      role: docSnap.data()['role'] || '',
      confirmed: docSnap.data()['confirmed'] ?? true,
      invitedAt: docSnap.data()['invitedAt'] || null,
      confirmedAt: docSnap.data()['confirmedAt'] || null
    }));
  }
}
