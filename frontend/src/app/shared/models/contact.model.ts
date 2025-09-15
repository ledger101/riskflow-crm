export interface Contact {
  id: string;
  clientId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}
