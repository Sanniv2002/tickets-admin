import axios from "axios";
import { PaginatedResponse } from "../types/ticket";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const login = async (email: string, password: string) => {
  if (email === "admin@tedx.com" && password === "admin123") {
    localStorage.setItem("token", "mock-token");
    return true;
  }
  throw new Error("Invalid credentials");
};

export const getTickets = async (page: number): Promise<PaginatedResponse> => {
  const response = await api.get(`/admin/tickets`, {
    params: {
      page,
    },
  });
  return response.data;
};

export const searchTickets = async (query: string): Promise<any>=> {
  const response = await api.get(`admin/tickets/fuzzy`, {
    params: {
      query,
    },
  });
  return response.data;
};

export const verifyPayment = async (ticketId: string) => {
  const response = await api.post(`/admin/verify-payment/${ticketId}`);
  return response.data;
};

export const markTicketGiven = async (ticketId: string, ticketNumber: string) => {
  const response = await api.post(`/admin/mark-ticket-given/${ticketId}`, {
    ticketNumber
  });
  return response.data;
};

export const sendEmail = async (ticketId: string, templateId: string) => {
  const response = await api.post(`/admin/send-email/${ticketId}`, {
    templateId,
  });
  return response.data;
};

export const uploadPaymentProof = async (ticketId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id', ticketId);

  const response = await api.post('/admin/tickets/finalize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const markEntry = async (ticketId: string) => {
  const response = await api.post(`/admin/toggle-entry-marked/${ticketId}`);
  return response.data;
};