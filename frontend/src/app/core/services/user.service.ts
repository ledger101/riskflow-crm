import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Firestore, collection, getDocs, setDoc, updateDoc, doc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface AppUser {
  id: string;
  email: string;
  role: string;
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

  async createUser(email: string, password: string, role: string): Promise<void> {
    const userCred = await createUserWithEmailAndPassword(this.auth, email, password);
    // Store role in Firestore userRoles collection
    await setDoc(doc(this.firestore, 'userRoles', userCred.user.uid), {
      email,
      role
    });
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'userRoles', userId), { role });
  }

  async getUsers(): Promise<AppUser[]> {
    const snapshot = await getDocs(collection(this.firestore, 'userRoles'));
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    }));
  }
}
