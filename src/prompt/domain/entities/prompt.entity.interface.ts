export interface IPrompt {
  id: string;
  userId: string;
  text: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}
