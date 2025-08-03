import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: any;
  private auth: Auth;
  private firestore: Firestore;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }

  getAuth(): Auth {
    return this.auth;
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  // Health check method to verify Firebase connection
  async healthCheck(): Promise<boolean> {
    try {
      // Simple check to see if Firebase is initialized
      return this.auth !== null && this.firestore !== null;
    } catch (error) {
      console.error('Firebase health check failed:', error);
      return false;
    }
  }
}
