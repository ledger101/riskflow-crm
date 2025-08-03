import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    this.auth = this.firebaseService.getAuth();
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async isAdmin(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;

      const firestore = this.firebaseService.getFirestore();
      const userRoleDoc = await getDoc(doc(firestore, 'userRoles', user.uid));
      
      if (userRoleDoc.exists()) {
        const userData = userRoleDoc.data();
        return userData['role'] === 'Admin';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async getUserRole(): Promise<string | null> {
    try {
      const user = this.getCurrentUser();
      if (!user) return null;

      const firestore = this.firebaseService.getFirestore();
      const userRoleDoc = await getDoc(doc(firestore, 'userRoles', user.uid));
      
      if (userRoleDoc.exists()) {
        const userData = userRoleDoc.data();
        return userData['role'] || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
}
