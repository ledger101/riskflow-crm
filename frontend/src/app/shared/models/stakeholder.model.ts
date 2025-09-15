export type StakeholderRole = 'Decision Maker' | 'Influencer' | 'User' | 'Agent' | 'Sponsor' | 'Other';
export type StakeholderSource = 'client' | 'opportunity';

export interface Stakeholder {
  id: string;
  opportunityId: string;
  clientId: string;
  contactId?: string; // link to a client contact when selected
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  role?: StakeholderRole;
  primary?: boolean; // first/primary stakeholder = contact person for the opportunity
  notes?: string;
  source?: StakeholderSource; // where this stakeholder originated
  createdAt: any; // Firestore Timestamp
  createdBy?: string;
  createdByName?: string;
  updatedAt?: any; // Firestore Timestamp
}
