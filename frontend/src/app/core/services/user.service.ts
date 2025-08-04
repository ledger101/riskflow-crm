import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Firestore, collection, getDocs, setDoc, updateDoc, doc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface AppUser {
  id: string;
  name?: string;
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

  async createUser(userData: { name: string; email: string; password: string; role: string }): Promise<void> {
    const userCred = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);
    // Store role in Firestore userRoles collection
    await setDoc(doc(this.firestore, 'userRoles', userCred.user.uid), {
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
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
      role: docSnap.data()['role'] || ''
    }));
  }
}
