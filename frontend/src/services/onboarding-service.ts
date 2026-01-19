/**
 * Onboarding service for tracking admin onboarding progress
 */

export interface OnboardingSection {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  component?: string; // Component/page where this appears
}

export const ONBOARDING_SECTIONS: OnboardingSection[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'This is your main dashboard showing system health metrics, alerts, and quick actions.',
    component: 'DashboardHome',
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage all users, assign roles, suspend accounts, and view user details. Use filters to find specific users quickly.',
    component: 'UserManagement',
  },
  {
    id: 'role-management',
    title: 'Role & Permission Management',
    description: 'Assign admin levels (super_admin, admin, support), change user roles, and manage permissions. Only super admins can modify other admins.',
    component: 'UserManagement',
    targetSelector: '.admin-level-badge',
  },
  {
    id: 'suspension',
    title: 'User Suspension',
    description: 'Suspend users temporarily with a reason. Suspended users cannot access the system. You can reactivate them later.',
    component: 'UserManagement',
    targetSelector: 'button[title="Suspend User"]',
  },
  {
    id: 'bookings',
    title: 'Booking Management',
    description: 'View all bookings, assign drivers, and track booking status. Filter by status, date, or user.',
    component: 'ManageBookings',
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'View user growth, booking trends, revenue metrics, and peak usage patterns. Use date filters to analyze specific periods.',
    component: 'Analytics',
  },
  {
    id: 'financial',
    title: 'Financial Overview',
    description: 'Monitor revenue, payment status, and financial breakdowns by car wash provider. All financial data is read-only.',
    component: 'FinancialOverview',
  },
  {
    id: 'feature-flags',
    title: 'Feature Flags',
    description: 'Enable or disable features without redeployment. Use gradual rollouts to test features safely. Changes take effect immediately.',
    component: 'FeatureFlags',
  },
  {
    id: 'compliance',
    title: 'Compliance & Data Governance',
    description: 'Manage data retention policies, review user data, and anonymize data for GDPR compliance. Super Admin only for sensitive operations.',
    component: 'Compliance',
  },
  {
    id: 'incidents',
    title: 'Incident Management',
    description: 'Create, track, and resolve system incidents. Assign incidents to team members and add updates as you work on them.',
    component: 'Incidents',
  },
  {
    id: 'audit-logs',
    title: 'Audit Logs',
    description: 'View complete audit trail of all admin actions. Filter by action type, entity, or date range. Logs are read-only and tamper-resistant.',
    component: 'AuditLogs',
  },
  {
    id: 'alerts',
    title: 'System Alerts',
    description: 'Monitor system health with alerts for suspended users, stuck bookings, failed payments, and inactive drivers. Click alerts to view details.',
    component: 'DashboardHome',
    targetSelector: '.alerts-panel',
  },
];

export class OnboardingService {
  private static STORAGE_KEY = 'admin_onboarding_completed';
  private static STORAGE_KEY_SKIPPED = 'admin_onboarding_skipped';

  /**
   * Get completed sections from localStorage
   */
  static getCompletedSections(): string[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Mark section as completed
   */
  static completeSection(sectionId: string): void {
    if (typeof window === 'undefined') return;
    const completed = this.getCompletedSections();
    if (!completed.includes(sectionId)) {
      completed.push(sectionId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completed));
    }
  }

  /**
   * Check if section is completed
   */
  static isSectionCompleted(sectionId: string): boolean {
    return this.getCompletedSections().includes(sectionId);
  }

  /**
   * Check if onboarding is skipped
   */
  static isSkipped(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.STORAGE_KEY_SKIPPED) === 'true';
  }

  /**
   * Skip onboarding
   */
  static skipOnboarding(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY_SKIPPED, 'true');
  }

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  static resetOnboarding(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY_SKIPPED);
  }

  /**
   * Get next incomplete section for current component
   */
  static getNextSection(componentName: string): OnboardingSection | null {
    const completed = this.getCompletedSections();
    return (
      ONBOARDING_SECTIONS.find(
        (section) =>
          section.component === componentName && !completed.includes(section.id)
      ) || null
    );
  }

  /**
   * Get all sections for a component
   */
  static getSectionsForComponent(componentName: string): OnboardingSection[] {
    return ONBOARDING_SECTIONS.filter((section) => section.component === componentName);
  }
}
