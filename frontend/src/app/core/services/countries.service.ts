import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { collection, getDocs, addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  constructor(private firebaseService: FirebaseService) {}

  async getCountries(): Promise<string[]> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const countriesRef = collection(firestore, 'countries');
      const querySnapshot = await getDocs(countriesRef);

      const countries: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        countries.push(data['name']);
      });

      return countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }

  async addCountry(country: string): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const countriesRef = collection(firestore, 'countries');
      await addDoc(countriesRef, { name: country });
    } catch (error) {
      console.error('Error adding country:', error);
      throw error;
    }
  }
}
