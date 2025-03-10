import axios from "axios";
import { Bill, Offer, PaginatedBillsResponse, PaginatedResponse, TicketPricing } from "../types/ticket";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/login", { email, password });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/logout");

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const getTickets = async (page: number): Promise<PaginatedResponse> => {
  const response = await api.get(`/admin/tickets`, {
    params: {
      page,
    },
  });
  return response.data;
};

export const getAttendees = async (page: number): Promise<PaginatedResponse> => {
  const response = await api.get(`/admin/attendees`, {
    params: {
      page,
    },
  });
  return response.data;
};

export const searchTickets = async (query: string, filter?: object): Promise<any> => {
  const response = await api.get(`admin/tickets/fuzzy`, {
    params: {
      query,
      ...filter
    },
  });
  return response.data;
}

export const searchAttendees = async (query: string): Promise<any> => {
  return searchTickets(query, { ticket_given: true });
};

export const verifyPayment = async (ticketId: string) => {
  const response = await api.post(`/admin/verify-payment/${ticketId}`);
  return response.data;
};

export const markTicketGiven = async (
  ticketId: string,
  ticketNumber: string
) => {
  const response = await api.post(`/admin/mark-ticket-given/${ticketId}`, {
    ticketNumber,
  });
  return response.data;
};

export const getEmailTemplates = async () => {
  const response = await api.get("/admin/email-templates");
  return response.data.templates;
};

export const sendBulkEmails = async (templateId: string) => {
  const response = await api.post("/admin/send-bulk-emails", {
    templateId,
  });
  return response.data;
};

export const uploadPaymentProof = async (ticketId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", ticketId);

  const response = await api.post("/admin/tickets/finalize", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const markEntry = async (ticketId: string) => {
  const response = await api.post(`/admin/toggle-entry-marked/${ticketId}`);
  return response.data;
};

export const whoami = async () => {
  try {
    const response = await api.get(`/admin/whoami`);
    return response.data || null;
  } catch {
    return null;
  }
};

export const getCurrentTicketPricing = async (): Promise<TicketPricing> => {
  const response = await api.get('/admin/offers/active');
  return response.data;
};

export const updateTicketPricing = async (pricing: TicketPricing): Promise<TicketPricing> => {
  const response = await api.put('/admin/ticket-pricing', pricing);
  return response.data;
};

export const getAnalytics = async (): Promise<any> => {
  const response = await api.get('/admin/ticket-analytics');
  return response.data;
};

export const getOffers = async (): Promise<Offer[]> => {
  const response = await api.get('/admin/offers/list');
  return response.data;
};

export const addOffer = async (offer: { offer: string; price: string }): Promise<Offer> => {
  const response = await api.post('/admin/offers', offer);
  return response.data;
};

export const setActiveOffer = async (offerId: string, currentOfferId: string): Promise<void> => {
  await api.patch('/admin/offers/active', { offerId, currentOfferId });
};

export const deleteOffer = async (offerId: string): Promise<void> => {
  await api.delete(`/admin/offers/${offerId}`);
};

export const addAdmin = async (email: string): Promise<void> => {
  await api.post('/admin/add', { email });
};

export const getAdmins = async () => {
  const response = await api.get('/admin/list');
  return response.data;
};

export const resetPassword = async (password: string) => {
  try {
    const response = await api.post("/admin/reset-password", { 
      password
    });
    return response.data;
  } catch (error) {
    console.error("Password reset failed:", error);
    throw error;
  }
};

export const getCacheStatus = async (): Promise<{ cacheEnabled: boolean }> => {
  const response = await api.get('/admin/cache-status');
  return response.data;
};

export const toggleCache = async (enabled: boolean): Promise<void> => {
  await api.post('/admin/toggle-cache', { enabled });
}

export const getBills = async (page: number): Promise<PaginatedBillsResponse> => {
  const response = await api.get(`/admin/bills`, {
    params: { page },
  });
  return response.data;
};

export const uploadBill = async (formData: FormData): Promise<Bill> => {
  const response = await api.post('/admin/bills', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};