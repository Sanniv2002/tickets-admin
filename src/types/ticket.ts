export interface Ticket {
  _id?: string;
  name: string;
  email: string;
  rollNumber: string;
  contactNumber: string;
  degree: string;
  year: string;
  branch: string;
  stage: string;
  createdAt: Date;
  payment_verified?: boolean;
  ticket_given?: boolean;
  payment_proof?: string;
  sheetId?: string;
  score?: number;
  ticket_number?: string;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  tickets: Ticket[];
}