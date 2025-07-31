"use client";

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: 'super_admin' | 'admin' | 'moderator' | 'viewer';
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export default function RoleBasedAccess({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback = null,
  loadingFallback = null 
}: RoleBasedAccessProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is authenticated
        if (!auth.isAdmin()) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Check role-based access
        if (requiredRole) {
          const userRole = auth.getUserRole();
          const roleHierarchy = {
            'super_admin': 4,
            'admin': 3,
            'moderator': 2,
            'viewer': 1
          };
          
          const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
          const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
          
          if (userRoleLevel < requiredRoleLevel) {
            setHasAccess(false);
            setIsLoading(false);
            return;
          }
        }

        // Check permission-based access
        if (requiredPermission) {
          const hasPermission = await auth.hasPermission(requiredPermission);
          setHasAccess(hasPermission);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredPermission, requiredRole]);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function SuperAdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedAccess requiredRole="super_admin" fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function AdminOrHigher({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedAccess requiredRole="admin" fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function ModeratorOrHigher({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedAccess requiredRole="moderator" fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function WithPermission({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <RoleBasedAccess requiredPermission={permission} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
} 