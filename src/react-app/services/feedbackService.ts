// File: ./src/services/feedbackService.ts

export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature';
  title: string;
  description: string;
  appVersion: string;
  browserInfo?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface AdminFeedback extends Feedback {
  email?: string;
}

export interface CreateFeedbackData {
  id: string;
  type: 'bug' | 'feature';
  title: string;
  description: string;
  appVersion: string;
  browserInfo?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

const API_BASE = '/api/v1';

export const fetchFeedback = async (token: string): Promise<Feedback[]> => {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }

  const data = (await response.json()) as { feedback: Feedback[] };
  return data.feedback;
};

export const createFeedback = async (
  token: string,
  data: CreateFeedbackData,
): Promise<Feedback> => {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create feedback');
  }

  return (await response.json()) as Feedback;
};

export const updateFeedback = async (
  token: string,
  id: string,
  expectedVersion: number,
  patch: Partial<Pick<Feedback, 'title' | 'description' | 'status' | 'priority'>>,
): Promise<Feedback> => {
  const response = await fetch(`${API_BASE}/feedback/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ expectedVersion, patch }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('CONFLICT');
    }
    throw new Error(error.error || 'Failed to update feedback');
  }

  return (await response.json()) as Feedback;
};

export const fetchAdminFeedback = async (token: string): Promise<AdminFeedback[]> => {
  const response = await fetch(`${API_BASE}/admin/feedback`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }

  const data = (await response.json()) as { feedback: AdminFeedback[] };
  return data.feedback;
};

export const updateAdminFeedback = async (
  token: string,
  id: string,
  expectedVersion: number,
  patch: Partial<Pick<Feedback, 'title' | 'description' | 'status' | 'priority'>>,
): Promise<AdminFeedback> => {
  const response = await fetch(`${API_BASE}/admin/feedback/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ expectedVersion, patch }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('CONFLICT');
    }
    throw new Error(error.error || 'Failed to update feedback');
  }

  return (await response.json()) as AdminFeedback;
};

export const getAppVersion = async (): Promise<{ version: string; name: string }> => {
  const response = await fetch(`${API_BASE}/app-version`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch app version');
  }

  return (await response.json()) as { version: string; name: string };
};
