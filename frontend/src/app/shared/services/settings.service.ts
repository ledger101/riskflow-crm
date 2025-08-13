import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  /**
   * Returns the year-end date for a given year.
   * @param year The year for which to get the year-end date.
   * @returns Date object representing December 31st of the given year.
   */
  getYearEndDate(year: number): Date {
    return new Date(year, 11, 31); // Month is 0-indexed: 11 = December
  }
}
