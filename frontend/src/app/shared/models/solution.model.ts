export interface Solution {
  id: string;
  name: string;
  description: string;
  cost: number;
  category?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
