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
  entry_marked?: boolean;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  tickets: Ticket[];
  fromCache: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface Analytics {
  totalTickets: number;
  completedTicketsStage2: number;
  verifiedPayments: number;
  entriesMarked: number;
  timestamp: string;
}


export interface TicketPricing {
  id: string,
  offer: string,
  active: boolean,
  price: string
}

export interface Offer {
  _id: string;
  offer: string;
  active: boolean;
  price: string;
}

export interface User {
  isSuperAdmin: boolean;
  hasOnboarded?: boolean;
}

export interface Bill {
  _id: string;
  title: string;
  amount: number;
  description: string;
  billUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface PaginatedBillsResponse {
  bills: Bill[];
  total: number;
  page: number;
  limit: number;
}

export interface Note {
  _id: string;
  title: string;
  description: string;
  isPinned: boolean;
  isArchived: boolean;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  children?: Note[];
}