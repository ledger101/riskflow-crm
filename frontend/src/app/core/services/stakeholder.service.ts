import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Stakeholder } from '../../shared/models/stakeholder.model';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class StakeholderService {
  constructor(private firebaseService: FirebaseService) {}

  private sanitize<T extends Record<string, any>>(obj: T): T {
    const out: any = {};
    Object.keys(obj || {}).forEach(k => {
      const v = (obj as any)[k];
      if (v !== undefined) out[k] = v;
    });
    return out as T;
  }

  async getByOpportunity(opportunityId: string): Promise<Stakeholder[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const ref = collection(firestore, 'stakeholders');
      let q;
      try {
        q = query(ref, where('opportunityId', '==', opportunityId), orderBy('createdAt', 'asc'));
      } catch {
        q = query(ref, where('opportunityId', '==', opportunityId));
      }
      const snap = await getDocs(q);
      const rows: Stakeholder[] = [];
      snap.forEach(d => rows.push({ id: d.id, ...d.data() } as Stakeholder));
      rows.sort((a, b) => {
        // primary first, then by createdAt
        if (a.primary && !b.primary) return -1;
        if (!a.primary && b.primary) return 1;
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return aTime - bTime;
      });
      return rows;
    } catch (e) {
      console.error('Error fetching stakeholders:', e);
      return [];
    }
  }

  async add(opportunityId: string, stakeholder: Omit<Stakeholder, 'id' | 'createdAt' | 'opportunityId'>): Promise<string> {
    const firestore = this.firebaseService.getFirestore();
    const ref = collection(firestore, 'stakeholders');
    const clean = this.sanitize({ ...stakeholder, opportunityId, createdAt: Timestamp.now() });
    const docRef = await addDoc(ref, clean);
    return docRef.id;
  }

  async update(id: string, updates: Partial<Stakeholder>): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const clean = this.sanitize({ ...updates, updatedAt: Timestamp.now() });
    await updateDoc(doc(firestore, 'stakeholders', id), clean);
  }

  async delete(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    await deleteDoc(doc(firestore, 'stakeholders', id));
  }

  async ensurePrimary(opportunityId: string, keepId: string): Promise<void> {
    // ensure only one primary per opportunity
    const items = await this.getByOpportunity(opportunityId);
    const others = items.filter(s => s.id !== keepId && s.primary);
    await Promise.all(others.map(s => this.update(s.id, { primary: false })));
  }
}
