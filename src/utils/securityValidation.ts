
import { UserProfile } from "@/types";
import { SecurityValidation, SecurityLevel } from "@/types/security";

export const validateUserSecurity = (profile: UserProfile | null): SecurityValidation[] => {
  const validations: SecurityValidation[] = [];

  // Validate profile existence
  if (!profile) {
    validations.push({
      level: 'critical',
      passed: false,
      message: 'User profile not found',
      recommendation: 'Ensure user profile is properly loaded'
    });
    return validations;
  }

  // Validate admin permissions
  if (profile.tipo_usuario === 'admin_mestre' && !profile.is_super_admin) {
    validations.push({
      level: 'high',
      passed: false,
      message: 'Admin user without super admin flag',
      recommendation: 'Update admin permissions for consistency'
    });
  }

  // Validate plan consistency
  if (profile.tipo_usuario === 'admin_mestre' && profile.tipo_plano !== 'premium') {
    validations.push({
      level: 'medium',
      passed: false,
      message: 'Admin user without premium plan',
      recommendation: 'Admin users should have premium access'
    });
  }

  // Validate required fields
  if (!profile.nome || profile.nome.trim() === '') {
    validations.push({
      level: 'low',
      passed: false,
      message: 'User name is empty',
      recommendation: 'Require user to complete profile'
    });
  }

  return validations;
};

export const getSecurityScore = (validations: SecurityValidation[]): number => {
  const totalValidations = validations.length;
  const passedValidations = validations.filter(v => v.passed).length;
  
  if (totalValidations === 0) return 100;
  
  return Math.round((passedValidations / totalValidations) * 100);
};

export const getHighestSecurityLevel = (validations: SecurityValidation[]): SecurityLevel => {
  const failedValidations = validations.filter(v => !v.passed);
  
  if (failedValidations.some(v => v.level === 'critical')) return 'critical';
  if (failedValidations.some(v => v.level === 'high')) return 'high';
  if (failedValidations.some(v => v.level === 'medium')) return 'medium';
  if (failedValidations.some(v => v.level === 'low')) return 'low';
  
  return 'low';
};
