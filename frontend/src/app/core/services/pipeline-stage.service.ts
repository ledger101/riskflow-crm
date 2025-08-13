import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { PipelineStage } from '../../shared/models/pipeline-stage.model';
import { FirebaseService } from './firebase.service';
import { 
  Firestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class PipelineStageService {
  private firestore: Firestore;
  private collectionName = 'pipelineStages';

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Real-time observable of pipeline stages ordered by 'order'.
   */
  getStages(): Observable<PipelineStage[]> {
    return new Observable<PipelineStage[]>(subscriber => {
      const collRef = collection(this.firestore, this.collectionName);
      const qRef = query(collRef, orderBy('order', 'asc'));
      const unsubscribe = onSnapshot(qRef, snapshot => {
        const stages: PipelineStage[] = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as any)
        }));
        subscriber.next(stages);
      }, error => subscriber.error(error));
      return () => unsubscribe();
    });
  }

  /**
   * One-time fetch of stages (used by dashboard widget).
   */
  async getStagesPromise(): Promise<PipelineStage[]> {
    const collRef = collection(this.firestore, this.collectionName);
    const qRef = query(collRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(qRef);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as PipelineStage));
  }

  /**
   * Add a new pipeline stage. Returns created document id.
   */
  async addStage(stage: Omit<PipelineStage, 'id'>): Promise<string> {
    const collRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(collRef, stage);
    return docRef.id;
  }

  /**
   * Update a pipeline stage (id field is not stored in document body).
   */
  async updateStage(stage: PipelineStage): Promise<void> {
    const { id, ...data } = stage;
    const docRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(docRef, data as any);
  }

  /**
   * Delete a pipeline stage by id.
   */
  async deleteStage(stageId: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, stageId);
    await deleteDoc(docRef);
  }

  /**
   * Batch update stage order indices after drag & drop reorder.
   */
  async updateStageOrders(stagesInNewOrder: PipelineStage[]): Promise<void> {
    if (!stagesInNewOrder || stagesInNewOrder.length === 0) return;
    // Map existing order to detect changes
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(this.firestore);
    let changes = 0;
    stagesInNewOrder.forEach((stage, index) => {
      if (stage.order !== index) {
        changes++;
        const ref = doc(this.firestore, this.collectionName, stage.id);
        batch.update(ref, { order: index });
      }
    });
    if (changes === 0) return; // Nothing changed
    await batch.commit();
  }

  /**
   * Seed the collection with the original hardcoded default stages if empty.
   * Safe to call multiple times; it only inserts when collection has no docs.
   */
  async seedDefaultStages(): Promise<void> {
    const collRef = collection(this.firestore, this.collectionName);
    const snapshot = await getDocs(collRef);
    if (!snapshot.empty) return; // Already seeded

    const defaultStages: Array<Omit<PipelineStage, 'id'>> = [
      { name: 'Tender', defaultProbability: 10, order: 0 },
      { name: 'Lead', defaultProbability: 10, order: 1 },
      { name: 'Contact', defaultProbability: 15, order: 2 },
      { name: 'Proposal', defaultProbability: 20, order: 3 },
      { name: 'Decision', defaultProbability: 25, order: 4 },
      { name: 'Awarded', defaultProbability: 40, order: 5 },
      { name: 'Client', defaultProbability: 50, order: 6 },
      { name: 'Implementation', defaultProbability: 70, order: 7 },
      { name: 'Acceptance Testing', defaultProbability: 90, order: 8 },
      { name: 'Go-Live', defaultProbability: 100, order: 9 }
    ];

    // Use batched writes for efficiency
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(this.firestore);
    defaultStages.forEach(s => {
      const newDocRef = doc(collRef);
      batch.set(newDocRef, s as any);
    });
    await batch.commit();
  }
}
