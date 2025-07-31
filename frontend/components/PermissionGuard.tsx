"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield, ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export default function PermissionGuard({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback = null,
  showMessage = true 
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
            'viewer': 1,
            'hr': 2 // HR has same level as moderator
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (!showMessage) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this feature. This area is restricted based on your current role and permissions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-medium text-blue-900 mb-1">Need Access?</h3>
                    <p className="text-sm text-blue-700">
                      Contact your system administrator to request access to this feature.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button 
                  onClick={() => router.push('/admin/dashboard')}
                  className="flex-1"
                >
                  Dashboard
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span>Contact: admin@emiliobeaufort.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
} 