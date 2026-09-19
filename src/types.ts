export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  username: string;
  password?: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus = 'in_progress' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  customerId: string;
  customerName?: string;
  title: string;
  safeType: string;
  dimensions: string;
  weight: string;
  lockType: string;
  status: ProjectStatus;
  startDate: string;
  estimatedDelivery: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  stagesCount?: number;
  unreadMessagesCount?: number;
}

export interface ProjectStage {
  id: string;
  projectId: string;
  title: string;
  description: string;
  imageUrl: string;
  completed: boolean;
  date: string;
  order: number;
  createdAt: string;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  sender: 'customer' | 'admin';
  senderName: string;
  content: string;
  replyToId?: string | null;
  replyToContent?: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface UserPermissions {
  canManageProjects: boolean;
  canCreateProject: boolean;
  canEditStages: boolean;
  canUploadStageMedia: boolean;
  canManageCustomers: boolean;
  canManageSettings: boolean;
  canExportReports: boolean;
  canSendChatMessages: boolean;
  canViewAllProjects: boolean;
}

export interface AdminNotification {
  id: string;
  projectId: string;
  projectTitle: string;
  customerName: string;
  customerPhone?: string;
  content: string;
  createdAt: string;
}

export interface AuthSession {
  role: 'admin' | 'customer';
  id: string;
  username: string;
  name: string;
  token: string;
  permissions?: UserPermissions;
}
