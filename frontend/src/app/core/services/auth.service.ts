import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, updatePassword } from 'firebase/auth';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private initialized$ = new BehaviorSubject<boolean>(false);
  public authReady$ = this.initialized$.asObservable().pipe(filter(Boolean));

  // Action Code Settings for email link sign-in
  private actionCodeSettings = {
    // The deep link (must be whitelisted in Firebase console)
    url: window.location.origin + '/login?source=invite',
    handleCodeInApp: true
  };

  constructor(private firebaseService: FirebaseService, private userService: UserService) {
    this.auth = this.firebaseService.getAuth();
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
  this.initialized$.next(true);
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

  async waitForAuthInit(): Promise<void> {
    try {
      await firstValueFrom(this.authReady$);
    } catch {
      // no-op; treat as not ready
    }
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

  // Added method to fetch sales team members
  async getSalesTeamMembers(): Promise<{ id: string; name: string }[]> {
    return [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ];
  }

  // ---- Email Link (Passwordless) Invitation Flow ----
  async sendSignInLink(email: string): Promise<void> {
    // Only allow if email exists in admin-managed users collection
    const allowed = await this.userService.isEmailAllowed(email);
    if (!allowed) {
      throw new Error('This email is not authorized. Please contact your administrator.');
    }
    await sendSignInLinkToEmail(this.auth, email, this.actionCodeSettings);
    // Store email locally for completion
    window.localStorage.setItem('pendingEmail', email);
  }

  isEmailLink(url?: string): boolean {
    return isSignInWithEmailLink(this.auth, url || window.location.href);
  }

  async completeEmailLinkSignIn(url?: string, email?: string): Promise<User> {
    const link = url || window.location.href;
    let finalEmail = email;
    if (!finalEmail) {
      finalEmail = window.localStorage.getItem('pendingEmail') || '';
      if (!finalEmail) throw new Error('Email required to complete sign-in');
    }
    const cred = await signInWithEmailLink(this.auth, finalEmail, link);
    window.localStorage.removeItem('pendingEmail');
    // Mark user confirmed (placeholder update) – ignore errors silently
    try { await this.userService.markUserConfirmed(cred.user.uid, finalEmail); } catch { }
    return cred.user;
  }

  async setInitialPassword(newPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');
    await updatePassword(user, newPassword);
    // Optional: mark user as initialized
    try {
      const firestore = this.firebaseService.getFirestore();
      await updateDoc(doc(firestore, 'userRoles', user.uid), { passwordSet: true });
    } catch (e) { /* ignore if doc missing */ }
  }
}
