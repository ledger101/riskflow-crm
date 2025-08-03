import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Define interfaces for settings
export interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'flat';
  period: string;
}

export interface SalesTargets {
  id: string;
  monthly: number;
  quarterly: number;
  annual: number;
  lastUpdated: Date;
  // Add these for compatibility with the component
  annualTarget: number;
  quarterlyTarget: number;
  monthlyTarget: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Get financial metrics for the dashboard
   */
  getFinancialMetrics(): Observable<FinancialMetric[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const metricsRef = collection(firestore, 'financialMetrics');
      
      return from(getDocs(metricsRef)).pipe(
        map(snapshot => {
          const metrics: FinancialMetric[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            metrics.push({
              id: doc.id,
              name: data['name'] || '',
              value: data['value'] || 0,
              target: data['target'] || 0,
              trend: data['trend'] || 'flat',
              period: data['period'] || 'monthly'
            });
          });
          return metrics;
        }),
        catchError(error => {
          console.error('Error fetching financial metrics:', error);
          return of([]);
        })
      );
    } catch (error) {
      console.error('Error in getFinancialMetrics:', error);
      return of([]);
    }
  }

  /**
   * Get sales targets
   */
  getSalesTargets(): Observable<SalesTargets> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const targetRef = doc(firestore, 'settings', 'salesTargets');
      
      return from(getDoc(targetRef)).pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              monthly: data['monthly'] || 0,
              quarterly: data['quarterly'] || 0,
              annual: data['annual'] || 0,
              lastUpdated: data['lastUpdated']?.toDate() || new Date(),
              // Add these for compatibility with the component
              monthlyTarget: data['monthly'] || 0,
              quarterlyTarget: data['quarterly'] || 0,
              annualTarget: data['annual'] || 0
            };
          } else {
            return {
              id: 'salesTargets',
              monthly: 0,
              quarterly: 0,
              annual: 0,
              lastUpdated: new Date(),
              // Add these for compatibility with the component
              monthlyTarget: 0,
              quarterlyTarget: 0,
              annualTarget: 0
            };
          }
        }),
        catchError(error => {
          console.error('Error fetching sales targets:', error);
          return of({
            id: 'salesTargets',
            monthly: 0,
            quarterly: 0,
            annual: 0,
            lastUpdated: new Date(),
            // Add these for compatibility with the component
            monthlyTarget: 0,
            quarterlyTarget: 0,
            annualTarget: 0
          });
        })
      );
    } catch (error) {
      console.error('Error in getSalesTargets:', error);
      return of({
        id: 'salesTargets',
        monthly: 0,
        quarterly: 0,
        annual: 0,
        lastUpdated: new Date(),
        // Add these for compatibility with the component
        monthlyTarget: 0,
        quarterlyTarget: 0,
        annualTarget: 0
      });
    }
  }

  /**
   * Update sales targets
   */
  updateSalesTargets(targets: Partial<SalesTargets>): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const targetRef = doc(firestore, 'settings', 'salesTargets');
      
      return setDoc(targetRef, {
        ...targets,
        lastUpdated: new Date()
      }, { merge: true });
    }  catch (error) {
      console.error('Error updating sales targets:', error);
      throw error;
    }
  }

  /**
   * Get current sales targets (async version)
   */
  async getCurrentTargets(): Promise<SalesTargets> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const targetRef = doc(firestore, 'settings', 'salesTargets');
      const docSnap = await getDoc(targetRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          monthly: data['monthly'] || 0,
          quarterly: data['quarterly'] || 0,
          annual: data['annual'] || 0,
          lastUpdated: data['lastUpdated']?.toDate() || new Date(),
          // Add these for compatibility with the component
          monthlyTarget: data['monthly'] || 0,
          quarterlyTarget: data['quarterly'] || 0,
          annualTarget: data['annual'] || 0
        };
      } else {
        return {
          id: 'salesTargets',
          monthly: 0,
          quarterly: 0,
          annual: 0,
          lastUpdated: new Date(),
          monthlyTarget: 0,
          quarterlyTarget: 0,
          annualTarget: 0
        };
      }
    } catch (error) {
      console.error('Error getting current targets:', error);
      return {
        id: 'salesTargets',
        monthly: 0,
        quarterly: 0,
        annual: 0,
        lastUpdated: new Date(),
        monthlyTarget: 0,
        quarterlyTarget: 0,
        annualTarget: 0
      };
    }
  }

  /**
   * Date utility methods for the financial widget
   */
  getQuarterStartDate(year: number, quarter: number): Date {
    const month = (quarter - 1) * 3;
    return new Date(year, month, 1);
  }

  getQuarterEndDate(year: number, quarter: number): Date {
    const month = (quarter * 3) - 1;
    return new Date(year, month + 1, 0); // Last day of the month
  }

  getYearStartDate(year: number): Date {
    return new Date(year, 0, 1);
  }

  getYearEndDate(year: number): Date {
    return new Date(year, 11, 31);
  }
}
