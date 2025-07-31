"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { auth } from '@/lib/auth';
import { User, Plus, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    setLoading(true);
    try {
      // Add retry mechanism
      let users = [];
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to load admin users`);
          users = await auth.listAdminUsers();
          if (users && Array.isArray(users)) {
            console.log(`✅ Successfully loaded ${users.length} admin users`);
            break; // Success, exit retry loop
          } else {
            console.warn('⚠️ Invalid response format, retrying...');
            retryCount++;
          }
        } catch (error) {
          console.warn(`Retry ${retryCount + 1}/${maxRetries} failed:`, error);
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error; // Final attempt failed
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      setAdminUsers(users);
      if (users.length === 0) {
        setActionResult({ type: 'error', message: 'No admin users found. Database might not be initialized.' });
      } else {
        setActionResult(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Failed to load admin users:', error);
      setActionResult({ type: 'error', message: 'Failed to load admin users. Please check your connection.' });
      setAdminUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const addNewAdmin = async () => {
    if (!newEmail || !newPassword) {
      setActionResult({ type: 'error', message: 'Please provide both email and password' });
      return;
    }

    try {
      const success = await auth.addAdminUser(newEmail, newPassword);
      if (success) {
        setActionResult({ type: 'success', message: `Admin user created: ${newEmail}` });
        setNewEmail('');
        setNewPassword('');
        await loadAdminUsers();
      } else {
        setActionResult({ type: 'error', message: 'Failed to create admin user' });
      }
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600">Manage admin users and credentials in real-time</p>
        </div>
        <Button onClick={loadAdminUsers} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {actionResult && (
        <div className={`p-4 rounded-lg ${
          actionResult.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {actionResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Admin Users ({adminUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : adminUsers.length > 0 ? (
                adminUsers.map((user, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{user.email}</div>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                      {user.last_login && (
                        <div>Last Login: {new Date(user.last_login).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No admin users found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newadmin@beaufort.app"
                />
              </div>

              <div>
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="secure-password-123"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={addNewAdmin} 
                className="w-full"
                disabled={!newEmail || !newPassword}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Admin User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 