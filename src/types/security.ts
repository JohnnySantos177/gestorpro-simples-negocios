
export interface SecurityAuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RLSPolicy {
  name: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  condition: string;
}

export interface AdminPermission {
  user_id: string;
  permission_type: 'admin_mestre' | 'super_admin';
  granted_at: string;
  granted_by: string;
}

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityValidation {
  level: SecurityLevel;
  passed: boolean;
  message: string;
  recommendation?: string;
}
