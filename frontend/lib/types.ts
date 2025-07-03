export interface PartnershipInquiry {
  id: string;
  full_name: string;
  email: string;
  company: string;
  message?: string;
  created_at: string;
  status?: 'pending' | 'accepted' | 'rejected';
} 