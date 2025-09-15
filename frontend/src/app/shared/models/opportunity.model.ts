export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  clientCountry?: string;
  solutionId: string;
  solutionName: string;
  ownerId: string;
  description: string;
  value: number;
  stage: string; // legacy: previously stored stage order or id
  stageId?: string; // canonical pipeline stage document id
  probability: number;
  createdAt: any;
  // creator metadata (new)
  createdByUserId?: string;
  createdByUserName?: string;
}
