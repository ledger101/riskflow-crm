import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuditEntry } from '../../shared/models/audit-entry.model';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private firebaseService: FirebaseService) {}

  async addEntry(entry: Omit<AuditEntry, 'id' | 'createdAt'>): Promise<string> {
    const firestore = this.firebaseService.getFirestore();
    const ref = collection(firestore, 'auditEntries');
    const docRef = await addDoc(ref, { ...entry, createdAt: Timestamp.now() });
    return docRef.id;
  }

  async getEntries(opportunityId: string): Promise<AuditEntry[]> {
    const firestore = this.firebaseService.getFirestore();
    const ref = collection(firestore, 'auditEntries');
    let q;
    try {
      q = query(ref, where('opportunityId', '==', opportunityId), orderBy('createdAt', 'desc'));
    } catch {
      q = query(ref, where('opportunityId', '==', opportunityId));
    }
    const snap = await getDocs(q);
    const list: AuditEntry[] = [];
    snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) } as AuditEntry));
    list.sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });
    return list;
  }
}
