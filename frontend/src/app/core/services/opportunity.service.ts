import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Opportunity } from '../../shared/models/opportunity.model';
import { AuditService } from './audit.service';

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private firestore: Firestore;

  constructor(private firebaseService: FirebaseService, private auditService: AuditService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  async getOpportunities(): Promise<Opportunity[]> {
    const coll = collection(this.firestore, 'opportunities');
    const snapshot = await getDocs(coll);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Opportunity));
  }

  /**
   * Real-time observable stream of opportunities.
   */
  getOpportunitiesStream(): Observable<Opportunity[]> {
    return new Observable<Opportunity[]>(subscriber => {
      const coll = collection(this.firestore, 'opportunities');
      const unsubscribe = onSnapshot(coll, snapshot => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Opportunity));
        subscriber.next(list);
      }, err => subscriber.error(err));
      return () => unsubscribe();
    });
  }

  async createOpportunity(opportunity: Omit<Opportunity, 'id'> & { createdByUserId?: string; createdByUserName?: string }): Promise<string> {
    const coll = collection(this.firestore, 'opportunities');
    
    // Ensure solutions and solutionIds are in sync
    const opportunityData = this.normalizeSolutionData(opportunity);
    
    const docRef = await addDoc(coll, {
      ...opportunityData,
      createdAt: Timestamp.now()
    });
    // create audit entry for creation
    try {
      await this.auditService.addEntry({
        opportunityId: docRef.id,
        type: 'created',
        userId: opportunity.createdByUserId || 'unknown',
        userName: opportunity.createdByUserName || 'Unknown',
        message: 'Opportunity created'
      });
    } catch (e) {
      console.warn('Failed to create audit entry for creation', e);
    }
    return docRef.id;
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const docRef = doc(this.firestore, 'opportunities', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Opportunity;
    }
    return null;
  }

  async updateOpportunity(id: string, updates: Partial<Opportunity> & { _auditUserId?: string; _auditUserName?: string }): Promise<void> {
    const docRef = doc(this.firestore, 'opportunities', id);
    // fetch current to compute diffs for audit
    let before: Opportunity | null = null;
    try {
      before = await this.getOpportunityById(id);
    } catch {}
    
    // Normalize solution data before update
    const normalizedUpdates = this.normalizeSolutionData(updates);
    
    // strip audit-only fields from write
    const { _auditUserId, _auditUserName, ...clean } = normalizedUpdates as any;
    await updateDoc(docRef, clean);

    // audit for supported changes
    if (before) {
      const entries: Array<{ type: 'stage' | 'value' | 'probability' | 'description' | 'solution' | 'solution_added' | 'solution_removed' | 'owner'; oldValue: any; newValue: any }> = [];
      if (updates.stage || updates.stageId) {
        const oldStage = before.stage || before.stageId;
        const newStage = updates.stage || updates.stageId;
        if (newStage && oldStage !== newStage) {
          entries.push({ type: 'stage', oldValue: oldStage, newValue: newStage });
        }
      }
      if (typeof updates.value === 'number' && updates.value !== before.value) {
        entries.push({ type: 'value', oldValue: before.value, newValue: updates.value });
      }
      if (typeof updates.probability === 'number' && updates.probability !== before.probability) {
        entries.push({ type: 'probability', oldValue: before.probability, newValue: updates.probability });
      }
      if (typeof updates.description === 'string' && updates.description !== before.description) {
        entries.push({ type: 'description', oldValue: before.description, newValue: updates.description });
      }
      
      // Handle solution changes - compare arrays
      if (updates.solutions || updates.solutionIds) {
        const oldSolutionIds = before.solutionIds || (before.solutionId ? [before.solutionId] : []);
        const newSolutionIds = normalizedUpdates.solutionIds || [];
        
        // Find added and removed solutions
        const added = newSolutionIds.filter((id: string) => !oldSolutionIds.includes(id));
        const removed = oldSolutionIds.filter((id: string) => !newSolutionIds.includes(id));
        
        if (added.length > 0) {
          const addedNames = normalizedUpdates.solutions?.filter((s: any) => added.includes(s.id)).map((s: any) => s.name) || added;
          entries.push({ type: 'solution_added', oldValue: '', newValue: addedNames.join(', ') });
        }
        
        if (removed.length > 0) {
          const removedNames = before.solutions?.filter((s: any) => removed.includes(s.id)).map((s: any) => s.name) || removed;
          entries.push({ type: 'solution_removed', oldValue: removedNames.join(', '), newValue: '' });
        }
      }
      
      // legacy solution change
      if ((updates.solutionId && updates.solutionId !== before.solutionId) || (updates.solutionName && updates.solutionName !== before.solutionName)) {
        entries.push({ type: 'solution', oldValue: before.solutionName || before.solutionId, newValue: updates.solutionName || updates.solutionId });
      }
      if (updates.ownerId && updates.ownerId !== before.ownerId) {
        entries.push({ type: 'owner', oldValue: before.ownerId, newValue: updates.ownerId });
      }
      for (const e of entries) {
        try {
          await this.auditService.addEntry({
            opportunityId: id,
            type: e.type,
            oldValue: e.oldValue,
            newValue: e.newValue,
            userId: _auditUserId || 'unknown',
            userName: _auditUserName || 'Unknown'
          });
        } catch (err) {
          console.warn('Failed to write audit entry', err);
        }
      }
    }
  }

  async deleteOpportunity(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'opportunities', id);
    await deleteDoc(docRef);
  }

  /**
   * Normalizes solution data to ensure solutions and solutionIds are in sync
   * and provides backward compatibility with legacy solutionId/solutionName
   */
  private normalizeSolutionData(data: any): any {
    const normalized = { ...data };
    
    // If solutions array is provided, ensure solutionIds is in sync
    if (normalized.solutions && Array.isArray(normalized.solutions)) {
      normalized.solutionIds = normalized.solutions.map((s: any) => s.id).filter(Boolean);
      
      // For backward compatibility, set legacy fields to the first solution
      if (normalized.solutions.length > 0) {
        normalized.solutionId = normalized.solutions[0].id;
        normalized.solutionName = normalized.solutions[0].name;
      }
    }
    // If solutionIds is provided but solutions is not, we need solutions data
    else if (normalized.solutionIds && Array.isArray(normalized.solutionIds) && !normalized.solutions) {
      // This case might happen during updates - we'll keep solutionIds but warn
      console.warn('solutionIds provided without solutions data - this may cause display issues');
    }
    // Legacy case: if solutionId is provided but no solutions/solutionIds
    else if (normalized.solutionId && !normalized.solutions && !normalized.solutionIds) {
      normalized.solutionIds = [normalized.solutionId];
      // We can't create full solutions array without additional data, so we'll set a minimal one
      if (normalized.solutionName) {
        normalized.solutions = [{ id: normalized.solutionId, name: normalized.solutionName }];
      }
    }
    
    return normalized;
  }
}
