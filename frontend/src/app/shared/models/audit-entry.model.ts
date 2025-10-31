export type AuditChangeType = 'created' | 'stage' | 'value' | 'probability' | 'description' | 'solution' | 'solution_added' | 'solution_removed' | 'owner';

export interface AuditEntry {
  id: string;
  opportunityId: string;
  type: AuditChangeType;
  oldValue?: any;
  newValue?: any;
  message?: string; // optional human-readable summary
  userId: string;
  userName?: string;
  createdAt: any; // Firestore Timestamp
}
