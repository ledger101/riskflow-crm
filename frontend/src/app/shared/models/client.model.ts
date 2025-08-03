export interface Client {
  id?: string;
  name: string;
  country: string;
  industry: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
