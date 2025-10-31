export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  clientCountry?: string;
  // New: list of full solution objects (keeps name/cost for display without extra joins)
  solutions?: Array<{ id: string; name: string; cost?: number }>;
  // New: array of solution ids for efficient querying
  solutionIds?: string[];
  // Legacy (deprecated) single-solution fields - keep until migration + cleanup
  solutionId?: string;
  solutionName?: string;
  ownerId: string;
  description: string;
  value: number; // By default: sum(solutions.cost) but can be overridden by user
  stage: string; // legacy: previously stored stage order or id
  stageId?: string; // canonical pipeline stage document id
  probability: number;
  createdAt: any;
  // creator metadata (new)
  createdByUserId?: string;
  createdByUserName?: string;
}
