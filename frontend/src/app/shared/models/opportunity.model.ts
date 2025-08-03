export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  solutionId: string;
  solutionName: string;
  ownerId: string;
  description: string;
  value: number;
  stage: string;
  probability: number;
  createdAt: any;
}
