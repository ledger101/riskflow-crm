import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countries: string[] = ['USA', 'Canada', 'Mexico', 'UK', 'Germany'];

  async getCountries(): Promise<string[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.countries), 1000);
    });
  }
}
