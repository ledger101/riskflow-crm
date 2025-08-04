export interface Client {
  id?: string;
  name: string;
  country: string;
  contactPerson?: string;
  contactTitle?: string;
  relationshipNature?: 'Good' | 'Mature' | 'Needs Maintenance' | 'Poor';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
