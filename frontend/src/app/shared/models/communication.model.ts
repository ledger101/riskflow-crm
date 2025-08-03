export interface Communication {
  id: string;
  opportunityId: string;
  type: 'Email' | 'Phone Call' | 'WhatsApp' | 'Online Meeting' | 'Physical Meeting';
  date: any; // Firestore Timestamp
  summary: string;
  attachments?: Attachment[];
  createdBy: string;
  createdAt: any; // Firestore Timestamp
}

export interface Attachment {
  fileName: string;
  url: string;
  size?: number;
}
