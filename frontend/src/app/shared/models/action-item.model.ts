export interface ActionItem {
  id: string;
  opportunityId: string;
  description: string;
  dueDate?: any; // Firestore Timestamp
  isComplete: boolean;
  completedAt?: any; // Firestore Timestamp
  createdBy: string;
  createdByName?: string;
  createdAt: any; // Firestore Timestamp
}
